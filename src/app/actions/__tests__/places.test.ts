import { vi, expect, test, describe, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    place: {
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
  addPlace,
  deletePlace,
  updatePlaceName,
  updatePlaceGroup,
} from '../places'

// モックされたprismaを型アサーション
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prismaMock = prisma as any

describe('Places Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('addPlace', () => {
    test('正常に場所を作成する（グループ指定あり）', async () => {
      const formData = new FormData()
      formData.set('placeName', 'テスト場所')
      formData.set('placeGroupId', '1')

      await addPlace(formData)

      expect(prismaMock.place.create).toHaveBeenCalledWith({
        data: { name: 'テスト場所', groupId: 1 },
      })
      expect(regenerateThisWeekAssignments).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/admin')
      expect(revalidatePath).toHaveBeenCalledWith('/')
    })

    test('正常に場所を作成する（グループ指定なし）', async () => {
      const formData = new FormData()
      formData.set('placeName', 'テスト場所')

      await addPlace(formData)

      expect(prismaMock.place.create).toHaveBeenCalledWith({
        data: { name: 'テスト場所', groupId: null },
      })
      expect(regenerateThisWeekAssignments).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/admin')
      expect(revalidatePath).toHaveBeenCalledWith('/')
    })

    test('場所名が空の場合は何もしない', async () => {
      const formData = new FormData()
      formData.set('placeName', '')

      await addPlace(formData)

      expect(prismaMock.place.create).not.toHaveBeenCalled()
      expect(regenerateThisWeekAssignments).not.toHaveBeenCalled()
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })

  describe('deletePlace', () => {
    test('正常に場所を削除する（当番割当あり）', async () => {
      const formData = new FormData()
      formData.set('placeId', '1')

      prismaMock.week.findUnique.mockResolvedValue({
        assignments: [{ placeId: 1 }],
      })

      await deletePlace(formData)

      expect(getWeekStart).toHaveBeenCalled()
      expect(prismaMock.week.findUnique).toHaveBeenCalledWith({
        where: { startDate: new Date('2023-01-02') },
        include: { assignments: true },
      })
      expect(prismaMock.place.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      })
      expect(regenerateThisWeekAssignments).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/admin')
      expect(revalidatePath).toHaveBeenCalledWith('/')
    })

    test('正常に場所を削除する（当番割当なし）', async () => {
      const formData = new FormData()
      formData.set('placeId', '1')

      prismaMock.week.findUnique.mockResolvedValue({
        assignments: [{ placeId: 2 }],
      })

      await deletePlace(formData)

      expect(prismaMock.place.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      })
      expect(regenerateThisWeekAssignments).not.toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/admin')
      expect(revalidatePath).toHaveBeenCalledWith('/')
    })

    test('場所IDが0の場合は何もしない', async () => {
      const formData = new FormData()
      formData.set('placeId', '0')

      await deletePlace(formData)

      expect(prismaMock.place.delete).not.toHaveBeenCalled()
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })

  describe('updatePlaceName', () => {
    test('正常に場所名を更新する', async () => {
      const formData = new FormData()
      formData.set('placeId', '1')
      formData.set('placeName', '新しい場所名')

      await updatePlaceName(formData)

      expect(prismaMock.place.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: '新しい場所名' },
      })
      expect(revalidatePath).toHaveBeenCalledWith('/admin')
      expect(revalidatePath).toHaveBeenCalledWith('/')
    })

    test('IDまたは名前が無効な場合は何もしない', async () => {
      const formData = new FormData()
      formData.set('placeId', '0')
      formData.set('placeName', '新しい場所名')

      await updatePlaceName(formData)

      expect(prismaMock.place.update).not.toHaveBeenCalled()
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })

  describe('updatePlaceGroup', () => {
    test('正常に場所のグループを更新する', async () => {
      const formData = new FormData()
      formData.set('placeId', '1')
      formData.set('placeGroupId', '2')

      await updatePlaceGroup(formData)

      expect(prismaMock.place.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { groupId: 2 },
      })
      expect(regenerateThisWeekAssignments).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/admin')
      expect(revalidatePath).toHaveBeenCalledWith('/')
    })

    test('グループIDをnullに更新する', async () => {
      const formData = new FormData()
      formData.set('placeId', '1')

      await updatePlaceGroup(formData)

      expect(prismaMock.place.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { groupId: null },
      })
      expect(regenerateThisWeekAssignments).toHaveBeenCalled()
    })

    test('場所IDが無効な場合は何もしない', async () => {
      const formData = new FormData()
      formData.set('placeId', '0')

      await updatePlaceGroup(formData)

      expect(prismaMock.place.update).not.toHaveBeenCalled()
      expect(revalidatePath).not.toHaveBeenCalled()
    })
  })
})
