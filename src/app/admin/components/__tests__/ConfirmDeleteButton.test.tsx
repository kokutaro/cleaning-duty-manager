import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { ConfirmDeleteButton } from '../ConfirmDeleteButton';
import { vi, expect, test, afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

test('calls confirm on click', () => {
  const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
  const { getByText } = render(<ConfirmDeleteButton>Delete</ConfirmDeleteButton>);
  fireEvent.click(getByText('Delete'));
  expect(confirmSpy).toHaveBeenCalled();
  confirmSpy.mockRestore();
});

test('prevents default when canceled', () => {
  const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
  const { getByText } = render(<ConfirmDeleteButton>Delete</ConfirmDeleteButton>);
  const button = getByText('Delete');
  const event = new MouseEvent('click', { bubbles: true, cancelable: true });
  const pd = vi.fn();
  Object.defineProperty(event, 'preventDefault', { value: pd, configurable: true });
  button.dispatchEvent(event);
  expect(confirmSpy).toHaveBeenCalled();
  expect(pd).toHaveBeenCalled();
  confirmSpy.mockRestore();
});
