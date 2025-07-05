// Import vi from vitest
import { vi } from 'vitest'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// ResizeObserverのモックを追加
global.ResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    // callback パラメータは使用されていませんが、型定義上必要です
    void callback
  }

  observe() {
    // モックの実装
  }

  unobserve() {
    // モックの実装
  }

  disconnect() {
    // モックの実装
  }
}

// IntersectionObserverのモックを追加
global.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null
  rootMargin: string = '0px'
  thresholds: ReadonlyArray<number> = [0]

  constructor(callback: IntersectionObserverCallback) {
    // callback パラメータは使用されていませんが、型定義上必要です
    void callback
  }

  observe() {
    // モックの実装
  }

  unobserve() {
    // モックの実装
  }

  disconnect() {
    // モックの実装
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

// MutationObserverのモックを追加
global.MutationObserver = class MutationObserver {
  constructor(callback: MutationCallback) {
    // callback パラメータは使用されていませんが、型定義上必要です
    void callback
  }

  observe() {
    // モックの実装
  }

  disconnect() {
    // モックの実装
  }

  takeRecords(): MutationRecord[] {
    return []
  }
}

// localStorage のモックを追加
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// sessionStorage のモックを追加
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
}

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Request idle callback のモックを追加
global.requestIdleCallback = vi.fn(callback => {
  setTimeout(callback, 0)
  return 0
})

global.cancelIdleCallback = vi.fn()
