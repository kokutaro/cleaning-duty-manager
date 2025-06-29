import { prisma } from '@/lib/prisma'
import { autoRotateIfNeeded } from '@/lib/rotation'
import { getWeekStart } from '@/lib/week'
import { updateRotation } from './actions/rotation'
import { SubmitButton } from '@/components/SubmitButton'
import { Paper, Text } from '@mantine/core'
import { format } from 'date-fns'

export async function HomeContent() {
  const now = new Date()
  const weekStart = getWeekStart(now)
  await autoRotateIfNeeded(weekStart)

  const week = await prisma.week.findUnique({
    where: { startDate: weekStart },
    include: {
      assignments: {
        include: {
          place: true,
          member: true,
        },
      },
    },
  })

  const groups = await prisma.group.findMany({ orderBy: { id: 'asc' } })
  const members = await prisma.member.findMany({
    include: { group: true },
    orderBy: { id: 'asc' },
  })
  const places = await prisma.place.findMany({
    include: { group: true },
    orderBy: { id: 'asc' },
  })

  const assignmentsByPlace = places.map(place => {
    const assignment = week?.assignments.find(a => a.placeId === place.id)
    return { place, member: assignment?.member ?? null }
  })

  const assignedIds = assignmentsByPlace
    .map(a => a.member?.id)
    .filter((id): id is number => id !== undefined)
  const unassignedMembers = members.filter(m => !assignedIds.includes(m.id))

  const allGroups = [...groups, { id: null as number | null, name: '未割当' }]

  const groupedAssignments = allGroups.map(g => ({
    name: g.name,
    places: assignmentsByPlace.filter(p => p.place.groupId === g.id),
    noneMembers: unassignedMembers.filter(m => m.groupId === g.id),
  }))

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">今週のお掃除当番</h1>
      <Text size="sm" c="dimmed" className="mb-2">
        週の開始日: {format(weekStart, 'yyyy年MM月dd日')}
      </Text>
      <form action={updateRotation} className="mb-4">
        <SubmitButton type="submit">ローテーション更新</SubmitButton>
      </form>
      {members.length === 0 ? (
        <Text c="red">ユーザーが登録されていません。</Text>
      ) : (
        <>
          <div className="flex flex-col gap-8">
            {groupedAssignments.map(g => (
              <div key={g.name}>
                <h2 className="text-xl font-semibold mb-2">{g.name}</h2>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
                  {g.places.map(({ place, member }) => (
                    <Paper
                      key={place.id}
                      withBorder
                      p="md"
                      radius="md"
                      className="w-full sm:w-48"
                    >
                      <h3 className="text-lg font-semibold mb-2">
                        {place.name}
                      </h3>
                      <p>{member ? member.name : '未割当'}</p>
                    </Paper>
                  ))}
                  {g.noneMembers.length > 0 && (
                    <Paper
                      withBorder
                      p="md"
                      radius="md"
                      className="w-full sm:w-48"
                    >
                      <h3 className="text-lg font-semibold mb-2">なし</h3>
                      <ul className="list-disc list-inside">
                        {g.noneMembers.map(m => (
                          <li key={m.id}>{m.name}</li>
                        ))}
                      </ul>
                    </Paper>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}
