import { MantineProvider } from '@mantine/core'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { ConfirmDeleteButton } from '../ConfirmDeleteButton'

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
