import { vi, expect, test, beforeEach, afterEach, describe } from 'vitest'

// Prismaクライアントのモック化
vi.mock('@/lib/prisma', () => ({
  prisma: {
    week: {
      findMany: vi.fn(),
    },
  },
}))

// 外部依存関数のモック化
vi.mock('@/lib/history', () => ({
  getAssignmentCounts: vi.fn(),
}))

vi.mock('date-fns', () => ({
  format: vi.fn(() => '2024年01月01日'),
}))

import { prisma } from '@/lib/prisma'
import { getAssignmentCounts, type CountResult } from '@/lib/history'

// モックされたprismaを型アサーション
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prismaMock = prisma as any

// HistoryContentコンポーネントのロジック部分を抽出したテスト用関数
async function getHistoryContentData() {
  const weeks = await prisma.week.findMany({
    orderBy: { startDate: 'desc' },
    include: {
      assignments: {
        include: { place: true, member: true },
        orderBy: { placeId: 'asc' },
      },
    },
  })

  const countList = (await getAssignmentCounts()).sort(
    (a, b) =>
      a.memberName.localeCompare(b.memberName) ||
      a.placeName.localeCompare(b.placeName)
  )

  const members = Array.from(new Set(countList.map(c => c.memberName))).sort(
    (a, b) => a.localeCompare(b)
  )
  const places = Array.from(new Set(countList.map(c => c.placeName))).sort(
    (a, b) => a.localeCompare(b)
  )
  const matrix: Record<string, Record<string, number>> = {}
  for (const c of countList) {
    if (!matrix[c.memberName]) matrix[c.memberName] = {}
    matrix[c.memberName][c.placeName] = c.count
  }

  return {
    weeks,
    countList,
    members,
    places,
    matrix,
  }
}

