import { vi, expect, test, beforeEach, afterEach, describe } from 'vitest'

vi.mock('../prisma', () => ({
  prisma: {
    week: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
    place: {
      findMany: vi.fn(),
    },
    member: {
      findMany: vi.fn(),
    },
    group: {
      findMany: vi.fn(),
    },
    dutyAssignment: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}))

vi.mock('../week', () => ({
  getWeekStart: vi.fn().mockReturnValue(new Date('2024-01-01T00:00:00Z')),
}))

import {
  regenerateThisWeekAssignments,
  advanceCurrentWeekRotation,
  autoRotateIfNeeded,
} from '../rotation'
import { prisma } from '../prisma'

// モックされたprismaを型アサーション
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prismaMock = prisma as any

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))
  vi.clearAllMocks()

  // デフォルトのモック設定
  prismaMock.week.upsert.mockResolvedValue({ id: 1 })
  prismaMock.week.findUnique.mockResolvedValue(null)
  prismaMock.group.findMany.mockResolvedValue([])
  prismaMock.member.findMany.mockResolvedValue([])
  prismaMock.place.findMany.mockResolvedValue([])
  prismaMock.dutyAssignment.findMany.mockResolvedValue([])
  prismaMock.dutyAssignment.create.mockResolvedValue({})
  prismaMock.dutyAssignment.deleteMany.mockResolvedValue({})
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('regenerateThisWeekAssignments', () => {
  test('グループが存在しない場合は未グループのメンバーと場所で割り当てを作成する', async () => {
    // Arrange
    prismaMock.group.findMany.mockResolvedValue([])
    prismaMock.member.findMany.mockResolvedValue([
      { id: 10, groupId: null },
      { id: 20, groupId: null },
    ])
    prismaMock.place.findMany.mockResolvedValue([
      { id: 1, groupId: null },
      { id: 2, groupId: null },
    ])

    // Act
    await regenerateThisWeekAssignments()

    // Assert
    expect(prismaMock.dutyAssignment.deleteMany).toHaveBeenCalledWith({
      where: { weekId: 1 },
    })
    expect(prismaMock.dutyAssignment.create).toHaveBeenCalledTimes(2)
    expect(prismaMock.dutyAssignment.create).toHaveBeenNthCalledWith(1, {
      data: { weekId: 1, placeId: 1, memberId: 10 },
    })
    expect(prismaMock.dutyAssignment.create).toHaveBeenNthCalledWith(2, {
      data: { weekId: 1, placeId: 2, memberId: 20 },
    })
  })

  test('グループが存在する場合はグループ内でローテーションを作成する', async () => {
    // Arrange
    prismaMock.group.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'グループA',
        members: [{ id: 10 }, { id: 20 }, { id: 30 }],
        places: [{ id: 1 }, { id: 2 }],
      },
    ])
    prismaMock.member.findMany.mockResolvedValue([])
    prismaMock.place.findMany.mockResolvedValue([])

    // Act
    await regenerateThisWeekAssignments()

    // Assert
    expect(prismaMock.dutyAssignment.create).toHaveBeenCalledTimes(2)
    expect(prismaMock.dutyAssignment.create).toHaveBeenNthCalledWith(1, {
      data: { weekId: 1, placeId: 1, memberId: 10 },
    })
    expect(prismaMock.dutyAssignment.create).toHaveBeenNthCalledWith(2, {
      data: { weekId: 1, placeId: 2, memberId: 20 },
    })
  })

  test('メンバーが場所より少ない場合は循環して割り当てる', async () => {
    // Arrange
    prismaMock.group.findMany.mockResolvedValue([])
    prismaMock.member.findMany.mockResolvedValue([{ id: 10, groupId: null }])
    prismaMock.place.findMany.mockResolvedValue([
      { id: 1, groupId: null },
      { id: 2, groupId: null },
      { id: 3, groupId: null },
    ])

    // Act
    await regenerateThisWeekAssignments()

    // Assert
    expect(prismaMock.dutyAssignment.create).toHaveBeenCalledTimes(3)
    expect(prismaMock.dutyAssignment.create).toHaveBeenNthCalledWith(1, {
      data: { weekId: 1, placeId: 1, memberId: 10 },
    })
    expect(prismaMock.dutyAssignment.create).toHaveBeenNthCalledWith(2, {
      data: { weekId: 1, placeId: 2, memberId: 10 },
    })
    expect(prismaMock.dutyAssignment.create).toHaveBeenNthCalledWith(3, {
      data: { weekId: 1, placeId: 3, memberId: 10 },
    })
  })

  test('メンバーまたは場所が0の場合は割り当てを作成しない', async () => {
    // Arrange
    prismaMock.group.findMany.mockResolvedValue([])
    prismaMock.member.findMany.mockResolvedValue([])
    prismaMock.place.findMany.mockResolvedValue([])

    // Act
    await regenerateThisWeekAssignments()

    // Assert
    expect(prismaMock.dutyAssignment.create).not.toHaveBeenCalled()
  })
})

