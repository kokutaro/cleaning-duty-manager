import { vi, expect, test, beforeEach, afterEach, describe } from 'vitest'

// Prismaクライアントのモック化
vi.mock('@/lib/prisma', () => ({
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

// 外部依存関数のモック化
vi.mock('@/lib/rotation', () => ({
  autoRotateIfNeeded: vi.fn(),
}))

vi.mock('@/lib/week', () => ({
  getWeekStart: vi.fn().mockReturnValue(new Date('2024-01-01T00:00:00Z')),
}))

import { prisma } from '@/lib/prisma'
import { autoRotateIfNeeded } from '@/lib/rotation'
import { getWeekStart } from '@/lib/week'

// モックされたprismaを型アサーション
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prismaMock = prisma as any

// HomeContentコンポーネントのロジック部分を抽出したテスト用関数
async function getHomeContentData() {
  const now = new Date()
  const weekStart = getWeekStart(now)
  await autoRotateIfNeeded(weekStart)

  const week = await prisma.week.findUnique({
    where: { startDate: weekStart },
    include: {
      assignments: {
        include: {
          place: true,
          member: true,
        },
      },
    },
  })

  const groups = await prisma.group.findMany({ orderBy: { id: 'asc' } })
  const members = await prisma.member.findMany({
    include: { group: true },
    orderBy: { id: 'asc' },
  })
  const places = await prisma.place.findMany({
    include: { group: true },
    orderBy: { id: 'asc' },
  })

  const assignmentsByPlace = places.map(place => {
    const assignment = week?.assignments.find(a => a.placeId === place.id)
    return { place, member: assignment?.member ?? null }
  })

  const assignedIds = assignmentsByPlace
    .map(a => a.member?.id)
    .filter((id): id is number => id !== undefined)
  const unassignedMembers = members.filter(m => !assignedIds.includes(m.id))

  const allGroups = [...groups, { id: null as number | null, name: '未割当' }]

  const groupedAssignments = allGroups.map(g => ({
    name: g.name,
    places: assignmentsByPlace.filter(p => p.place.groupId === g.id),
    noneMembers: unassignedMembers.filter(m => m.groupId === g.id),
  }))

  return {
    weekStart,
    members,
    groupedAssignments,
  }
}

beforeEach(() => {
  vi.clearAllMocks()

  // デフォルトのモック設定
  prismaMock.week.findUnique.mockResolvedValue(null)
  prismaMock.group.findMany.mockResolvedValue([])
  prismaMock.member.findMany.mockResolvedValue([])
  prismaMock.place.findMany.mockResolvedValue([])
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('HomeContentData Logic', () => {
  test('メンバーが登録されていない場合に適切なデータ構造を返す', async () => {
    // Arrange
    prismaMock.member.findMany.mockResolvedValue([])
    prismaMock.group.findMany.mockResolvedValue([])
    prismaMock.place.findMany.mockResolvedValue([])

    // Act
    const result = await getHomeContentData()

    // Assert
    expect(result.members).toEqual([])
    expect(result.groupedAssignments).toEqual([
      {
        name: '未割当',
        places: [],
        noneMembers: [],
      },
    ])
    expect(autoRotateIfNeeded).toHaveBeenCalled()
  })

  test('メンバーと場所が登録されている場合に適切なデータ構造を返す', async () => {
    // Arrange
    const mockWeek = {
      id: 1,
      startDate: new Date('2024-01-01T00:00:00Z'),
      assignments: [
        {
          id: 1,
          placeId: 1,
          memberId: 1,
          place: { id: 1, name: 'キッチン', groupId: null },
          member: { id: 1, name: '田中太郎', groupId: null },
        },
      ],
    }

    const mockGroups: Array<{ id: number; name: string }> = []
    const mockMembers = [
      { id: 1, name: '田中太郎', groupId: null, group: null },
    ]
    const mockPlaces = [{ id: 1, name: 'キッチン', groupId: null, group: null }]

    prismaMock.week.findUnique.mockResolvedValue(mockWeek)
    prismaMock.group.findMany.mockResolvedValue(mockGroups)
    prismaMock.member.findMany.mockResolvedValue(mockMembers)
    prismaMock.place.findMany.mockResolvedValue(mockPlaces)

    // Act
    const result = await getHomeContentData()

    // Assert
    expect(result.members).toEqual(mockMembers)
    expect(result.groupedAssignments).toEqual([
      {
        name: '未割当',
        places: [
          {
            place: { id: 1, name: 'キッチン', groupId: null, group: null },
            member: { id: 1, name: '田中太郎', groupId: null },
          },
        ],
        noneMembers: [],
      },
    ])
    expect(autoRotateIfNeeded).toHaveBeenCalled()
  })

  test('グループが存在する場合にグループ別にデータを整理する', async () => {
    // Arrange
    const mockWeek = {
      id: 1,
      startDate: new Date('2024-01-01T00:00:00Z'),
      assignments: [
        {
          id: 1,
          placeId: 1,
          memberId: 1,
          place: { id: 1, name: 'リビング', groupId: 1 },
          member: { id: 1, name: '佐藤次郎', groupId: 1 },
        },
      ],
    }

    const mockGroups = [{ id: 1, name: 'Aチーム' }]
    const mockMembers = [
      {
        id: 1,
        name: '佐藤次郎',
        groupId: 1,
        group: { id: 1, name: 'Aチーム' },
      },
    ]
    const mockPlaces = [
      {
        id: 1,
        name: 'リビング',
        groupId: 1,
        group: { id: 1, name: 'Aチーム' },
      },
    ]

    prismaMock.week.findUnique.mockResolvedValue(mockWeek)
    prismaMock.group.findMany.mockResolvedValue(mockGroups)
    prismaMock.member.findMany.mockResolvedValue(mockMembers)
    prismaMock.place.findMany.mockResolvedValue(mockPlaces)

    // Act
    const result = await getHomeContentData()

    // Assert
    expect(result.groupedAssignments).toEqual([
      {
        name: 'Aチーム',
        places: [
          {
            place: {
              id: 1,
              name: 'リビング',
              groupId: 1,
              group: { id: 1, name: 'Aチーム' },
            },
            member: { id: 1, name: '佐藤次郎', groupId: 1 },
          },
        ],
        noneMembers: [],
      },
      {
        name: '未割当',
        places: [],
        noneMembers: [],
      },
    ])
  })

  test('割り当てされていない場所をnullメンバーで表示する', async () => {
    // Arrange
    const mockWeek = {
      id: 1,
      startDate: new Date('2024-01-01T00:00:00Z'),
      assignments: [],
    }

    const mockGroups: Array<{ id: number; name: string }> = []
    const mockMembers = [
      { id: 1, name: '田中太郎', groupId: null, group: null },
    ]
    const mockPlaces = [{ id: 1, name: 'キッチン', groupId: null, group: null }]

    prismaMock.week.findUnique.mockResolvedValue(mockWeek)
    prismaMock.group.findMany.mockResolvedValue(mockGroups)
    prismaMock.member.findMany.mockResolvedValue(mockMembers)
    prismaMock.place.findMany.mockResolvedValue(mockPlaces)

    // Act
    const result = await getHomeContentData()

    // Assert
    expect(result.groupedAssignments[0].places).toEqual([
      {
        place: { id: 1, name: 'キッチン', groupId: null, group: null },
        member: null,
      },
    ])
  })

  test('割り当てされていないメンバーをnoneMembers配列に含める', async () => {
    // Arrange
    const mockWeek = {
      id: 1,
      startDate: new Date('2024-01-01T00:00:00Z'),
      assignments: [
        {
          id: 1,
          placeId: 1,
          memberId: 1,
          place: { id: 1, name: 'キッチン', groupId: null },
          member: { id: 1, name: '田中太郎', groupId: null },
        },
      ],
    }

    const mockGroups: Array<{ id: number; name: string }> = []
    const mockMembers = [
      { id: 1, name: '田中太郎', groupId: null, group: null },
      { id: 2, name: '佐藤花子', groupId: null, group: null },
    ]
    const mockPlaces = [{ id: 1, name: 'キッチン', groupId: null, group: null }]

    prismaMock.week.findUnique.mockResolvedValue(mockWeek)
    prismaMock.group.findMany.mockResolvedValue(mockGroups)
    prismaMock.member.findMany.mockResolvedValue(mockMembers)
    prismaMock.place.findMany.mockResolvedValue(mockPlaces)

    // Act
    const result = await getHomeContentData()

    // Assert
    expect(result.groupedAssignments[0].noneMembers).toEqual([
      { id: 2, name: '佐藤花子', groupId: null, group: null },
    ])
  })

  test('複数グループが存在する場合に適切にデータを分離する', async () => {
    // Arrange
    const mockWeek = {
      id: 1,
      startDate: new Date('2024-01-01T00:00:00Z'),
      assignments: [
        {
          id: 1,
          placeId: 1,
          memberId: 1,
          place: { id: 1, name: 'キッチン', groupId: 1 },
          member: { id: 1, name: '田中太郎', groupId: 1 },
        },
        {
          id: 2,
          placeId: 2,
          memberId: 2,
          place: { id: 2, name: 'トイレ', groupId: 2 },
          member: { id: 2, name: '佐藤花子', groupId: 2 },
        },
      ],
    }

    const mockGroups = [
      { id: 1, name: 'Aチーム' },
      { id: 2, name: 'Bチーム' },
    ]
    const mockMembers = [
      {
        id: 1,
        name: '田中太郎',
        groupId: 1,
        group: { id: 1, name: 'Aチーム' },
      },
      {
        id: 2,
        name: '佐藤花子',
        groupId: 2,
        group: { id: 2, name: 'Bチーム' },
      },
    ]
    const mockPlaces = [
      {
        id: 1,
        name: 'キッチン',
        groupId: 1,
        group: { id: 1, name: 'Aチーム' },
      },
      { id: 2, name: 'トイレ', groupId: 2, group: { id: 2, name: 'Bチーム' } },
    ]

    prismaMock.week.findUnique.mockResolvedValue(mockWeek)
    prismaMock.group.findMany.mockResolvedValue(mockGroups)
    prismaMock.member.findMany.mockResolvedValue(mockMembers)
    prismaMock.place.findMany.mockResolvedValue(mockPlaces)

    // Act
    const result = await getHomeContentData()

    // Assert
    expect(result.groupedAssignments).toHaveLength(3) // Aチーム、Bチーム、未割当

    const aTeam = result.groupedAssignments.find(g => g.name === 'Aチーム')
    const bTeam = result.groupedAssignments.find(g => g.name === 'Bチーム')

    expect(aTeam?.places).toHaveLength(1)
    expect(bTeam?.places).toHaveLength(1)
    expect(aTeam?.places[0].place.name).toBe('キッチン')
    expect(bTeam?.places[0].place.name).toBe('トイレ')
  })

  test('データベースエラーが発生した場合でもautoRotateIfNeededが呼ばれる', async () => {
    // Arrange
    prismaMock.week.findUnique.mockRejectedValue(new Error('Database error'))

    // Act & Assert
    await expect(getHomeContentData()).rejects.toThrow('Database error')
    expect(autoRotateIfNeeded).toHaveBeenCalled()
  })
})