beforeEach(() => {
  vi.clearAllMocks()

  // デフォルトのモック設定
  prismaMock.week.findMany.mockResolvedValue([])
  ;(
    getAssignmentCounts as vi.MockedFunction<typeof getAssignmentCounts>
  ).mockResolvedValue([])
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('HistoryContentData Logic', () => {
  test('データがない場合に空の配列とオブジェクトを返す', async () => {
    // Arrange
    prismaMock.week.findMany.mockResolvedValue([])
    ;(
      getAssignmentCounts as vi.MockedFunction<typeof getAssignmentCounts>
    ).mockResolvedValue([])

    // Act
    const result = await getHistoryContentData()

    // Assert
    expect(result.weeks).toEqual([])
    expect(result.countList).toEqual([])
    expect(result.members).toEqual([])
    expect(result.places).toEqual([])
    expect(result.matrix).toEqual({})
  })

  test('週データが存在する場合に適切に整理される', async () => {
    // Arrange
    const mockWeeks = [
      {
        id: 1,
        startDate: new Date('2024-01-01'),
        assignments: [
          {
            id: 1,
            placeId: 1,
            memberId: 1,
            place: { id: 1, name: 'キッチン' },
            member: { id: 1, name: '田中太郎' },
          },
          {
            id: 2,
            placeId: 2,
            memberId: 2,
            place: { id: 2, name: 'トイレ' },
            member: { id: 2, name: '佐藤花子' },
          },
        ],
      },
      {
        id: 2,
        startDate: new Date('2024-01-08'),
        assignments: [
          {
            id: 3,
            placeId: 1,
            memberId: 2,
            place: { id: 1, name: 'キッチン' },
            member: { id: 2, name: '佐藤花子' },
          },
        ],
      },
    ]

    prismaMock.week.findMany.mockResolvedValue(mockWeeks)
    ;(
      getAssignmentCounts as vi.MockedFunction<typeof getAssignmentCounts>
    ).mockResolvedValue([])

    // Act
    const result = await getHistoryContentData()

    // Assert
    expect(result.weeks).toEqual(mockWeeks)
    expect(result.weeks).toHaveLength(2)
    expect(result.weeks[0].assignments).toHaveLength(2)
    expect(result.weeks[1].assignments).toHaveLength(1)
  })

  test('掃除回数データを正しくソートし、マトリックスを構築する', async () => {
    // Arrange
    const mockCountList: CountResult[] = [
      {
        memberId: 2,
        memberName: '佐藤花子',
        placeId: 1,
        placeName: 'キッチン',
        count: 3,
      },
      {
        memberId: 1,
        memberName: '田中太郎',
        placeId: 2,
        placeName: 'トイレ',
        count: 2,
      },
      {
        memberId: 1,
        memberName: '田中太郎',
        placeId: 1,
        placeName: 'キッチン',
        count: 1,
      },
    ]

    prismaMock.week.findMany.mockResolvedValue([])
    ;(
      getAssignmentCounts as vi.MockedFunction<typeof getAssignmentCounts>
    ).mockResolvedValue(mockCountList)

    // Act
    const result = await getHistoryContentData()

    // Assert
    // ソート後の順序を確認（日本語文字列ソート順）
    expect(result.countList).toHaveLength(3)
    expect(result.countList[0]).toEqual({
      memberId: 2,
      memberName: '佐藤花子',
      placeId: 1,
      placeName: 'キッチン',
      count: 3,
    })
    expect(result.countList[1]).toEqual({
      memberId: 1,
      memberName: '田中太郎',
      placeId: 1,
      placeName: 'キッチン',
      count: 1,
    })
    expect(result.countList[2]).toEqual({
      memberId: 1,
      memberName: '田中太郎',
      placeId: 2,
      placeName: 'トイレ',
      count: 2,
    })
  })

  test('メンバー名と場所名が正しくソートされる', async () => {
    // Arrange
    const mockCountList: CountResult[] = [
      {
        memberId: 3,
        memberName: '鈴木次郎',
        placeId: 3,
        placeName: 'リビング',
        count: 1,
      },
      {
        memberId: 1,
        memberName: '田中太郎',
        placeId: 1,
        placeName: 'キッチン',
        count: 2,
      },
      {
        memberId: 2,
        memberName: '佐藤花子',
        placeId: 2,
        placeName: 'トイレ',
        count: 3,
      },
    ]

    prismaMock.week.findMany.mockResolvedValue([])
    ;(
      getAssignmentCounts as vi.MockedFunction<typeof getAssignmentCounts>
    ).mockResolvedValue(mockCountList)

    // Act
    const result = await getHistoryContentData()

    // Assert
    expect(result.members).toEqual(['佐藤花子', '田中太郎', '鈴木次郎'])
    expect(result.places).toEqual(['キッチン', 'トイレ', 'リビング'])
  })

  test('マトリックス構造が正しく構築される', async () => {
    // Arrange
    const mockCountList: CountResult[] = [
      {
        memberId: 1,
        memberName: '田中太郎',
        placeId: 1,
        placeName: 'キッチン',
        count: 2,
      },
      {
        memberId: 1,
        memberName: '田中太郎',
        placeId: 2,
        placeName: 'トイレ',
        count: 1,
      },
      {
        memberId: 2,
        memberName: '佐藤花子',
        placeId: 1,
        placeName: 'キッチン',
        count: 3,
      },
    ]

    prismaMock.week.findMany.mockResolvedValue([])
    ;(
      getAssignmentCounts as vi.MockedFunction<typeof getAssignmentCounts>
    ).mockResolvedValue(mockCountList)

    // Act
    const result = await getHistoryContentData()

    // Assert
    expect(result.matrix).toEqual({
      田中太郎: {
        キッチン: 2,
        トイレ: 1,
      },
      佐藤花子: {
        キッチン: 3,
      },
    })

    // 未割当場所の値確認（0が返されるべき）
    expect(result.matrix['田中太郎']['トイレ']).toBe(1)
    expect(result.matrix['佐藤花子']['トイレ']).toBeUndefined() // 未設定
  })

  test('複数週と複数メンバー・場所の複合ケース', async () => {
    // Arrange
    const mockWeeks = [
      {
        id: 1,
        startDate: new Date('2024-01-01'),
        assignments: [
          {
            id: 1,
            placeId: 1,
            memberId: 1,
            place: { id: 1, name: 'キッチン' },
            member: { id: 1, name: '田中太郎' },
          },
        ],
      },
      {
        id: 2,
        startDate: new Date('2024-01-08'),
        assignments: [
          {
            id: 2,
            placeId: 2,
            memberId: 2,
            place: { id: 2, name: 'トイレ' },
            member: { id: 2, name: '佐藤花子' },
          },
        ],
      },
    ]

    const mockCountList: CountResult[] = [
      {
        memberId: 1,
        memberName: '田中太郎',
        placeId: 1,
        placeName: 'キッチン',
        count: 1,
      },
      {
        memberId: 2,
        memberName: '佐藤花子',
        placeId: 2,
        placeName: 'トイレ',
        count: 1,
      },
    ]

    prismaMock.week.findMany.mockResolvedValue(mockWeeks)
    ;(
      getAssignmentCounts as vi.MockedFunction<typeof getAssignmentCounts>
    ).mockResolvedValue(mockCountList)

    // Act
    const result = await getHistoryContentData()

    // Assert
    expect(result.weeks).toHaveLength(2)
    expect(result.members).toEqual(['佐藤花子', '田中太郎'])
    expect(result.places).toEqual(['キッチン', 'トイレ'])
    expect(result.matrix['田中太郎']['キッチン']).toBe(1)
    expect(result.matrix['佐藤花子']['トイレ']).toBe(1)
  })

  test('データベースエラーが発生した場合に適切にエラーを投げる', async () => {
    // Arrange
    prismaMock.week.findMany.mockRejectedValue(new Error('Database error'))

    // Act & Assert
    await expect(getHistoryContentData()).rejects.toThrow('Database error')
  })

  test('getAssignmentCountsでエラーが発生した場合に適切にエラーを投げる', async () => {
    // Arrange
    prismaMock.week.findMany.mockResolvedValue([])
    ;(
      getAssignmentCounts as vi.MockedFunction<typeof getAssignmentCounts>
    ).mockRejectedValue(new Error('Assignment count error'))

    // Act & Assert
    await expect(getHistoryContentData()).rejects.toThrow(
      'Assignment count error'
    )
  })
})