describe('advanceCurrentWeekRotation', () => {
  test('割り当てが存在しない場合は新規作成する', async () => {
    // Arrange
    prismaMock.group.findMany.mockResolvedValue([])
    prismaMock.member.findMany.mockResolvedValue([
      { id: 10, groupId: null },
      { id: 20, groupId: null },
    ])
    prismaMock.place.findMany.mockResolvedValue([
      { id: 1, groupId: null },
      { id: 2, groupId: null },
    ])
    prismaMock.dutyAssignment.findMany.mockResolvedValue([])

    // Act
    await advanceCurrentWeekRotation()

    // Assert
    expect(prismaMock.dutyAssignment.create).toHaveBeenCalledTimes(2)
    expect(prismaMock.dutyAssignment.deleteMany).not.toHaveBeenCalled()
  })

  test('既存の割り当てがある場合はローテーションを進める', async () => {
    // Arrange
    prismaMock.group.findMany.mockResolvedValue([])
    prismaMock.member.findMany.mockResolvedValue([
      { id: 10, groupId: null },
      { id: 20, groupId: null },
      { id: 30, groupId: null },
    ])
    prismaMock.place.findMany.mockResolvedValue([
      { id: 1, groupId: null },
      { id: 2, groupId: null },
    ])
    prismaMock.dutyAssignment.findMany.mockResolvedValue([
      { placeId: 1, memberId: 10 },
      { placeId: 2, memberId: 20 },
    ])

    // Act
    await advanceCurrentWeekRotation()

    // Assert
    expect(prismaMock.dutyAssignment.deleteMany).toHaveBeenCalledWith({
      where: { weekId: 1, place: { groupId: null } },
    })
    expect(prismaMock.dutyAssignment.create).toHaveBeenCalledTimes(2)
    // ローテーション: 最初のメンバー(10)の前のメンバー(30)から開始
    expect(prismaMock.dutyAssignment.create).toHaveBeenNthCalledWith(1, {
      data: { weekId: 1, placeId: 1, memberId: 30 },
    })
    expect(prismaMock.dutyAssignment.create).toHaveBeenNthCalledWith(2, {
      data: { weekId: 1, placeId: 2, memberId: 10 },
    })
  })

  test('グループ別に独立してローテーションを処理する', async () => {
    // Arrange
    prismaMock.group.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'グループA',
        members: [{ id: 10 }, { id: 20 }],
        places: [{ id: 1 }],
      },
    ])
    prismaMock.member.findMany.mockResolvedValue([])
    prismaMock.place.findMany.mockResolvedValue([])
    prismaMock.dutyAssignment.findMany.mockResolvedValue([
      { placeId: 1, memberId: 10 },
    ])

    // Act
    await advanceCurrentWeekRotation()

    // Assert
    expect(prismaMock.dutyAssignment.deleteMany).toHaveBeenCalledWith({
      where: { weekId: 1, place: { groupId: 1 } },
    })
    expect(prismaMock.dutyAssignment.create).toHaveBeenCalledWith({
      data: { weekId: 1, placeId: 1, memberId: 20 },
    })
  })
})

