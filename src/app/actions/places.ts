'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { regenerateThisWeekAssignments } from '@/lib/rotation'
import { getWeekStart } from '@/lib/week'

export async function addPlace(formData: FormData) {
  const name = formData.get('placeName') as string
  const groupIdValue = formData.get('placeGroupId') as string
  const groupId = groupIdValue ? Number(groupIdValue) : null
  if (name) {
    await prisma.place.create({ data: { name, groupId } })
    await regenerateThisWeekAssignments()
    revalidatePath('/admin')
    revalidatePath('/')
  }
}

export async function deletePlace(formData: FormData) {
  const id = Number(formData.get('placeId'))
  if (!id) return

  // サーバーアクション内で再取得
  const weekStart = getWeekStart()
  const week = await prisma.week.findUnique({
    where: { startDate: weekStart },
    include: { assignments: true },
  })

  const assigned = week?.assignments.some(a => a.placeId === id)
  await prisma.place.delete({ where: { id } })
  if (assigned) {
    await regenerateThisWeekAssignments()
  }
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function updatePlaceName(formData: FormData) {
  const id = Number(formData.get('placeId'))
  const name = formData.get('placeName') as string
  if (!id || !name) return
  await prisma.place.update({ where: { id }, data: { name } })
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function updatePlaceGroup(formData: FormData) {
  const id = Number(formData.get('placeId'))
  const groupIdValue = formData.get('placeGroupId') as string
  const groupId = groupIdValue ? Number(groupIdValue) : null
  if (!id) return
  await prisma.place.update({ where: { id }, data: { groupId } })
  await regenerateThisWeekAssignments()
  revalidatePath('/admin')
  revalidatePath('/')
}
