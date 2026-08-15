import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

import { baseConfig } from './base.js';

export const nextConfig = [...baseConfig, ...nextCoreWebVitals, ...nextTypescript];
