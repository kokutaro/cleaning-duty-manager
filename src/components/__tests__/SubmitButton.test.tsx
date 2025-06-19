import React from 'react';
import { render } from '@testing-library/react';
import { vi, expect, test } from 'vitest';
import { SubmitButton } from '../SubmitButton';

vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
  return { ...actual, useFormStatus: vi.fn(() => ({ pending: false })) };
});

const { useFormStatus } = await import('react-dom');

test('renders children', () => {
  const { getByText } = render(<SubmitButton>Send</SubmitButton>);
  expect(getByText('Send')).toBeTruthy();
});

test('shows spinner when pending', () => {
  (useFormStatus as unknown as vi.Mock).mockReturnValueOnce({ pending: true });
  const { container } = render(<SubmitButton>Send</SubmitButton>);
  expect(container.querySelector('svg')).toBeTruthy();
});
