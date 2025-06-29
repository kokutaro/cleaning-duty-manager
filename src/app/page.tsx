import { Suspense } from 'react'
import HomeFallback from './HomeFallback'
import { HomeContent } from './HomeContent'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto py-10 flex flex-col gap-10">
      <Suspense fallback={<HomeFallback />}>
        <HomeContent />
      </Suspense>
    </main>
  )
}
