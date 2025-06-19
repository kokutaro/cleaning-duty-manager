'use client';
import React from 'react';

export type ButtonVariant = 'primary' | 'success' | 'danger';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700',
  success: 'bg-green-600 hover:bg-green-700',
  danger: 'bg-red-600 hover:bg-red-700',
};

export interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: ButtonVariant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = 'primary', className = '', ...props }, ref) {
    const base = 'text-white px-4 py-1 rounded';
    const variantClass = variantClasses[variant];
    return (
      <button
        ref={ref}
        className={`${base} ${variantClass} ${className}`}
        {...props}
      />
    );
  }
);
