import React from 'react'
import { render } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { Spinner } from '../Spinner'
import { expect, test } from 'vitest'

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
