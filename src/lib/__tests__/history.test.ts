import { vi, expect, test } from 'vitest'

vi.mock('../prisma', () => {
  const prisma = {
    dutyAssignment: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 1,
          memberId: 1,
          placeId: 1,
          member: { id: 1, name: 'Alice' },
          place: { id: 1, name: 'Room' },
        },
        {
          id: 2,
          memberId: 1,
          placeId: 1,
          member: { id: 1, name: 'Alice' },
          place: { id: 1, name: 'Room' },
        },
        {
          id: 3,
          memberId: 2,
          placeId: 2,
          member: { id: 2, name: 'Bob' },
          place: { id: 2, name: 'Hall' },
        },
      ]),
    },
  }
  return { prisma }
})

import { getAssignmentCounts } from '../history'

test('aggregates duty counts', async () => {
  const counts = await getAssignmentCounts()
  counts.sort((a, b) => a.memberId - b.memberId)
  expect(counts).toEqual([
    {
      memberId: 1,
      memberName: 'Alice',
      placeId: 1,
      placeName: 'Room',
      count: 2,
    },
    { memberId: 2, memberName: 'Bob', placeId: 2, placeName: 'Hall', count: 1 },
  ])
})
