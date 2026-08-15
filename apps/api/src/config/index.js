import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadEnvFile } from 'node:process';

import { validateEnvironment } from './environment.js';
const environmentPath = fileURLToPath(new URL('../../../../.env', import.meta.url));

if (existsSync(environmentPath)) {
  loadEnvFile(environmentPath);
}

export const config = validateEnvironment(process.env);
