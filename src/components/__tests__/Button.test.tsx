import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Button } from '../Button';
import { vi, expect, test, afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

test('renders a button element', () => {
  const { getByRole } = render(
    <MantineProvider>
      <Button variant="success">OK</Button>
    </MantineProvider>
  );
  const btn = getByRole('button');
  expect(btn).toBeTruthy();
});

test('handles click event', () => {
  const onClick = vi.fn();
  const { getByText } = render(
    <MantineProvider>
      <Button onClick={onClick}>Click</Button>
    </MantineProvider>
  );
  fireEvent.click(getByText('Click'));
  expect(onClick).toHaveBeenCalled();
});
