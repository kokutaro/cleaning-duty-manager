'use client'

import { useState } from 'react'
import Link from 'next/link'

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-screen flex overflow-x-hidden relative">
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-56 bg-neutral-950 border-r border-neutral-800 flex flex-col p-6 gap-4 shadow-sm transition-transform transform ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <h1 className="text-xl font-bold mb-6 text-neutral-300">お掃除当番管理</h1>
        <nav className="flex flex-col gap-2">
          <Link href="/" className="hover:underline text-cyan-400">
            トップページ
          </Link>
          <Link href="/admin" className="hover:underline text-cyan-400">
            管理画面
          </Link>
        </nav>
      </aside>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 fixed top-4 left-4 z-50 bg-neutral-800 rounded"
        aria-label="メニュー"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>
      <main className="flex-1 p-8 bg-neutral-900 text-neutral-100 min-h-screen flex flex-col items-center justify-center">
        {children}
      </main>
    </div>
  )
}
