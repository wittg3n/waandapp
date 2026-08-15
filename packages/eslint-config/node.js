import globals from 'globals';

import { baseConfig } from './base.js';

export const nodeConfig = [
  ...baseConfig,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.node,
    },
  },
];
