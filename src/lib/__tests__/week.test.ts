import { getWeekStart } from '../week'
import { expect, test } from 'vitest'

test('returns Monday start of week', () => {
  const date = new Date(Date.UTC(2024, 0, 3)) // Wednesday 2024-01-03
  const start = getWeekStart(date)
  expect(start.getUTCDay()).toBe(1)
  expect(start.getUTCHours()).toBe(0)
})
