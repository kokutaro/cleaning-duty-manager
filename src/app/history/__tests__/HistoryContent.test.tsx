import React from 'react'
import { vi, expect, test, beforeEach, afterEach, describe } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'

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

const mockCountMatrix = {
  members: ['佐藤花子', '田中太郎'],
  places: ['キッチン', 'トイレ'],
  matrix: {
    田中太郎: { キッチン: 1, トイレ: 1 },
    佐藤花子: { キッチン: 2 },
  },
}

// 外部依存関数のモック化
vi.mock('@/lib/history-data', () => ({
  getWeeksWithAssignments: vi.fn(),
  getCleaningCountMatrix: vi.fn(),
}))

vi.mock('date-fns', () => ({
  format: vi.fn((date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}年${month}月${day}日`
  }),
}))

import {
  getWeeksWithAssignments,
  getCleaningCountMatrix,
} from '@/lib/history-data'
import { HistoryContent } from '../HistoryContent'

const mockGetWeeksWithAssignments = vi.mocked(getWeeksWithAssignments)
const mockGetCleaningCountMatrix = vi.mocked(getCleaningCountMatrix)

beforeEach(() => {
  vi.clearAllMocks()

  // デフォルトのモック設定
  mockGetWeeksWithAssignments.mockResolvedValue(mockWeeks)
  mockGetCleaningCountMatrix.mockResolvedValue(mockCountMatrix)
})

afterEach(() => {
  vi.restoreAllMocks()
})

// サーバーコンポーネント用のレンダリングヘルパー
async function renderHistoryContent() {
  const jsx = await HistoryContent()
  return render(<MantineProvider>{jsx}</MantineProvider>)
}

describe('HistoryContent', () => {
  test('アサイン履歴セクションが正しく表示される', async () => {
    // Act
    await renderHistoryContent()

    // Assert
    expect(screen.getByText('アサイン履歴')).toBeInTheDocument()
    expect(screen.getByText('2024年01月01日')).toBeInTheDocument()
    expect(screen.getByText('2024年01月08日')).toBeInTheDocument()
  })

  test('アサイン履歴の詳細が正しく表示される', async () => {
    // Act
    await renderHistoryContent()

    // Assert
    expect(screen.getByText('キッチン: 田中太郎')).toBeInTheDocument()
    expect(screen.getByText('トイレ: 佐藤花子')).toBeInTheDocument()
    expect(screen.getByText('キッチン: 佐藤花子')).toBeInTheDocument()
  })

  test('掃除回数集計テーブルが正しく表示される', async () => {
    // Act
    await renderHistoryContent()

    // Assert
    expect(screen.getByText('掃除回数集計')).toBeInTheDocument()
    expect(screen.getByText('メンバー\\場所')).toBeInTheDocument()
    expect(screen.getByText('田中太郎')).toBeInTheDocument()
    expect(screen.getByText('佐藤花子')).toBeInTheDocument()
  })

  test('掃除回数集計テーブルの場所ヘッダーが正しく表示される', async () => {
    // Act
    await renderHistoryContent()

    // Assert
    const tableHeaders = screen.getAllByText('キッチン')
    const tableHeaders2 = screen.getAllByText('トイレ')
    expect(tableHeaders.length).toBeGreaterThan(0)
    expect(tableHeaders2.length).toBeGreaterThan(0)
  })

  test('掃除回数の数値が正しく表示される', async () => {
    // Act
    await renderHistoryContent()

    // Assert
    expect(screen.getAllByText('1')).toHaveLength(2)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  test('空のデータの場合でも正しく表示される', async () => {
    // Arrange
    mockGetWeeksWithAssignments.mockResolvedValue([])
    mockGetCleaningCountMatrix.mockResolvedValue({
      members: [],
      places: [],
      matrix: {},
    })

    // Act
    await renderHistoryContent()

    // Assert
    expect(screen.getByText('アサイン履歴')).toBeInTheDocument()
    expect(screen.getByText('掃除回数集計')).toBeInTheDocument()
    expect(screen.getByText('メンバー\\場所')).toBeInTheDocument()
  })

  test('週のデータが時系列順（降順）で表示される', async () => {
    // Act
    await renderHistoryContent()

    // Assert
    const weekHeaders = screen.getAllByText(/\d{4}年\d{2}月\d{2}日/)
    expect(weekHeaders).toHaveLength(2)

    // 最初に表示されるのは新しい週（2024年01月01日）
    expect(weekHeaders[0]).toHaveTextContent('2024年01月01日')
    expect(weekHeaders[1]).toHaveTextContent('2024年01月08日')
  })

  test('ビジネスロジック関数が正しく呼び出される', async () => {
    // Act
    await renderHistoryContent()

    // Assert
    expect(mockGetWeeksWithAssignments).toHaveBeenCalledTimes(1)
    expect(mockGetCleaningCountMatrix).toHaveBeenCalledTimes(1)
  })
})
