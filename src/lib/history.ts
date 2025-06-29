import { prisma } from './prisma'

export interface CountResult {
  memberId: number
  memberName: string
  placeId: number
  placeName: string
  count: number
}

export async function getAssignmentCounts(): Promise<CountResult[]> {
  const assignments = await prisma.dutyAssignment.findMany({
    include: { member: true, place: true },
  })

  const counts: Record<string, CountResult> = {}

  for (const a of assignments) {
    const key = `${a.memberId}-${a.placeId}`
    if (!counts[key]) {
      counts[key] = {
        memberId: a.memberId,
        memberName: a.member.name,
        placeId: a.placeId,
        placeName: a.place.name,
        count: 0,
      }
    }
    counts[key].count++
  }

  return Object.values(counts)
}
