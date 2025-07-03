import { vi, expect, test, describe, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
    week: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/rotation', () => ({
  regenerateThisWeekAssignments: vi.fn(),
}))

vi.mock('@/lib/week', () => ({
  getWeekStart: vi.fn(() => new Date('2023-01-02')), // 月曜日
}))

import { revalidatePath } from 'next/cache'
import { regenerateThisWeekAssignments } from '@/lib/rotation'
import { getWeekStart } from '@/lib/week'
import { prisma } from '@/lib/prisma'
import {
  addMember,
  deleteMember,
  updateMemberName,
  updateMemberGroup,
} from '../members'

// モックされたprismaを型アサーション
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prismaMock = prisma as any

describe('Members Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('addMember', () => {
    test('正常にメンバーを作成する（グループ指定あり）', async () => {
      const formData = new FormData()
      formData.set('memberName', 'テストメンバー')
      formData.set('memberGroupId', '1')

      await addMember(formData)

      expect(prismaMock.member.create).toHaveBeenCalledWith({
        data: { name: 'テストメンバー', groupId: 1 },
      })
      expect(regenerateThisWeekAssignments).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/admin')
      expect(revalidatePath).toHaveBeenCalledWith('/')
    })

    test('正常にメンバーを作成する（グループ指定なし）', async () => {
      const formData = new FormData()
      formData.set('memberName', 'テストメンバー')

      await addMember(formData)

      expect(prismaMock.member.create).toHaveBeenCalledWith({
        data: { name: 'テストメンバー', groupId: null },
      })
      expect(regenerateThisWeekAssignments).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/admin')
      expect(revalidatePath).toHaveBeenCalledWith('/')
    })

    test('メンバー名が空の場合は何もしない', async () => {
      const formData = new FormData()
      formData.set('memberName', '')

      await addMember(formData)

      expect(prismaMock.member.create).not.toHaveBeenCalled()
      expect(regenerateThisWeekAssignments).not.toHaveBeenCalled()
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })

  describe('deleteMember', () => {
    test('正常にメンバーを削除する（当番割当あり）', async () => {
      const formData = new FormData()
      formData.set('memberId', '1')

      prismaMock.week.findUnique.mockResolvedValue({
        assignments: [{ memberId: 1 }],
      })

      await deleteMember(formData)

      expect(getWeekStart).toHaveBeenCalled()
      expect(prismaMock.week.findUnique).toHaveBeenCalledWith({
        where: { startDate: new Date('2023-01-02') },
        include: { assignments: true },
      })
      expect(prismaMock.member.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      })
      expect(regenerateThisWeekAssignments).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/admin')
      expect(revalidatePath).toHaveBeenCalledWith('/')
    })

    test('正常にメンバーを削除する（当番割当なし）', async () => {
      const formData = new FormData()
      formData.set('memberId', '1')

      prismaMock.week.findUnique.mockResolvedValue({
        assignments: [{ memberId: 2 }],
      })

      await deleteMember(formData)

      expect(prismaMock.member.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      })
      expect(regenerateThisWeekAssignments).not.toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/admin')
      expect(revalidatePath).toHaveBeenCalledWith('/')
    })

    test('メンバーIDが0の場合は何もしない', async () => {
      const formData = new FormData()
      formData.set('memberId', '0')

      await deleteMember(formData)

      expect(prismaMock.member.delete).not.toHaveBeenCalled()
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })

  describe('updateMemberName', () => {
    test('正常にメンバー名を更新する', async () => {
      const formData = new FormData()
      formData.set('memberId', '1')
      formData.set('memberName', '新しい名前')

      await updateMemberName(formData)

      expect(prismaMock.member.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: '新しい名前' },
      })
      expect(revalidatePath).toHaveBeenCalledWith('/admin')
      expect(revalidatePath).toHaveBeenCalledWith('/')
    })

    test('IDまたは名前が無効な場合は何もしない', async () => {
      const formData = new FormData()
      formData.set('memberId', '0')
      formData.set('memberName', '新しい名前')

      await updateMemberName(formData)

      expect(prismaMock.member.update).not.toHaveBeenCalled()
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })

  describe('updateMemberGroup', () => {
    test('正常にメンバーのグループを更新する', async () => {
      const formData = new FormData()
      formData.set('memberId', '1')
      formData.set('memberGroupId', '2')

      await updateMemberGroup(formData)

      expect(prismaMock.member.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { groupId: 2 },
      })
      expect(regenerateThisWeekAssignments).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/admin')
      expect(revalidatePath).toHaveBeenCalledWith('/')
    })

    test('グループIDをnullに更新する', async () => {
      const formData = new FormData()
      formData.set('memberId', '1')

      await updateMemberGroup(formData)

      expect(prismaMock.member.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { groupId: null },
      })
      expect(regenerateThisWeekAssignments).toHaveBeenCalled()
    })

    test('メンバーIDが無効な場合は何もしない', async () => {
      const formData = new FormData()
      formData.set('memberId', '0')

      await updateMemberGroup(formData)

      expect(prismaMock.member.update).not.toHaveBeenCalled()
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })
})
