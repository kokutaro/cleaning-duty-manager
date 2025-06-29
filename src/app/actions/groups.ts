'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addGroup(formData: FormData) {
  const name = formData.get('groupName') as string
  if (name) {
    await prisma.group.create({ data: { name } })
    revalidatePath('/admin')
    revalidatePath('/')
  }
}

export async function deleteGroup(formData: FormData) {
  const id = Number(formData.get('groupId'))
  if (!id) return
  await prisma.group.delete({ where: { id } })
  revalidatePath('/admin')
  revalidatePath('/')
}
