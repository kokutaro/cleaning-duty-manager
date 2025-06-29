import React from 'react'
import { render, fireEvent, cleanup } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { ConfirmDeleteButton } from '../ConfirmDeleteButton'
import { vi, expect, test, afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})

test('calls confirm on click', () => {
  const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
  const { getByText } = render(
    <MantineProvider>
      <ConfirmDeleteButton>Delete</ConfirmDeleteButton>
    </MantineProvider>
  )
  fireEvent.click(getByText('Delete'))
  expect(confirmSpy).toHaveBeenCalled()
  confirmSpy.mockRestore()
})

test('prevents default when canceled', () => {
  const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
  const { getByText } = render(
    <MantineProvider>
      <ConfirmDeleteButton>Delete</ConfirmDeleteButton>
    </MantineProvider>
  )
  const button = getByText('Delete')
  const event = new MouseEvent('click', { bubbles: true, cancelable: true })
  const pd = vi.fn()
  Object.defineProperty(event, 'preventDefault', {
    value: pd,
    configurable: true,
  })
  button.dispatchEvent(event)
  expect(confirmSpy).toHaveBeenCalled()
  expect(pd).toHaveBeenCalled()
  confirmSpy.mockRestore()
})
