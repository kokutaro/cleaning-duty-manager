import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { regenerateThisWeekAssignments } from '@/lib/rotation'
import { ConfirmDeleteButton } from './components/ConfirmDeleteButton'
import { getWeekStart } from '@/lib/week'
import { SubmitButton } from '@/components/SubmitButton'
import { TextInput, Select, Group, Stack } from '@mantine/core'

export default async function AdminPage() {
  const members = await prisma.member.findMany({ include: { group: true } })
  const places = await prisma.place.findMany({ include: { group: true } })
  const groups = await prisma.group.findMany()

  async function addMember(formData: FormData) {
    'use server'
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

  async function addPlace(formData: FormData) {
    'use server'
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

  async function deleteMember(formData: FormData) {
    'use server'
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

  async function deletePlace(formData: FormData) {
    'use server'
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

  async function updateMemberName(formData: FormData) {
    'use server'
    const id = Number(formData.get('memberId'))
    const name = formData.get('memberName') as string
    if (!id || !name) return
    await prisma.member.update({ where: { id }, data: { name } })
    revalidatePath('/admin')
    revalidatePath('/')
  }

  async function updatePlaceName(formData: FormData) {
    'use server'
    const id = Number(formData.get('placeId'))
    const name = formData.get('placeName') as string
    if (!id || !name) return
    await prisma.place.update({ where: { id }, data: { name } })
    revalidatePath('/admin')
    revalidatePath('/')
  }

  async function addGroup(formData: FormData) {
    'use server'
    const name = formData.get('groupName') as string
    if (name) {
      await prisma.group.create({ data: { name } })
      revalidatePath('/admin')
      revalidatePath('/')
    }
  }

  async function deleteGroup(formData: FormData) {
    'use server'
    const id = Number(formData.get('groupId'))
    if (!id) return
    await prisma.group.delete({ where: { id } })
    revalidatePath('/admin')
    revalidatePath('/')
  }

  async function updateMemberGroup(formData: FormData) {
    'use server'
    const id = Number(formData.get('memberId'))
    const groupIdValue = formData.get('memberGroupId') as string
    const groupId = groupIdValue ? Number(groupIdValue) : null
    if (!id) return
    await prisma.member.update({ where: { id }, data: { groupId } })
    await regenerateThisWeekAssignments()
    revalidatePath('/admin')
    revalidatePath('/')
  }

  async function updatePlaceGroup(formData: FormData) {
    'use server'
    const id = Number(formData.get('placeId'))
    const groupIdValue = formData.get('placeGroupId') as string
    const groupId = groupIdValue ? Number(groupIdValue) : null
    if (!id) return
    await prisma.place.update({ where: { id }, data: { groupId } })
    await regenerateThisWeekAssignments()
    revalidatePath('/admin')
    revalidatePath('/')
  }

  return (
    <main className="mx-auto w-full max-w-4xl py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">管理画面</h1>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">グループ登録</h2>
        <form action={addGroup} className="mb-4">
          <Group>
            <TextInput
              name="groupName"
              placeholder="グループ名"
              required
              style={{ flex: 1 }}
            />
            <SubmitButton type="submit">追加</SubmitButton>
          </Group>
        </form>
        <Stack
          gap="xs"
          className="border border-gray-300 dark:border-gray-700 rounded-md"
        >
          {groups.map(g => (
            <Group
              key={g.id}
              justify="space-between"
              className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <span>{g.name}</span>
              <form action={deleteGroup}>
                <input type="hidden" name="groupId" value={g.id} />
                <ConfirmDeleteButton type="submit">削除</ConfirmDeleteButton>
              </form>
            </Group>
          ))}
        </Stack>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">ユーザー登録</h2>
        <form action={addMember} className="mb-4">
          <Group>
            <TextInput
              name="memberName"
              placeholder="名前"
              required
              style={{ flex: 1 }}
            />
            <Select
              name="memberGroupId"
              placeholder="未割当"
              data={[
                { value: '', label: '未割当' },
                ...groups.map(g => ({ value: g.id.toString(), label: g.name })),
              ]}
              style={{ minWidth: 150 }}
              clearable
            />
            <SubmitButton type="submit">追加</SubmitButton>
          </Group>
        </form>
        <Stack
          gap="xs"
          className="border border-gray-300 dark:border-gray-700 rounded-md"
        >
          {members.map(m => (
            <div
              key={m.id}
              className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <Group justify="space-between" wrap="wrap">
                <form action={updateMemberName}>
                  <Group>
                    <input type="hidden" name="memberId" value={m.id} />
                    <TextInput
                      name="memberName"
                      defaultValue={m.name}
                      style={{ minWidth: 150 }}
                    />
                    <SubmitButton type="submit" variant="success">
                      保存
                    </SubmitButton>
                  </Group>
                </form>
                <Group>
                  <form action={updateMemberGroup}>
                    <Group>
                      <input type="hidden" name="memberId" value={m.id} />
                      <Select
                        name="memberGroupId"
                        defaultValue={m.groupId?.toString() ?? ''}
                        data={[
                          { value: '', label: '未割当' },
                          ...groups.map(g => ({
                            value: g.id.toString(),
                            label: g.name,
                          })),
                        ]}
                        style={{ minWidth: 120 }}
                        clearable
                      />
                      <SubmitButton type="submit" variant="success">
                        変更
                      </SubmitButton>
                    </Group>
                  </form>
                  <form action={deleteMember}>
                    <input type="hidden" name="memberId" value={m.id} />
                    <ConfirmDeleteButton type="submit">
                      削除
                    </ConfirmDeleteButton>
                  </form>
                </Group>
              </Group>
            </div>
          ))}
        </Stack>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">掃除場所登録</h2>
        <form action={addPlace} className="mb-4">
          <Group>
            <TextInput
              name="placeName"
              placeholder="場所名"
              required
              style={{ flex: 1 }}
            />
            <Select
              name="placeGroupId"
              placeholder="未割当"
              data={[
                { value: '', label: '未割当' },
                ...groups.map(g => ({ value: g.id.toString(), label: g.name })),
              ]}
              style={{ minWidth: 150 }}
              clearable
            />
            <SubmitButton variant="success" type="submit">
              追加
            </SubmitButton>
          </Group>
        </form>
        <Stack
          gap="xs"
          className="border border-gray-300 dark:border-gray-700 rounded-md"
        >
          {places.map(p => (
            <div
              key={p.id}
              className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <Group justify="space-between" wrap="wrap">
                <form action={updatePlaceName}>
                  <Group>
                    <input type="hidden" name="placeId" value={p.id} />
                    <TextInput
                      name="placeName"
                      defaultValue={p.name}
                      style={{ minWidth: 150 }}
                    />
                    <SubmitButton type="submit" variant="success">
                      保存
                    </SubmitButton>
                  </Group>
                </form>
                <Group>
                  <form action={updatePlaceGroup}>
                    <Group>
                      <input type="hidden" name="placeId" value={p.id} />
                      <Select
                        name="placeGroupId"
                        defaultValue={p.groupId?.toString() ?? ''}
                        data={[
                          { value: '', label: '未割当' },
                          ...groups.map(g => ({
                            value: g.id.toString(),
                            label: g.name,
                          })),
                        ]}
                        style={{ minWidth: 120 }}
                        clearable
                      />
                      <SubmitButton type="submit" variant="success">
                        変更
                      </SubmitButton>
                    </Group>
                  </form>
                  <form action={deletePlace}>
                    <input type="hidden" name="placeId" value={p.id} />
                    <ConfirmDeleteButton type="submit">
                      削除
                    </ConfirmDeleteButton>
                  </form>
                </Group>
              </Group>
            </div>
          ))}
        </Stack>
      </section>
    </main>
  )
}
