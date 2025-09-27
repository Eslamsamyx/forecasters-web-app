import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import nextPlugin from '@next/eslint-plugin-next';

export default [
  eslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
        NodeJS: 'readonly',
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        module: 'writable',
        require: 'readonly',
        global: 'readonly',
        URL: 'readonly',
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      '@next/next': nextPlugin,
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // React rules
      'react/display-name': 'off',
      'react-hooks/exhaustive-deps': 'off',

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
      'no-unused-vars': 'off', // Use TypeScript's no-unused-vars instead
      'no-undef': 'off', // TypeScript handles this

      // Next.js rules
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'warn',
    }
  },
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'public/**',
      '*.config.js',
      '*.config.ts',
      'scripts/**',
      'dist/**',
      'build/**',
      'eslint.config.mjs',
      'src/env.mjs',
      'e2e/**',
      'test-transcript.js',
      'test-whisper.js',
    ]
  }
];