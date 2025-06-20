import { Suspense } from 'react'
import HistoryFallback from './HistoryFallback'
import { HistoryContent } from './HistoryContent'

export const dynamic = 'force-dynamic'

export default function HistoryPage() {
  return (
    <main className="max-w-4xl mx-auto py-10 flex flex-col gap-10">
      <Suspense fallback={<HistoryFallback />}>
        <HistoryContent />
      </Suspense>
    </main>
  )
}
