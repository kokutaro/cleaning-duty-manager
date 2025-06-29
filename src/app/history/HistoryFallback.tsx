'use client'

import { Spinner } from '@/components/Spinner'

export default function HistoryFallback() {
  return (
    <div className="flex justify-center py-10">
      <Spinner size={24} />
    </div>
  )
}
