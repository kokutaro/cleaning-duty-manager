'use client';

import React from 'react';
import { Button } from '@/components/Button';

export function ConfirmDeleteButton({ children, ...props }: React.ComponentProps<'button'>) {
  return (
    <Button
      variant="danger"
      {...props}
      onClick={e => {
        if (!confirm('本当に削除しますか？')) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </Button>
  );
}