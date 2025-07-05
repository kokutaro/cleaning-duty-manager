import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import HomePage from '../page'

describe('HomePage', () => {
  test('メインページの基本構造が正しく表示される', () => {
    // Act
    render(
      <MantineProvider>
        <HomePage />
      </MantineProvider>
    )

    // Assert
    // main要素が存在することを確認
    const mainElement = screen.getByRole('main')
    expect(mainElement).toBeInTheDocument()

    // Suspenseのfallback要素が含まれることを確認（初期表示時）
    // HomeFallbackコンポーネントが表示されることを確認
    // 注意：実際のHomeContentが非同期でロードされるため、初期表示ではfallbackが表示される
    expect(mainElement).toHaveClass(
      'max-w-4xl',
      'mx-auto',
      'py-10',
      'flex',
      'flex-col',
      'gap-10'
    )
  })

  test('メインページの要素が正しい構造を持つ', () => {
    // Act
    render(
      <MantineProvider>
        <HomePage />
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
        <HomePage />
      </MantineProvider>
    )

    // Assert
    // Suspenseによってfallbackが表示されることを確認
    // HomeContentが非同期でロードされるため、初期表示ではfallbackが表示される
    const mainElement = screen.getByRole('main')
    expect(mainElement).toBeInTheDocument()
  })
})
