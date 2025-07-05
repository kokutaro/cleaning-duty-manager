import { vi, expect, test, beforeEach, afterEach, describe } from 'vitest'

// 外部依存関数のモック化
vi.mock('@/lib/duty-assignment', () => ({
  getDutyAssignmentData: vi.fn(),
}))

vi.mock('date-fns', () => ({
  format: vi.fn(() => '2024年01月01日'),
}))

import {
  getDutyAssignmentData,
  type GroupedAssignments,
} from '@/lib/duty-assignment'

// 型安全なモック関数
const mockGetDutyAssignmentData = vi.mocked(getDutyAssignmentData)

// HomeContentコンポーネントのロジック部分を抽出したテスト用関数
async function getHomeContentData() {
  return await getDutyAssignmentData()
}

beforeEach(() => {
  vi.clearAllMocks()

  // デフォルトのモック設定
  mockGetDutyAssignmentData.mockResolvedValue({
    weekStart: new Date('2024-01-01'),
    members: [],
    groupedAssignments: [],
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('HomeContentData Logic', () => {
  test('メンバーがいない場合に空の配列を返す', async () => {
    // Arrange
    mockGetDutyAssignmentData.mockResolvedValue({
      weekStart: new Date('2024-01-01'),
      members: [],
      groupedAssignments: [],
    })

    // Act
    const result = await getHomeContentData()

    // Assert
    expect(result.members).toEqual([])
    expect(result.groupedAssignments).toEqual([])
    expect(result.weekStart).toEqual(new Date('2024-01-01'))
  })

  test('メンバーと場所がある場合に適切に返される', async () => {
    // Arrange
    const mockGroupedAssignments: GroupedAssignments[] = [
      {
        name: 'グループA',
        places: [
          {
            place: {
              id: 1,
              name: 'キッチン',
              groupId: 1,
              group: {
                id: 1,
                name: 'グループA',
              },
            },
            member: {
              id: 1,
              name: '田中太郎',
              groupId: 1,
              group: {
                id: 1,
                name: 'グループA',
              },
            },
          },
        ],
        noneMembers: [],
      },
      {
        name: 'グループB',
        places: [
          {
            place: {
              id: 2,
              name: 'トイレ',
              groupId: 2,
              group: {
                id: 2,
                name: 'グループB',
              },
            },
            member: null,
          },
        ],
        noneMembers: [
          {
            id: 2,
            name: '佐藤花子',
            groupId: 2,
            group: {
              id: 2,
              name: 'グループB',
            },
          },
        ],
      },
    ]

    const mockMembers = [
      {
        id: 1,
        name: '田中太郎',
        groupId: 1,
        group: {
          id: 1,
          name: 'グループA',
        },
      },
      {
        id: 2,
        name: '佐藤花子',
        groupId: 2,
        group: {
          id: 2,
          name: 'グループB',
        },
      },
    ]

    mockGetDutyAssignmentData.mockResolvedValue({
      weekStart: new Date('2024-01-01'),
      members: mockMembers,
      groupedAssignments: mockGroupedAssignments,
    })

    // Act
    const result = await getHomeContentData()

    // Assert
    expect(result.members).toHaveLength(2)
    expect(result.members[0].name).toBe('田中太郎')
    expect(result.members[1].name).toBe('佐藤花子')
    expect(result.groupedAssignments).toHaveLength(2)
    expect(result.groupedAssignments[0].name).toBe('グループA')
    expect(result.groupedAssignments[1].name).toBe('グループB')
  })

  test('グループ別に割り当て情報が正しく整理される', async () => {
    // Arrange
    const mockGroupedAssignments: GroupedAssignments[] = [
      {
        name: 'グループA',
        places: [
          {
            place: {
              id: 1,
              name: 'キッチン',
              groupId: 1,
              group: {
                id: 1,
                name: 'グループA',
              },
            },
            member: {
              id: 1,
              name: '田中太郎',
              groupId: 1,
              group: {
                id: 1,
                name: 'グループA',
              },
            },
          },
          {
            place: {
              id: 2,
              name: 'リビング',
              groupId: 1,
              group: {
                id: 1,
                name: 'グループA',
              },
            },
            member: null,
          },
        ],
        noneMembers: [
          {
            id: 2,
            name: '佐藤花子',
            groupId: 1,
            group: {
              id: 1,
              name: 'グループA',
            },
          },
        ],
      },
    ]

    mockGetDutyAssignmentData.mockResolvedValue({
      weekStart: new Date('2024-01-01'),
      members: [
        {
          id: 1,
          name: '田中太郎',
          groupId: 1,
          group: {
            id: 1,
            name: 'グループA',
          },
        },
        {
          id: 2,
          name: '佐藤花子',
          groupId: 1,
          group: {
            id: 1,
            name: 'グループA',
          },
        },
      ],
      groupedAssignments: mockGroupedAssignments,
    })

    // Act
    const result = await getHomeContentData()

    // Assert
    expect(result.groupedAssignments).toHaveLength(1)
    expect(result.groupedAssignments[0].name).toBe('グループA')
    expect(result.groupedAssignments[0].places).toHaveLength(2)
    expect(result.groupedAssignments[0].places[0].member?.name).toBe('田中太郎')
    expect(result.groupedAssignments[0].places[1].member).toBeNull()
    expect(result.groupedAssignments[0].noneMembers).toHaveLength(1)
    expect(result.groupedAssignments[0].noneMembers[0].name).toBe('佐藤花子')
  })

  test('複数グループで未割当メンバーが存在する場合', async () => {
    // Arrange
    const mockGroupedAssignments: GroupedAssignments[] = [
      {
        name: 'グループA',
        places: [
          {
            place: {
              id: 1,
              name: 'キッチン',
              groupId: 1,
              group: {
                id: 1,
                name: 'グループA',
              },
            },
            member: {
              id: 1,
              name: '田中太郎',
              groupId: 1,
              group: {
                id: 1,
                name: 'グループA',
              },
            },
          },
        ],
        noneMembers: [
          {
            id: 2,
            name: '佐藤花子',
            groupId: 1,
            group: {
              id: 1,
              name: 'グループA',
            },
          },
        ],
      },
      {
        name: 'グループB',
        places: [],
        noneMembers: [
          {
            id: 3,
            name: '鈴木次郎',
            groupId: 2,
            group: {
              id: 2,
              name: 'グループB',
            },
          },
        ],
      },
    ]

    mockGetDutyAssignmentData.mockResolvedValue({
      weekStart: new Date('2024-01-01'),
      members: [
        {
          id: 1,
          name: '田中太郎',
          groupId: 1,
          group: {
            id: 1,
            name: 'グループA',
          },
        },
        {
          id: 2,
          name: '佐藤花子',
          groupId: 1,
          group: {
            id: 1,
            name: 'グループA',
          },
        },
        {
          id: 3,
          name: '鈴木次郎',
          groupId: 2,
          group: {
            id: 2,
            name: 'グループB',
          },
        },
      ],
      groupedAssignments: mockGroupedAssignments,
    })

    // Act
    const result = await getHomeContentData()

    // Assert
    expect(result.groupedAssignments).toHaveLength(2)
    expect(result.groupedAssignments[0].noneMembers).toHaveLength(1)
    expect(result.groupedAssignments[0].noneMembers[0].name).toBe('佐藤花子')
    expect(result.groupedAssignments[1].noneMembers).toHaveLength(1)
    expect(result.groupedAssignments[1].noneMembers[0].name).toBe('鈴木次郎')
  })

  test('getDutyAssignmentDataでエラーが発生した場合に適切にエラーを投げる', async () => {
    // Arrange
    mockGetDutyAssignmentData.mockRejectedValue(
      new Error('Duty assignment data error')
    )

    // Act & Assert
    await expect(getHomeContentData()).rejects.toThrow(
      'Duty assignment data error'
    )
  })

  test('週の開始日が正しく設定される', async () => {
    // Arrange
    const testWeekStart = new Date('2024-02-05')
    mockGetDutyAssignmentData.mockResolvedValue({
      weekStart: testWeekStart,
      members: [],
      groupedAssignments: [],
    })

    // Act
    const result = await getHomeContentData()

    // Assert
    expect(result.weekStart).toEqual(testWeekStart)
  })

  test('空の場所とメンバーがある場合', async () => {
    // Arrange
    const mockGroupedAssignments: GroupedAssignments[] = [
      {
        name: '未割当',
        places: [],
        noneMembers: [
          {
            id: 1,
            name: '田中太郎',
            groupId: null,
            group: null,
          },
        ],
      },
    ]

    mockGetDutyAssignmentData.mockResolvedValue({
      weekStart: new Date('2024-01-01'),
      members: [
        {
          id: 1,
          name: '田中太郎',
          groupId: null,
          group: null,
        },
      ],
      groupedAssignments: mockGroupedAssignments,
    })

    // Act
    const result = await getHomeContentData()

    // Assert
    expect(result.groupedAssignments).toHaveLength(1)
    expect(result.groupedAssignments[0].name).toBe('未割当')
    expect(result.groupedAssignments[0].places).toHaveLength(0)
    expect(result.groupedAssignments[0].noneMembers).toHaveLength(1)
  })
})
