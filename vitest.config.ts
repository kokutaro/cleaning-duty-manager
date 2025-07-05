import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        // Config files
        '*.config.*',
        '**/config/**',
        '**/*.config.*',
        // Build and development files
        'next.config.ts',
        'postcss.config.mjs',
        'tailwind.config.mjs',
        'eslint.config.mjs',
        'vitest.config.ts',
        // Setup files
        'test/setup.ts',
        // Build output
        'dist/**',
        '.next/**',
        'coverage/**',
        // Package files
        'package.json',
        'package-lock.json',
        // Git and other meta files
        '.git/**',
        '.github/**',
        '*.md',
        'README.md',
        'CLAUDE.md',
        'AGENTS.md',
        // TypeScript config
        'tsconfig.json',
        'tsconfig.tsbuildinfo',
        // Prisma files
        'prisma/**',
        // Node modules
        'node_modules/**',
        // Public assets
        'public/**',
        // Global styles
        'src/app/globals.css',
        // Environment files
        'next-env.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
