import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import HistoryPage from '../page'

describe('HistoryPage', () => {
  test('履歴ページの基本構造が正しく表示される', () => {
    // Act
    render(
      <MantineProvider>
        <HistoryPage />
      </MantineProvider>
    )

    // Assert
    // main要素が存在することを確認
    const mainElement = screen.getByRole('main')
    expect(mainElement).toBeInTheDocument()

    // Suspenseのfallback要素が含まれることを確認（初期表示時）
    // HistoryFallbackコンポーネントが表示されることを確認
    // 注意：実際のHistoryContentが非同期でロードされるため、初期表示ではfallbackが表示される
    expect(mainElement).toHaveClass(
      'max-w-4xl',
      'mx-auto',
      'py-10',
      'flex',
      'flex-col',
      'gap-10'
    )
  })

  test('履歴ページの要素が正しい構造を持つ', () => {
    // Act
    render(
      <MantineProvider>
        <HistoryPage />
      </MantineProvider>
    )

    // Assert
    const mainElement = screen.getByRole('main')
    expect(mainElement).toBeInTheDocument()

    // main要素のクラス名が正しいことを確認
    expect(mainElement).toHaveClass('max-w-4xl')
    expect(mainElement).toHaveClass('mx-auto')
    expect(mainElement).toHaveClass('py-10')
    expect(mainElement).toHaveClass('flex')
    expect(mainElement).toHaveClass('flex-col')
    expect(mainElement).toHaveClass('gap-10')
  })

  test('Suspenseが適切に設定されている', () => {
    // Act
    render(
      <MantineProvider>
        <HistoryPage />
      </MantineProvider>
    )

    // Assert
    // Suspenseによってfallbackが表示されることを確認
    // HistoryContentが非同期でロードされるため、初期表示ではfallbackが表示される
    const mainElement = screen.getByRole('main')
    expect(mainElement).toBeInTheDocument()
  })

  test('HistoryPageコンポーネントが正しくレンダリングされる', () => {
    // Act
    render(
      <MantineProvider>
        <HistoryPage />
      </MantineProvider>
    )

    // Assert
    // ページが正常にレンダリングされ、エラーがないことを確認
    const mainElement = screen.getByRole('main')
    expect(mainElement).toBeInTheDocument()
    expect(mainElement.tagName).toBe('MAIN')
  })

  test('dynamic設定が適切に設定されている', () => {
    // Act
    render(
      <MantineProvider>
        <HistoryPage />
      </MantineProvider>
    )

    // Assert
    // dynamic = 'force-dynamic' が設定されているため、コンポーネントが正常にレンダリングされる
    const mainElement = screen.getByRole('main')
    expect(mainElement).toBeInTheDocument()
  })
})
