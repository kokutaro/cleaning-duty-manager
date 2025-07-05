import { MantineProvider } from '@mantine/core'
import { render } from '@testing-library/react'
import { expect, test } from 'vitest'
import { Spinner } from '../Spinner'

test('renders Spinner component', () => {
  const { container } = render(
    <MantineProvider>
      <Spinner />
    </MantineProvider>
  )
  // MantineのLoaderコンポーネントが含まれているかを確認
  expect(container.querySelector('[class*="mantine-Loader"]')).toBeTruthy()
})

test('renders Spinner with custom size', () => {
  const { container } = render(
    <MantineProvider>
      <Spinner size="lg" />
    </MantineProvider>
  )
  expect(container.querySelector('[class*="mantine-Loader"]')).toBeTruthy()
})

test('renders Spinner with custom color', () => {
  const { container } = render(
    <MantineProvider>
      <Spinner color="red" />
    </MantineProvider>
  )
  expect(container.querySelector('[class*="mantine-Loader"]')).toBeTruthy()
})

test('renders Spinner with custom className', () => {
  const { container } = render(
    <MantineProvider>
      <Spinner className="custom-spinner" />
    </MantineProvider>
  )
  expect(container.querySelector('.custom-spinner')).toBeTruthy()
})
