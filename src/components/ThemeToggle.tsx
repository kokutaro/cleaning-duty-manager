'use client'
import React, { useState, useEffect } from 'react'
import { useMantineColorScheme, SegmentedControl } from '@mantine/core'
import {
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline'

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Hydrationエラーを防ぐため、クライアントサイドでマウントされるまで待機
  if (!mounted) {
    return (
      <SegmentedControl
        value="auto"
        onChange={() => {}}
        data={[
          {
            value: 'auto',
            label: <ComputerDesktopIcon className="w-4 h-4" />,
          },
          { value: 'light', label: <SunIcon className="w-4 h-4" /> },
          { value: 'dark', label: <MoonIcon className="w-4 h-4" /> },
        ]}
        size="xs"
        aria-label="Change color scheme"
        disabled
      />
    )
  }

  return (
    <SegmentedControl
      value={colorScheme}
      onChange={value => setColorScheme(value as 'light' | 'dark' | 'auto')}
      data={[
        {
          value: 'auto',
          label: <ComputerDesktopIcon className="w-4 h-4" />,
        },
        { value: 'light', label: <SunIcon className="w-4 h-4" /> },
        { value: 'dark', label: <MoonIcon className="w-4 h-4" /> },
      ]}
      size="xs"
      aria-label="Change color scheme"
    />
  )
}
