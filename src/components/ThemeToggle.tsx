'use client'
import { useMantineColorScheme, SegmentedControl } from '@mantine/core'
import {
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline'

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme()

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
