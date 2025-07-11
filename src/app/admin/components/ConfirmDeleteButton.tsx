'use client'

import { Button, type ButtonProps } from '@/components/Button'
import { Spinner } from '@/components/Spinner'
import { useFormStatus } from 'react-dom'

export function ConfirmDeleteButton({
  children,
  onClick,
  disabled,
  ...props
}: ButtonProps) {
  const { pending } = useFormStatus()
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm('本当に削除しますか？')) {
      e.preventDefault()
      return
    }
    onClick?.(e)
  }
  return (
    <Button
      variant="danger"
      {...props}
      disabled={pending || disabled}
      onClick={handleClick}
    >
      {pending && <Spinner />}
      {children}
    </Button>
  )
}
