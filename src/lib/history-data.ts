import { prisma } from '@/lib/prisma'
import { getAssignmentCounts } from '@/lib/history'

export type WeekWithAssignments = {
  id: number
  startDate: Date
  assignments: {
    id: number
    placeId: number
    memberId: number
    place: {
      id: number
      name: string
    }
    member: {
      id: number
      name: string
    }
  }[]
}

export type CleaningCountMatrix = {
  members: string[]
  places: string[]
  matrix: Record<string, Record<string, number>>
}

export async function getWeeksWithAssignments(): Promise<
  WeekWithAssignments[]
> {
  const weeks = await prisma.week.findMany({
    orderBy: { startDate: 'desc' },
    include: {
      assignments: {
        include: { place: true, member: true },
        orderBy: { placeId: 'asc' },
      },
    },
  })

  return weeks
}

export async function getCleaningCountMatrix(): Promise<CleaningCountMatrix> {
  const countList = (await getAssignmentCounts()).sort(
    (a, b) =>
      a.memberName.localeCompare(b.memberName) ||
      a.placeName.localeCompare(b.placeName)
  )

  const members = Array.from(new Set(countList.map(c => c.memberName))).sort(
    (a, b) => a.localeCompare(b)
  )
  const places = Array.from(new Set(countList.map(c => c.placeName))).sort(
    (a, b) => a.localeCompare(b)
  )

  const matrix: Record<string, Record<string, number>> = {}
  for (const c of countList) {
    if (!matrix[c.memberName]) matrix[c.memberName] = {}
    matrix[c.memberName][c.placeName] = c.count
  }

  return {
    members,
    places,
    matrix,
  }
}
