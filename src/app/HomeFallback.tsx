'use client'

import { Spinner } from '@/components/Spinner'

export default function HomeFallback() {
  return (
    <div className="flex justify-center py-10">
      <Spinner className="h-6 w-6 text-white" />
    </div>
  )
}
