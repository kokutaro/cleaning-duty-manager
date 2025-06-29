'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { regenerateThisWeekAssignments } from '@/lib/rotation'
import { getWeekStart } from '@/lib/week'

export async function addMember(formData: FormData) {
  const name = formData.get('memberName') as string
  const groupIdValue = formData.get('memberGroupId') as string
  const groupId = groupIdValue ? Number(groupIdValue) : null
  if (name) {
    await prisma.member.create({ data: { name, groupId } })
    await regenerateThisWeekAssignments()
    revalidatePath('/admin')
    revalidatePath('/')
  }
}

export async function deleteMember(formData: FormData) {
  const id = Number(formData.get('memberId'))
  if (!id) return

  // サーバーアクション内で再取得
  const weekStart = getWeekStart()
  const week = await prisma.week.findUnique({
    where: { startDate: weekStart },
    include: { assignments: true },
  })

  const assigned = week?.assignments.some(a => a.memberId === id)
  await prisma.member.delete({ where: { id } })
  if (assigned) {
    await regenerateThisWeekAssignments()
  }
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function updateMemberName(formData: FormData) {
  const id = Number(formData.get('memberId'))
  const name = formData.get('memberName') as string
  if (!id || !name) return
  await prisma.member.update({ where: { id }, data: { name } })
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function updateMemberGroup(formData: FormData) {
  const id = Number(formData.get('memberId'))
  const groupIdValue = formData.get('memberGroupId') as string
  const groupId = groupIdValue ? Number(groupIdValue) : null
  if (!id) return
  await prisma.member.update({ where: { id }, data: { groupId } })
  await regenerateThisWeekAssignments()
  revalidatePath('/admin')
  revalidatePath('/')
}
