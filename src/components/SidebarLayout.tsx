'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AppShell, Burger, Group, Stack, NavLink } from '@mantine/core'
import { ThemeToggle } from './ThemeToggle'
import { HomeIcon, Cog6ToothIcon, ClockIcon } from '@heroicons/react/24/outline'

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const handleToggle = () => {
    setOpen(prev => !prev)
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
          <Burger
            opened={open}
            onClick={handleToggle}
            hiddenFrom="sm"
            size="sm"
          />
          <h1 className="text-xl font-bold">お掃除当番管理</h1>
          <ThemeToggle />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Stack>
          <NavLink
            component={Link}
            href="/"
            onClick={handleLinkClick}
            active={pathname === '/'}
            label="トップページ"
            leftSection={<HomeIcon className="w-5 h-5" />}
          />
          <NavLink
            component={Link}
            href="/history"
            onClick={handleLinkClick}
            active={pathname === '/history'}
            label="履歴"
            leftSection={<ClockIcon className="w-5 h-5" />}
          />
          <NavLink
            component={Link}
            href="/admin"
            onClick={handleLinkClick}
            active={pathname === '/admin'}
            label="管理画面"
            leftSection={<Cog6ToothIcon className="w-5 h-5" />}
          />
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main className="min-h-screen flex flex-col items-center justify-center">
        {children}
      </AppShell.Main>
    </AppShell>
  )
}
