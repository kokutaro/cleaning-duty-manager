'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AppShell, Burger, Group, Stack } from '@mantine/core'
import { HomeIcon, Cog6ToothIcon, ClockIcon } from '@heroicons/react/24/outline'

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
    <AppShell
      padding="md"
      navbar={{ width: 220, breakpoint: 'sm', collapsed: { mobile: !open } }}
      header={{ height: 60 }}
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={open} onClick={handleToggle} hiddenFrom="sm" size="sm" />
          <h1 className="text-xl font-bold">お掃除当番管理</h1>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Stack>
          <Link
            href="/"
            onClick={handleLinkClick}
            data-active={pathname === '/'}
          >
            <Group gap="sm">
              <HomeIcon className="w-5 h-5" />
              <span>トップページ</span>
            </Group>
          </Link>
          <Link
            href="/history"
            onClick={handleLinkClick}
            data-active={pathname === '/history'}
          >
            <Group gap="sm">
              <ClockIcon className="w-5 h-5" />
              <span>履歴</span>
            </Group>
          </Link>
          <Link
            href="/admin"
            onClick={handleLinkClick}
            data-active={pathname === '/admin'}
          >
            <Group gap="sm">
              <Cog6ToothIcon className="w-5 h-5" />
              <span>管理画面</span>
            </Group>
          </Link>
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main className="min-h-screen flex flex-col items-center justify-center">
        {children}
      </AppShell.Main>
    </AppShell>
  )
}
