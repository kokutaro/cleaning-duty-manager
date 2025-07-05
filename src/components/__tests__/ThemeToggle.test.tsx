import * as React from 'react'
import { MantineProvider } from '@mantine/core'
import { render, waitFor, fireEvent } from '@testing-library/react'
import { expect, test, vi, type Mock } from 'vitest'

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

const { useMantineColorScheme } = await import('@mantine/core')

test('renders ThemeToggle component', async () => {
  const { ThemeToggle } = await import('../ThemeToggle')
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
    const segmented = container.querySelector(
      '[class*="mantine-SegmentedControl"]'
    ) as HTMLElement
    expect(segmented.getAttribute('data-disabled')).toBeNull()
  })
})

test('renders SegmentedControl with correct aria-label', async () => {
  const { ThemeToggle } = await import('../ThemeToggle')
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

test('renders disabled SegmentedControl before mount', async () => {
  vi.doMock('react', async () => {
    const actual = await vi.importActual<typeof import('react')>('react')
    return { ...actual, useEffect: () => {} }
  })
  vi.resetModules()
  const { ThemeToggle } = await import('../ThemeToggle')
  const { container } = render(
    <MantineProvider>
      <ThemeToggle />
    </MantineProvider>
  )
  const segmented = container.querySelector(
    '[class*="mantine-SegmentedControl"]'
  ) as HTMLElement
  expect(segmented.getAttribute('data-disabled')).toBe('true')
  vi.doUnmock('react')
  vi.resetModules()
})

test('enables SegmentedControl after mount', async () => {
  const { ThemeToggle } = await import('../ThemeToggle')
  const { container } = render(
    <MantineProvider>
      <ThemeToggle />
    </MantineProvider>
  )

  await waitFor(() => {
    const after = container.querySelector(
      '[class*="mantine-SegmentedControl"]'
    ) as HTMLElement
    expect(after?.getAttribute('data-disabled')).toBeNull()
  })
})

test('calls setColorScheme on change', async () => {
  const { ThemeToggle } = await import('../ThemeToggle')
  const setColorScheme = vi.fn()
  ;(useMantineColorScheme as unknown as Mock).mockReturnValue({
    colorScheme: 'light',
    setColorScheme,
  })

  const { container } = render(
    <MantineProvider>
      <ThemeToggle />
    </MantineProvider>
  )

  await waitFor(() => {
    expect(
      container.querySelector('[class*="mantine-SegmentedControl"]')
    ).toBeTruthy()
  })

  const darkInput = container.querySelector('input[value="dark"]')
  expect(darkInput).toBeTruthy()
  if (darkInput) {
    const label = container.querySelector(`label[for="${darkInput.id}"]`)
    if (label) fireEvent.click(label)
  }
  await waitFor(() => {
    expect(setColorScheme).toHaveBeenCalledWith('dark')
  })
})
