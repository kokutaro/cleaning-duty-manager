import { prisma } from '@/lib/prisma'
import { autoRotateIfNeeded } from '@/lib/rotation'
import { getWeekStart } from '@/lib/week'
import { type Member, type Place, type Group } from '@prisma/client'

export type MemberWithGroup = Member & {
  group: Group | null
}

export type PlaceWithGroup = Place & {
  group: Group | null
}

export type AssignmentData = {
  place: PlaceWithGroup
  member: MemberWithGroup | null
}

export type GroupedAssignments = {
  name: string
  places: AssignmentData[]
  noneMembers: MemberWithGroup[]
}

export async function getDutyAssignmentData(now: Date = new Date()) {
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

  return {
    weekStart,
    members,
    groupedAssignments,
  }
}
