'use client';

import React from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/Button';
import { Spinner } from '@/components/Spinner';

export function ConfirmDeleteButton({ children, ...props }: React.ComponentProps<'button'>) {
  const { pending } = useFormStatus();
  return (
    <Button
      variant="danger"
      {...props}
      disabled={pending}
      onClick={(e) => {
        if (!confirm('本当に削除しますか？')) {
          e.preventDefault();
        }
      }}
    >
      {pending && <Spinner />}
      {children}
    </Button>
  );
}