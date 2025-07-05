'use client'

import { useFormStatus } from 'react-dom'
import { Button, ButtonProps } from './Button'
import { Spinner } from './Spinner'

export function SubmitButton({ children, disabled, ...props }: ButtonProps) {
  const { pending } = useFormStatus()
  return (
    <Button {...props} disabled={pending || disabled}>
      {pending && <Spinner />}
      {children}
    </Button>
  )
}
