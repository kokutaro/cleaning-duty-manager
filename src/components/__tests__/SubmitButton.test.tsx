import React from 'react'
import { render } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { vi, expect, test, type Mock } from 'vitest'
import { SubmitButton } from '../SubmitButton'

vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom')
  return { ...actual, useFormStatus: vi.fn(() => ({ pending: false })) }
})

const { useFormStatus } = await import('react-dom')

test('renders children', () => {
  const { getByText } = render(
    <MantineProvider>
      <SubmitButton>Send</SubmitButton>
    </MantineProvider>
  )
  expect(getByText('Send')).toBeTruthy()
})

test('shows spinner when pending', () => {
  ;(useFormStatus as unknown as Mock).mockReturnValueOnce({ pending: true })
  const { container } = render(
    <MantineProvider>
      <SubmitButton>Send</SubmitButton>
    </MantineProvider>
  )
  // Mantine Loaderは'mantine-Loader-root'クラスを持つ要素を生成する
  expect(container.querySelector('[class*="mantine-Loader"]')).toBeTruthy()
})
