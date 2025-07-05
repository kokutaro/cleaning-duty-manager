import React from 'react'
import { vi, expect, test, beforeEach, afterEach, describe } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'

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
  getWeekStart: vi.fn(() => new Date('2024-01-01')),
}))

vi.mock('date-fns', () => ({
  format: vi.fn(() => '2024年01月01日'),
}))

vi.mock('./actions/rotation', () => ({
  updateRotation: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { autoRotateIfNeeded } from '@/lib/rotation'
import { HomeContent } from '../HomeContent'

// 型安全なモック関数
const mockAutoRotateIfNeeded = vi.mocked(autoRotateIfNeeded)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prismaMock = prisma as any

beforeEach(() => {
  vi.clearAllMocks()

  // デフォルトのモック設定
  mockAutoRotateIfNeeded.mockResolvedValue(undefined)
  prismaMock.week.findUnique.mockResolvedValue(null)
  prismaMock.group.findMany.mockResolvedValue([])
  prismaMock.member.findMany.mockResolvedValue([])
  prismaMock.place.findMany.mockResolvedValue([])
})

afterEach(() => {
  vi.restoreAllMocks()
})

// サーバーコンポーネント用のレンダリングヘルパー
async function renderHomeContent() {
  const jsx = await HomeContent()
  return render(<MantineProvider>{jsx}</MantineProvider>)
}

describe('HomeContent', () => {
  test('メンバーがいない場合にエラーメッセージを表示する', async () => {
    // Arrange
    prismaMock.member.findMany.mockResolvedValue([])
    prismaMock.place.findMany.mockResolvedValue([])
    prismaMock.group.findMany.mockResolvedValue([])

    // Act
    await renderHomeContent()

    // Assert
    expect(screen.getByText('今週のお掃除当番')).toBeInTheDocument()
    expect(screen.getByText('週の開始日: 2024年01月01日')).toBeInTheDocument()
    expect(screen.getByText('ローテーション更新')).toBeInTheDocument()
    expect(
      screen.getByText('ユーザーが登録されていません。')
    ).toBeInTheDocument()
  })

  test('メンバーと場所がある場合に割り当て情報を表示する', async () => {
    // Arrange
    const mockWeek = {
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
    }

    const mockMembers = [
      {
        id: 1,
        name: '田中太郎',
        groupId: 1,
        group: { id: 1, name: 'グループA' },
      },
    ]

    const mockPlaces = [
      {
        id: 1,
        name: 'キッチン',
        groupId: 1,
        group: { id: 1, name: 'グループA' },
      },
    ]

    const mockGroups = [{ id: 1, name: 'グループA' }]

    prismaMock.week.findUnique.mockResolvedValue(mockWeek)
    prismaMock.member.findMany.mockResolvedValue(mockMembers)
    prismaMock.place.findMany.mockResolvedValue(mockPlaces)
    prismaMock.group.findMany.mockResolvedValue(mockGroups)

    // Act
    await renderHomeContent()

    // Assert
    expect(screen.getByText('今週のお掃除当番')).toBeInTheDocument()
    expect(screen.getByText('グループA')).toBeInTheDocument()
    expect(screen.getByText('キッチン')).toBeInTheDocument()
    expect(screen.getByText('田中太郎')).toBeInTheDocument()
    expect(
      screen.queryByText('ユーザーが登録されていません。')
    ).not.toBeInTheDocument()
  })

  test('複数のグループと場所がある場合に正しく表示される', async () => {
    // Arrange
    const mockWeek = {
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
    }

    const mockMembers = [
      {
        id: 1,
        name: '田中太郎',
        groupId: 1,
        group: { id: 1, name: 'グループA' },
      },
      {
        id: 2,
        name: '佐藤花子',
        groupId: 2,
        group: { id: 2, name: 'グループB' },
      },
    ]

    const mockPlaces = [
      {
        id: 1,
        name: 'キッチン',
        groupId: 1,
        group: { id: 1, name: 'グループA' },
      },
      {
        id: 2,
        name: 'トイレ',
        groupId: 2,
        group: { id: 2, name: 'グループB' },
      },
    ]

    const mockGroups = [
      { id: 1, name: 'グループA' },
      { id: 2, name: 'グループB' },
    ]

    prismaMock.week.findUnique.mockResolvedValue(mockWeek)
    prismaMock.member.findMany.mockResolvedValue(mockMembers)
    prismaMock.place.findMany.mockResolvedValue(mockPlaces)
    prismaMock.group.findMany.mockResolvedValue(mockGroups)

    // Act
    await renderHomeContent()

    // Assert
    expect(screen.getByText('グループA')).toBeInTheDocument()
    expect(screen.getByText('グループB')).toBeInTheDocument()
    expect(screen.getByText('キッチン')).toBeInTheDocument()
    expect(screen.getByText('トイレ')).toBeInTheDocument()
    expect(screen.getByText('田中太郎')).toBeInTheDocument()
    expect(screen.getByText('佐藤花子')).toBeInTheDocument()
  })

  test('未割当の場所がある場合に「未割当」と表示される', async () => {
    // Arrange
    const mockWeek = {
      id: 1,
      startDate: new Date('2024-01-01'),
      assignments: [], // 割り当てなし
    }

    const mockMembers = [
      {
        id: 1,
        name: '田中太郎',
        groupId: 1,
        group: { id: 1, name: 'グループA' },
      },
    ]

    const mockPlaces = [
      {
        id: 1,
        name: 'キッチン',
        groupId: 1,
        group: { id: 1, name: 'グループA' },
      },
    ]

    const mockGroups = [{ id: 1, name: 'グループA' }]

    prismaMock.week.findUnique.mockResolvedValue(mockWeek)
    prismaMock.member.findMany.mockResolvedValue(mockMembers)
    prismaMock.place.findMany.mockResolvedValue(mockPlaces)
    prismaMock.group.findMany.mockResolvedValue(mockGroups)

    // Act
    await renderHomeContent()

    // Assert
    expect(screen.getByText('キッチン')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '未割当' })).toBeInTheDocument()
  })

  test('未割当のメンバーがいる場合に「なし」セクションに表示される', async () => {
    // Arrange
    const mockWeek = {
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
    }

    const mockMembers = [
      {
        id: 1,
        name: '田中太郎',
        groupId: 1,
        group: { id: 1, name: 'グループA' },
      },
      {
        id: 2,
        name: '佐藤花子',
        groupId: 1,
        group: { id: 1, name: 'グループA' },
      },
    ]

    const mockPlaces = [
      {
        id: 1,
        name: 'キッチン',
        groupId: 1,
        group: { id: 1, name: 'グループA' },
      },
    ]

    const mockGroups = [{ id: 1, name: 'グループA' }]

    prismaMock.week.findUnique.mockResolvedValue(mockWeek)
    prismaMock.member.findMany.mockResolvedValue(mockMembers)
    prismaMock.place.findMany.mockResolvedValue(mockPlaces)
    prismaMock.group.findMany.mockResolvedValue(mockGroups)

    // Act
    await renderHomeContent()

    // Assert
    expect(screen.getByText('なし')).toBeInTheDocument()
    expect(screen.getByText('佐藤花子')).toBeInTheDocument()
  })

  test('基本的なUI要素が正しく表示される', async () => {
    // Arrange
    prismaMock.member.findMany.mockResolvedValue([])
    prismaMock.place.findMany.mockResolvedValue([])
    prismaMock.group.findMany.mockResolvedValue([])

    // Act
    await renderHomeContent()

    // Assert
    expect(
      screen.getByRole('heading', { level: 1, name: '今週のお掃除当番' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'ローテーション更新' })
    ).toBeInTheDocument()
    expect(screen.getByText('週の開始日: 2024年01月01日')).toBeInTheDocument()
  })

  test('autoRotateIfNeededが呼び出される', async () => {
    // Arrange
    prismaMock.member.findMany.mockResolvedValue([])
    prismaMock.place.findMany.mockResolvedValue([])
    prismaMock.group.findMany.mockResolvedValue([])

    // Act
    await renderHomeContent()

    // Assert
    expect(mockAutoRotateIfNeeded).toHaveBeenCalledWith(new Date('2024-01-01'))
  })
})
