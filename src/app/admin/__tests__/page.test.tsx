import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

// Prismaクライアントのモック化
vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findMany: vi.fn(),
    },
    place: {
      findMany: vi.fn(),
    },
    group: {
      findMany: vi.fn(),
    },
  },
}))

// Server Actionsのモック化
vi.mock('../../actions/members', () => ({
  addMember: vi.fn(),
  deleteMember: vi.fn(),
  updateMemberName: vi.fn(),
  updateMemberGroup: vi.fn(),
}))

vi.mock('../../actions/places', () => ({
  addPlace: vi.fn(),
  deletePlace: vi.fn(),
  updatePlaceName: vi.fn(),
  updatePlaceGroup: vi.fn(),
}))

vi.mock('../../actions/groups', () => ({
  addGroup: vi.fn(),
  deleteGroup: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import AdminPage from '../page'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prismaMock = prisma as any

beforeEach(() => {
  vi.clearAllMocks()

  // デフォルトのモック設定
  prismaMock.member.findMany.mockResolvedValue([])
  prismaMock.place.findMany.mockResolvedValue([])
  prismaMock.group.findMany.mockResolvedValue([])
})

afterEach(() => {
  vi.restoreAllMocks()
})

// サーバーコンポーネント用のレンダリングヘルパー
async function renderAdminPage() {
  const jsx = await AdminPage()
  return render(<MantineProvider>{jsx}</MantineProvider>)
}

describe('AdminPage', () => {
  test('基本的な管理画面の要素が表示される', async () => {
    // Act
    await renderAdminPage()

    // Assert
    expect(screen.getByText('管理画面')).toBeInTheDocument()
    expect(screen.getByText('グループ登録')).toBeInTheDocument()
    expect(screen.getByText('ユーザー登録')).toBeInTheDocument()
    expect(screen.getByText('掃除場所登録')).toBeInTheDocument()
  })

  test('グループ登録セクションが正しく表示される', async () => {
    // Act
    await renderAdminPage()

    // Assert
    expect(screen.getByText('グループ登録')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('グループ名')).toBeInTheDocument()
    expect(screen.getAllByText('追加')[0]).toBeInTheDocument()
  })

  test('ユーザー登録セクションが正しく表示される', async () => {
    // Act
    await renderAdminPage()

    // Assert
    expect(screen.getByText('ユーザー登録')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('名前')).toBeInTheDocument()
    expect(screen.getAllByText('追加')[1]).toBeInTheDocument()
  })

  test('掃除場所登録セクションが正しく表示される', async () => {
    // Act
    await renderAdminPage()

    // Assert
    expect(screen.getByText('掃除場所登録')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('場所名')).toBeInTheDocument()
    expect(screen.getAllByText('追加')[2]).toBeInTheDocument()
  })

  test('グループが存在する場合に表示される', async () => {
    // Arrange
    const mockGroups = [
      { id: 1, name: 'グループA' },
      { id: 2, name: 'グループB' },
    ]

    prismaMock.group.findMany.mockResolvedValue(mockGroups)

    // Act
    await renderAdminPage()

    // Assert
    // グループ名が表示されることを確認（複数のSelectコンポーネントに表示される）
    expect(screen.getAllByText('グループA').length).toBeGreaterThan(0)
    expect(screen.getAllByText('グループB').length).toBeGreaterThan(0)
    expect(screen.getAllByText('削除')).toHaveLength(2)
  })

  test('メンバーが存在する場合に表示される', async () => {
    // Arrange
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

    const mockGroups = [
      { id: 1, name: 'グループA' },
      { id: 2, name: 'グループB' },
    ]

    prismaMock.member.findMany.mockResolvedValue(mockMembers)
    prismaMock.group.findMany.mockResolvedValue(mockGroups)

    // Act
    await renderAdminPage()

    // Assert
    expect(screen.getByDisplayValue('田中太郎')).toBeInTheDocument()
    expect(screen.getByDisplayValue('佐藤花子')).toBeInTheDocument()
    expect(screen.getAllByText('保存')).toHaveLength(2)
    expect(screen.getAllByText('変更')).toHaveLength(2)
  })

  test('場所が存在する場合に表示される', async () => {
    // Arrange
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

    prismaMock.place.findMany.mockResolvedValue(mockPlaces)
    prismaMock.group.findMany.mockResolvedValue(mockGroups)

    // Act
    await renderAdminPage()

    // Assert
    expect(screen.getByDisplayValue('キッチン')).toBeInTheDocument()
    expect(screen.getByDisplayValue('トイレ')).toBeInTheDocument()
    expect(screen.getAllByText('保存')).toHaveLength(2)
    expect(screen.getAllByText('変更')).toHaveLength(2)
  })

  test('データベースからデータを正しく取得している', async () => {
    // Act
    await renderAdminPage()

    // Assert
    expect(prismaMock.member.findMany).toHaveBeenCalledWith({
      include: { group: true },
    })
    expect(prismaMock.place.findMany).toHaveBeenCalledWith({
      include: { group: true },
    })
    expect(prismaMock.group.findMany).toHaveBeenCalledWith()
  })

  test('複数のデータが存在する場合に正しく表示される', async () => {
    // Arrange
    const mockGroups = [
      { id: 1, name: 'グループA' },
      { id: 2, name: 'グループB' },
    ]

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
        groupId: null,
        group: null,
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
        groupId: null,
        group: null,
      },
    ]

    prismaMock.group.findMany.mockResolvedValue(mockGroups)
    prismaMock.member.findMany.mockResolvedValue(mockMembers)
    prismaMock.place.findMany.mockResolvedValue(mockPlaces)

    // Act
    await renderAdminPage()

    // Assert
    // グループ（複数のSelectコンポーネントに表示される）
    expect(screen.getAllByText('グループA').length).toBeGreaterThan(0)
    expect(screen.getAllByText('グループB').length).toBeGreaterThan(0)

    // メンバー
    expect(screen.getByDisplayValue('田中太郎')).toBeInTheDocument()
    expect(screen.getByDisplayValue('佐藤花子')).toBeInTheDocument()

    // 場所
    expect(screen.getByDisplayValue('キッチン')).toBeInTheDocument()
    expect(screen.getByDisplayValue('トイレ')).toBeInTheDocument()
  })
})
