import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import typescriptEslint from 'typescript-eslint';

export const baseConfig = [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '.next/**', '.turbo/**'],
  },
  eslint.configs.recommended,
  ...typescriptEslint.configs.recommended,
  prettier,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
];
