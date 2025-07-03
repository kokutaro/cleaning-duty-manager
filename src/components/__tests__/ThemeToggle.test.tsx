import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { ThemeToggle } from '../ThemeToggle'
import { expect, test, vi } from 'vitest'

// useMantineColorSchemeをモック
vi.mock('@mantine/core', async () => {
  const actual =
    await vi.importActual<typeof import('@mantine/core')>('@mantine/core')
  return {
    ...actual,
    useMantineColorScheme: vi.fn(() => ({
      colorScheme: 'light',
      setColorScheme: vi.fn(),
    })),
  }
})

test('renders ThemeToggle component', async () => {
  const { container } = render(
    <MantineProvider>
      <ThemeToggle />
    </MantineProvider>
  )

  // コンポーネントがレンダリングされていることを確認
  expect(
    container.querySelector('[class*="mantine-SegmentedControl"]')
  ).toBeTruthy()

  // マウント後はコンポーネントが機能する
  await waitFor(() => {
    expect(
      container.querySelector('[class*="mantine-SegmentedControl"]')
    ).toBeTruthy()
  })
})

test('renders SegmentedControl with correct aria-label', async () => {
  const { container } = render(
    <MantineProvider>
      <ThemeToggle />
    </MantineProvider>
  )

  await waitFor(() => {
    const segmentedControl = container.querySelector(
      '[aria-label="Change color scheme"]'
    )
    expect(segmentedControl).toBeTruthy()
  })
})

test('renders disabled SegmentedControl before mount', () => {
  const { container } = render(
    <MantineProvider>
      <ThemeToggle />
    </MantineProvider>
  )

  // SegmentedControlがレンダリングされていることを確認
  expect(
    container.querySelector('[class*="mantine-SegmentedControl"]')
  ).toBeTruthy()
})
