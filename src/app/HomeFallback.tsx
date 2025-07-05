'use client'

import React from 'react'
import { Spinner } from '@/components/Spinner'

export default function HomeFallback() {
  return (
    <div className="flex justify-center py-10">
      <Spinner size={24} />
    </div>
  )
}
