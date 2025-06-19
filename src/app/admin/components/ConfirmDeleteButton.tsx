'use client';

import React from 'react';

export function ConfirmDeleteButton({ children, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      {...props}
      onClick={e => {
        if (!confirm('本当に削除しますか？')) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}