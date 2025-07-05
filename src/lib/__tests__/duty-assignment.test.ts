import { vi, expect, test, beforeEach, afterEach, describe } from 'vitest'

vi.mock('../prisma', () => ({
  prisma: {
    week: {
      findUnique: vi.fn(),
    },
    group: {
      findMany: vi.fn(),
    },
    member: {
      findMany: vi.fn(),
    },
    place: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('../rotation', () => ({
  autoRotateIfNeeded: vi.fn(),
}))

vi.mock('../week', () => ({
  getWeekStart: vi.fn(),
}))

import { getDutyAssignmentData } from '../duty-assignment'
import { prisma } from '../prisma'
import { autoRotateIfNeeded } from '../rotation'
import { getWeekStart } from '../week'

// モックされたprismaを型アサーション
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prismaMock = prisma as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const autoRotateIfNeededMock = autoRotateIfNeeded as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getWeekStartMock = getWeekStart as any

beforeEach(() => {
  vi.clearAllMocks()

  // デフォルトのモック設定
  getWeekStartMock.mockReturnValue(new Date('2024-01-01T00:00:00Z'))
  autoRotateIfNeededMock.mockResolvedValue(undefined)
  prismaMock.week.findUnique.mockResolvedValue(null)
  prismaMock.group.findMany.mockResolvedValue([])
  prismaMock.member.findMany.mockResolvedValue([])
  prismaMock.place.findMany.mockResolvedValue([])
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getDutyAssignmentData', () => {
  test('データが存在しない場合は空のデータを返す', async () => {
    // Arrange
    prismaMock.week.findUnique.mockResolvedValue(null)
    prismaMock.group.findMany.mockResolvedValue([])
    prismaMock.member.findMany.mockResolvedValue([])
    prismaMock.place.findMany.mockResolvedValue([])

    // Act
    const result = await getDutyAssignmentData()

    // Assert
    expect(result.weekStart).toEqual(new Date('2024-01-01T00:00:00Z'))
    expect(result.members).toEqual([])
    expect(result.groupedAssignments).toEqual([
      { name: '未割当', places: [], noneMembers: [] },
    ])
  })

  test('基本的なデータが存在する場合は正しく処理される', async () => {
    // Arrange
    const mockMembers = [
      { id: 10, name: 'メンバー1', groupId: null, group: null },
      { id: 20, name: 'メンバー2', groupId: null, group: null },
      { id: 30, name: 'メンバー3', groupId: null, group: null },
    ]
    const mockPlaces = [
      { id: 1, name: '場所1', groupId: null, group: null },
      { id: 2, name: '場所2', groupId: null, group: null },
    ]
    const mockWeek = {
      id: 1,
      assignments: [
        {
          placeId: 1,
          place: { id: 1, name: '場所1', groupId: null },
          member: { id: 10, name: 'メンバー1', groupId: null },
        },
        {
          placeId: 2,
          place: { id: 2, name: '場所2', groupId: null },
          member: { id: 20, name: 'メンバー2', groupId: null },
        },
      ],
    }

    prismaMock.week.findUnique.mockResolvedValue(mockWeek)
    prismaMock.group.findMany.mockResolvedValue([])
    prismaMock.member.findMany.mockResolvedValue(mockMembers)
    prismaMock.place.findMany.mockResolvedValue(mockPlaces)

    // Act
    const result = await getDutyAssignmentData()

    // Assert
    expect(result.weekStart).toEqual(new Date('2024-01-01T00:00:00Z'))
    expect(result.members).toEqual(mockMembers)
    expect(result.groupedAssignments).toEqual([
      {
        name: '未割当',
        places: [
          {
            place: mockPlaces[0],
            member: { id: 10, name: 'メンバー1', groupId: null },
          },
          {
            place: mockPlaces[1],
            member: { id: 20, name: 'メンバー2', groupId: null },
          },
        ],
        noneMembers: [mockMembers[2]],
      },
    ])
  })

  test('グループが存在する場合は正しくグループ化される', async () => {
    // Arrange
    const mockGroup = { id: 1, name: 'グループA' }
    const mockWeek = {
      id: 1,
      assignments: [
        {
          placeId: 1,
          place: { id: 1, name: '場所1', groupId: 1 },
          member: { id: 10, name: 'メンバー1', groupId: 1 },
        },
      ],
    }
    const mockMembers = [
      { id: 10, name: 'メンバー1', groupId: 1, group: mockGroup },
      { id: 20, name: 'メンバー2', groupId: 1, group: mockGroup },
      { id: 30, name: 'メンバー3', groupId: null, group: null },
    ]
    const mockPlaces = [
      { id: 1, name: '場所1', groupId: 1, group: mockGroup },
      { id: 2, name: '場所2', groupId: null, group: null },
    ]

    prismaMock.week.findUnique.mockResolvedValue(mockWeek)
    prismaMock.group.findMany.mockResolvedValue([mockGroup])
    prismaMock.member.findMany.mockResolvedValue(mockMembers)
    prismaMock.place.findMany.mockResolvedValue(mockPlaces)

    // Act
    const result = await getDutyAssignmentData()

    // Assert
    expect(result.groupedAssignments).toEqual([
      {
        name: 'グループA',
        places: [
          {
            place: mockPlaces[0],
            member: { id: 10, name: 'メンバー1', groupId: 1 },
          },
        ],
        noneMembers: [mockMembers[1]],
      },
      {
        name: '未割当',
        places: [{ place: mockPlaces[1], member: null }],
        noneMembers: [mockMembers[2]],
      },
    ])
  })

  test('場所に割り当てがない場合はmemberがnullになる', async () => {
    // Arrange
    const mockMembers = [
      { id: 10, name: 'メンバー1', groupId: null, group: null },
    ]
    const mockPlaces = [{ id: 1, name: '場所1', groupId: null, group: null }]

    prismaMock.week.findUnique.mockResolvedValue({ id: 1, assignments: [] })
    prismaMock.group.findMany.mockResolvedValue([])
    prismaMock.member.findMany.mockResolvedValue(mockMembers)
    prismaMock.place.findMany.mockResolvedValue(mockPlaces)

    // Act
    const result = await getDutyAssignmentData()

    // Assert
    expect(result.groupedAssignments).toEqual([
      {
        name: '未割当',
        places: [{ place: mockPlaces[0], member: null }],
        noneMembers: [mockMembers[0]],
      },
    ])
  })

  test('autoRotateIfNeededが正しく呼び出される', async () => {
    // Arrange
    const now = new Date('2024-01-15T10:00:00Z')
    const expectedWeekStart = new Date('2024-01-08T00:00:00Z')
    getWeekStartMock.mockReturnValue(expectedWeekStart)

    prismaMock.week.findUnique.mockResolvedValue(null)
    prismaMock.group.findMany.mockResolvedValue([])
    prismaMock.member.findMany.mockResolvedValue([])
    prismaMock.place.findMany.mockResolvedValue([])

    // Act
    await getDutyAssignmentData(now)

    // Assert
    expect(getWeekStartMock).toHaveBeenCalledWith(now)
    expect(autoRotateIfNeededMock).toHaveBeenCalledWith(expectedWeekStart)
  })

  test('複数のグループが存在する場合は正しく処理される', async () => {
    // Arrange
    const mockGroups = [
      { id: 1, name: 'グループA' },
      { id: 2, name: 'グループB' },
    ]
    const mockMembers = [
      { id: 10, name: 'メンバー1', groupId: 1, group: mockGroups[0] },
      { id: 20, name: 'メンバー2', groupId: 2, group: mockGroups[1] },
      { id: 30, name: 'メンバー3', groupId: null, group: null },
    ]
    const mockPlaces = [
      { id: 1, name: '場所1', groupId: 1, group: mockGroups[0] },
      { id: 2, name: '場所2', groupId: 2, group: mockGroups[1] },
      { id: 3, name: '場所3', groupId: null, group: null },
    ]

    prismaMock.week.findUnique.mockResolvedValue({ id: 1, assignments: [] })
    prismaMock.group.findMany.mockResolvedValue(mockGroups)
    prismaMock.member.findMany.mockResolvedValue(mockMembers)
    prismaMock.place.findMany.mockResolvedValue(mockPlaces)

    // Act
    const result = await getDutyAssignmentData()

    // Assert
    expect(result.groupedAssignments).toEqual([
      {
        name: 'グループA',
        places: [{ place: mockPlaces[0], member: null }],
        noneMembers: [mockMembers[0]],
      },
      {
        name: 'グループB',
        places: [{ place: mockPlaces[1], member: null }],
        noneMembers: [mockMembers[1]],
      },
      {
        name: '未割当',
        places: [{ place: mockPlaces[2], member: null }],
        noneMembers: [mockMembers[2]],
      },
    ])
  })
})
