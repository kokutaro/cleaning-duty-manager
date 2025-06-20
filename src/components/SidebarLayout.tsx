'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const handleToggle = () => {
    setOpen((prev) => !prev)
  }

  const handleLinkClick = () => {
    setOpen(false)
  }
  return (
    <div className="min-h-screen flex overflow-x-hidden relative">
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-56 bg-neutral-950 border-r border-neutral-800 flex flex-col p-6 gap-4 shadow-sm transition-transform transform ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <h1 className="text-xl font-bold mb-6 text-neutral-300">お掃除当番管理</h1>
        <nav className="flex flex-col gap-1">
          <Link
            href="/"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white ${pathname === '/' ? 'bg-neutral-800 text-white' : ''}`}
          >
            <HomeIcon className="w-5 h-5" />
            <span>トップページ</span>
          </Link>
          <Link
            href="/admin"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white ${pathname === '/admin' ? 'bg-neutral-800 text-white' : ''}`}
          >
            <Cog6ToothIcon className="w-5 h-5" />
            <span>管理画面</span>
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
        onClick={handleToggle}
        className={`md:hidden p-2 fixed top-4 left-4 z-50 bg-neutral-800 rounded transition-transform transform ${open ? 'translate-x-56' : ''}`}
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
