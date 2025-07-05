import { describe, expect, test, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import RootLayout from '../layout'

// Mock CSS imports to avoid PostCSS processing during tests
vi.mock('../globals.css', () => ({}), { virtual: true })
vi.mock('@mantine/core/styles.css', () => ({}), { virtual: true })

// Mock Google fonts used in the layout
vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: 'geist-sans' }),
  Geist_Mono: () => ({ variable: 'geist-mono' }),
}))

describe('RootLayout', () => {
  test('renders children and basic elements', () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <div>Child Content</div>
      </RootLayout>
    )

    expect(html).toContain('Child Content')
    expect(html).toContain('<html lang="ja"')
    expect(html).toContain('geist-sans')
    expect(html).toContain('geist-mono')
    expect(html).toContain('antialiased')
  })
})
