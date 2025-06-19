import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { Button } from '../Button';
import { vi, expect, test, afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

test('applies variant classes', () => {
  const { getByText } = render(<Button variant="success">OK</Button>);
  const btn = getByText('OK');
  expect(btn.className).toContain('bg-green-600');
  expect(btn.className).toContain('hover:bg-green-700');
});

test('handles click event', () => {
  const onClick = vi.fn();
  const { getByText } = render(<Button onClick={onClick}>Click</Button>);
  fireEvent.click(getByText('Click'));
  expect(onClick).toHaveBeenCalled();
});
