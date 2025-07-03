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
    this.callback = callback
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

  private callback: ResizeObserverCallback
}
