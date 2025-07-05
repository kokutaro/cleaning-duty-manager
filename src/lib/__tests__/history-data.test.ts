import { vi, expect, test, describe } from 'vitest'

vi.mock('../prisma', () => {
  const mockWeeks = [
    {
      id: 1,
      startDate: new Date('2023-01-02'),
      assignments: [
        {
          id: 1,
          placeId: 1,
          memberId: 1,
          place: { id: 1, name: 'Room' },
          member: { id: 1, name: 'Alice' },
        },
      ],
    },
    {
      id: 2,
      startDate: new Date('2023-01-09'),
      assignments: [
        {
          id: 2,
          placeId: 2,
          memberId: 2,
          place: { id: 2, name: 'Hall' },
          member: { id: 2, name: 'Bob' },
        },
      ],
    },
  ]

  const prisma = {
    week: {
      findMany: vi.fn().mockResolvedValue(mockWeeks),
    },
  }
  return { prisma }
})

vi.mock('../history', () => {
  const mockCountList = [
    {
      memberId: 1,
      memberName: 'Alice',
      placeId: 1,
      placeName: 'Room',
      count: 2,
    },
    {
      memberId: 2,
      memberName: 'Bob',
      placeId: 2,
      placeName: 'Hall',
      count: 1,
    },
    {
      memberId: 1,
      memberName: 'Alice',
      placeId: 2,
      placeName: 'Hall',
      count: 1,
    },
  ]

  return {
    getAssignmentCounts: vi.fn().mockResolvedValue(mockCountList),
  }
})

import {
  getWeeksWithAssignments,
  getCleaningCountMatrix,
} from '../history-data'

describe('getWeeksWithAssignments', () => {
  test('週データとアサイン情報を取得する', async () => {
    const result = await getWeeksWithAssignments()

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe(1)
    expect(result[0].assignments).toHaveLength(1)
    expect(result[0].assignments[0].place.name).toBe('Room')
    expect(result[0].assignments[0].member.name).toBe('Alice')
  })
})

describe('getCleaningCountMatrix', () => {
  test('掃除回数の集計とマトリックスを作成する', async () => {
    const result = await getCleaningCountMatrix()

    expect(result.members).toEqual(['Alice', 'Bob'])
    expect(result.places).toEqual(['Hall', 'Room'])
    expect(result.matrix).toEqual({
      Alice: { Hall: 1, Room: 2 },
      Bob: { Hall: 1 },
    })
  })

  test('メンバーと場所が正しくソートされる', async () => {
    const result = await getCleaningCountMatrix()

    expect(result.members).toEqual(['Alice', 'Bob'])
    expect(result.places).toEqual(['Hall', 'Room'])
  })

  test('カウントが存在しない場合は0になる', async () => {
    const result = await getCleaningCountMatrix()

    expect(result.matrix.Bob.Room).toBeUndefined()
    expect(result.matrix.Alice.Hall).toBe(1)
    expect(result.matrix.Alice.Room).toBe(2)
  })
})
