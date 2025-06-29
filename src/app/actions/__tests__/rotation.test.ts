import { vi, expect, test } from 'vitest'

vi.mock('@/lib/rotation', () => ({
  advanceCurrentWeekRotation: vi.fn(),
}))
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { advanceCurrentWeekRotation } from '@/lib/rotation'
import { revalidatePath } from 'next/cache'
import { updateRotation } from '../rotation'

test('calls rotation helpers', async () => {
  await updateRotation()
  expect(advanceCurrentWeekRotation).toHaveBeenCalled()
  expect(revalidatePath).toHaveBeenCalledWith('/')
})
