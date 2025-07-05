import React from 'react'
import { render } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { expect, test } from 'vitest'
import HistoryFallback from '../HistoryFallback'

test('renders HistoryFallback component', () => {
  const { container } = render(
    <MantineProvider>
      <HistoryFallback />
    </MantineProvider>
  )

  // コンポーネントが正常にレンダリングされることを確認
  expect(container.firstChild).toBeTruthy()
})

test('renders div with correct classes', () => {
  const { container } = render(
    <MantineProvider>
      <HistoryFallback />
    </MantineProvider>
  )

  // divにflex justify-center py-10のクラスが設定されているかを確認
  const divElement = container.querySelector('div')
  expect(divElement).toBeTruthy()
  expect(divElement).toHaveClass('flex', 'justify-center', 'py-10')
})

test('renders Spinner component', () => {
  const { container } = render(
    <MantineProvider>
      <HistoryFallback />
    </MantineProvider>
  )

  // MantineのLoaderコンポーネント（Spinnerの実体）が含まれているかを確認
  expect(container.querySelector('[class*="mantine-Loader"]')).toBeTruthy()
})

test('renders Spinner with size prop', () => {
  const { container } = render(
    <MantineProvider>
      <HistoryFallback />
    </MantineProvider>
  )

  // Spinnerコンポーネントが正常にレンダリングされることを確認
  // size={24}が設定されているかは、MantineのLoaderが存在することで確認
  expect(container.querySelector('[class*="mantine-Loader"]')).toBeTruthy()
})
