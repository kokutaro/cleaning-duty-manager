'use client'

import { Loader } from '@mantine/core'

export interface SpinnerProps {
  size?: number | string
  color?: string
  className?: string
}

export function Spinner({
  size = 16,
  color = 'blue',
  className = 'mr-2',
}: SpinnerProps) {
  return <Loader size={size} color={color} className={className} />
}
