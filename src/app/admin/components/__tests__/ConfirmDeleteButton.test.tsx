import { MantineProvider } from '@mantine/core'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, expect, test, vi, type Mock } from 'vitest'
import { ConfirmDeleteButton } from '../ConfirmDeleteButton'

vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom')
  return { ...actual, useFormStatus: vi.fn(() => ({ pending: false })) }
})

const { useFormStatus } = await import('react-dom')

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

test('calls onClick when confirmed', () => {
  const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
  const handleClick = vi.fn()
  const { getByText } = render(
    <MantineProvider>
      <ConfirmDeleteButton onClick={handleClick}>Delete</ConfirmDeleteButton>
    </MantineProvider>
  )
  fireEvent.click(getByText('Delete'))
  expect(handleClick).toHaveBeenCalled()
  confirmSpy.mockRestore()
})

test('shows spinner and disables button when pending', () => {
  ;(useFormStatus as unknown as Mock).mockReturnValueOnce({ pending: true })
  const { container, getByRole } = render(
    <MantineProvider>
      <ConfirmDeleteButton>Delete</ConfirmDeleteButton>
    </MantineProvider>
  )
  expect(getByRole('button')).toBeDisabled()
  expect(container.querySelector('[class*="mantine-Loader"]')).toBeTruthy()
})

test('disables button when disabled prop is true', () => {
  const { getByRole } = render(
    <MantineProvider>
      <ConfirmDeleteButton disabled>Delete</ConfirmDeleteButton>
    </MantineProvider>
  )
  expect(getByRole('button')).toBeDisabled()
})
