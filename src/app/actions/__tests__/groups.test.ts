import { vi, expect, test, describe, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    group: {
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { addGroup, deleteGroup } from '../groups'

// モックされたprismaを型アサーション
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prismaMock = prisma as any

describe('Groups Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('addGroup', () => {
    test('正常にグループを作成する', async () => {
      const formData = new FormData()
      formData.set('groupName', 'テストグループ')

      await addGroup(formData)

      expect(prismaMock.group.create).toHaveBeenCalledWith({
        data: { name: 'テストグループ' },
      })
      expect(revalidatePath).toHaveBeenCalledWith('/admin')
      expect(revalidatePath).toHaveBeenCalledWith('/')
    })

    test('グループ名が空の場合は何もしない', async () => {
      const formData = new FormData()
      formData.set('groupName', '')

      await addGroup(formData)

      expect(prismaMock.group.create).not.toHaveBeenCalled()
      expect(revalidatePath).not.toHaveBeenCalled()
    })

    test('グループ名がnullの場合は何もしない', async () => {
      const formData = new FormData()

      await addGroup(formData)

      expect(prismaMock.group.create).not.toHaveBeenCalled()
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })

  describe('deleteGroup', () => {
    test('正常にグループを削除する', async () => {
      const formData = new FormData()
      formData.set('groupId', '1')

      await deleteGroup(formData)

      expect(prismaMock.group.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      })
      expect(revalidatePath).toHaveBeenCalledWith('/admin')
      expect(revalidatePath).toHaveBeenCalledWith('/')
    })

    test('グループIDが0の場合は何もしない', async () => {
      const formData = new FormData()
      formData.set('groupId', '0')

      await deleteGroup(formData)

      expect(prismaMock.group.delete).not.toHaveBeenCalled()
      expect(revalidatePath).not.toHaveBeenCalled()
    })

    test('グループIDがnullの場合は何もしない', async () => {
      const formData = new FormData()

      await deleteGroup(formData)

      expect(prismaMock.group.delete).not.toHaveBeenCalled()
      expect(revalidatePath).not.toHaveBeenCalled()
    })

    test('グループIDが無効な値の場合は何もしない', async () => {
      const formData = new FormData()
      formData.set('groupId', 'invalid')

      await deleteGroup(formData)

      expect(prismaMock.group.delete).not.toHaveBeenCalled()
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })
})