describe('autoRotateIfNeeded', () => {
  test('今週の割り当てが既に存在する場合は何もしない', async () => {
    // Arrange
    const weekStart = new Date('2024-01-01T00:00:00Z')
    prismaMock.week.findUnique.mockResolvedValue({
      id: 1,
      assignments: [{ id: 1 }],
    })

    // Act
    await autoRotateIfNeeded(weekStart)

    // Assert
    expect(prismaMock.dutyAssignment.create).not.toHaveBeenCalled()
  })

  test('前週の割り当てが存在しない場合は新規作成する', async () => {
    // Arrange
    const weekStart = new Date('2024-01-08T00:00:00Z')
    prismaMock.week.findUnique
      .mockResolvedValueOnce(null) // 今週
      .mockResolvedValueOnce(null) // 前週
    prismaMock.week.upsert.mockResolvedValue({ id: 2 })
    prismaMock.group.findMany.mockResolvedValue([])
    prismaMock.member.findMany.mockResolvedValue([{ id: 10, groupId: null }])
    prismaMock.place.findMany.mockResolvedValue([{ id: 1, groupId: null }])

    // Act
    await autoRotateIfNeeded(weekStart)

    // Assert
    expect(prismaMock.dutyAssignment.create).toHaveBeenCalledWith({
      data: { weekId: 2, placeId: 1, memberId: 10 },
    })
  })

  test('前週の割り当てを基にローテーションを作成する', async () => {
    // Arrange
    const weekStart = new Date('2024-01-08T00:00:00Z')
    prismaMock.week.findUnique
      .mockResolvedValueOnce(null) // 今週
      .mockResolvedValueOnce({
        // 前週
        id: 1,
        assignments: [
          {
            member: { id: 10 },
            place: { groupId: null },
          },
          {
            member: { id: 20 },
            place: { groupId: null },
          },
          {
            member: { id: 30 },
            place: { groupId: null },
          },
        ],
      })
    prismaMock.week.upsert.mockResolvedValue({ id: 2 })
    prismaMock.group.findMany.mockResolvedValue([])
    // 未グループのメンバーを設定（fetchGroups関数で使用される）
    prismaMock.member.findMany.mockResolvedValue([
      { id: 10, groupId: null },
      { id: 20, groupId: null },
      { id: 30, groupId: null },
    ])
    prismaMock.place.findMany.mockResolvedValue([
      { id: 1, groupId: null },
      { id: 2, groupId: null },
      { id: 3, groupId: null },
    ])

    // Act
    await autoRotateIfNeeded(weekStart)

    // Assert
    expect(prismaMock.dutyAssignment.create).toHaveBeenCalledTimes(3)
    // ローテーション: 最後のメンバー(30)が最初に来る
    expect(prismaMock.dutyAssignment.create).toHaveBeenNthCalledWith(1, {
      data: { weekId: 2, placeId: 1, memberId: 30 },
    })
    expect(prismaMock.dutyAssignment.create).toHaveBeenNthCalledWith(2, {
      data: { weekId: 2, placeId: 2, memberId: 10 },
    })
    expect(prismaMock.dutyAssignment.create).toHaveBeenNthCalledWith(3, {
      data: { weekId: 2, placeId: 3, memberId: 20 },
    })
  })

  test('グループ別に独立してローテーションを処理する', async () => {
    // Arrange
    const weekStart = new Date('2024-01-08T00:00:00Z')
    prismaMock.week.findUnique
      .mockResolvedValueOnce(null) // 今週
      .mockResolvedValueOnce({
        // 前週
        id: 1,
        assignments: [
          {
            member: { id: 10 },
            place: { groupId: 1 },
          },
          {
            member: { id: 20 },
            place: { groupId: 1 },
          },
        ],
      })
    prismaMock.week.upsert.mockResolvedValue({ id: 2 })
    prismaMock.group.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'グループA',
        members: [{ id: 10 }, { id: 20 }],
        places: [
          { id: 1, groupId: 1 },
          { id: 2, groupId: 1 },
        ],
      },
    ])
    prismaMock.member.findMany.mockResolvedValue([])
    prismaMock.place.findMany.mockResolvedValue([])

    // Act
    await autoRotateIfNeeded(weekStart)

    // Assert
    expect(prismaMock.dutyAssignment.create).toHaveBeenCalledTimes(2)
    // ローテーション: 最後のメンバー(20)が最初に来る
    expect(prismaMock.dutyAssignment.create).toHaveBeenNthCalledWith(1, {
      data: { weekId: 2, placeId: 1, memberId: 20 },
    })
    expect(prismaMock.dutyAssignment.create).toHaveBeenNthCalledWith(2, {
      data: { weekId: 2, placeId: 2, memberId: 10 },
    })
  })
})

describe('エッジケース', () => {
  test('メンバーが0人の場合は割り当てを作成しない', async () => {
    // Arrange
    prismaMock.group.findMany.mockResolvedValue([])
    prismaMock.member.findMany.mockResolvedValue([])
    prismaMock.place.findMany.mockResolvedValue([{ id: 1, groupId: null }])

    // Act
    await regenerateThisWeekAssignments()

    // Assert
    expect(prismaMock.dutyAssignment.create).not.toHaveBeenCalled()
  })

  test('場所が0つの場合は割り当てを作成しない', async () => {
    // Arrange
    prismaMock.group.findMany.mockResolvedValue([])
    prismaMock.member.findMany.mockResolvedValue([{ id: 10, groupId: null }])
    prismaMock.place.findMany.mockResolvedValue([])

    // Act
    await regenerateThisWeekAssignments()

    // Assert
    expect(prismaMock.dutyAssignment.create).not.toHaveBeenCalled()
  })

  test('グループにメンバーがいない場合はそのグループをスキップする', async () => {
    // Arrange
    prismaMock.group.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'グループA',
        members: [],
        places: [{ id: 1 }],
      },
    ])
    prismaMock.member.findMany.mockResolvedValue([])
    prismaMock.place.findMany.mockResolvedValue([])

    // Act
    await regenerateThisWeekAssignments()

    // Assert
    expect(prismaMock.dutyAssignment.create).not.toHaveBeenCalled()
  })

  test('グループに場所がない場合はそのグループをスキップする', async () => {
    // Arrange
    prismaMock.group.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'グループA',
        members: [{ id: 10 }],
        places: [],
      },
    ])
    prismaMock.member.findMany.mockResolvedValue([])
    prismaMock.place.findMany.mockResolvedValue([])

    // Act
    await regenerateThisWeekAssignments()

    // Assert
    expect(prismaMock.dutyAssignment.create).not.toHaveBeenCalled()
  })
})
