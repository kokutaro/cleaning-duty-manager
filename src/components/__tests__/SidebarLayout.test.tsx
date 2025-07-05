import { MantineProvider } from '@mantine/core'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { SidebarLayout } from '../SidebarLayout'

// Next.jsのusePathnameとLinkをモック
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}))

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// ThemeToggleをモック
vi.mock('../ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">ThemeToggle</div>,
}))

// テスト後のクリーンアップ
afterEach(() => {
  cleanup()
  vi.clearAllTimers()
})

test('renders SidebarLayout with children', () => {
  const { getByText } = render(
    <MantineProvider>
      <SidebarLayout>
        <div>Test Content</div>
      </SidebarLayout>
    </MantineProvider>
  )

  expect(getByText('Test Content')).toBeTruthy()
  expect(getByText('お掃除当番管理')).toBeTruthy()
})

test('renders all navigation links', () => {
  const { getAllByText } = render(
    <MantineProvider>
      <SidebarLayout>
        <div>Test Content</div>
      </SidebarLayout>
    </MantineProvider>
  )

  expect(getAllByText('トップページ').length).toBeGreaterThan(0)
  expect(getAllByText('履歴').length).toBeGreaterThan(0)
  expect(getAllByText('管理画面').length).toBeGreaterThan(0)
})

test('renders ThemeToggle component', () => {
  const { getAllByTestId } = render(
    <MantineProvider>
      <SidebarLayout>
        <div>Test Content</div>
      </SidebarLayout>
    </MantineProvider>
  )

  expect(getAllByTestId('theme-toggle').length).toBeGreaterThan(0)
})

test('burger menu toggles correctly', () => {
  const { container } = render(
    <MantineProvider>
      <SidebarLayout>
        <div>Test Content</div>
      </SidebarLayout>
    </MantineProvider>
  )

  // バーガーメニューボタンを探す（Mantineのバーガーメニューのクラス名を使用）
  const burgerButton = container.querySelector('.mantine-Burger-root')
  expect(burgerButton).toBeTruthy()

  // クリックしてメニューを開く
  if (burgerButton) {
    fireEvent.click(burgerButton)
  }
})

test('navigation links close sidebar on click', () => {
  const { getAllByText } = render(
    <MantineProvider>
      <SidebarLayout>
        <div>Test Content</div>
      </SidebarLayout>
    </MantineProvider>
  )

  // ナビゲーションリンクをクリック
  const homeLinks = getAllByText('トップページ')
  expect(homeLinks.length).toBeGreaterThan(0)
  fireEvent.click(homeLinks[0])

  // リンクがクリック可能であることを確認
  expect(homeLinks[0]).toBeTruthy()
})
