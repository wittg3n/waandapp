import nextEnv from '@next/env';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const { loadEnvConfig } = nextEnv;
const command = process.argv[2];

if (command !== 'dev' && command !== 'start') {
  throw new Error('Expected "dev" or "start".');
}

const appDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(appDirectory, '../..');

process.env.NODE_ENV = command === 'dev' ? 'development' : 'production';
loadEnvConfig(repositoryRoot, command === 'dev', console, true);

const port = Number(process.env.BLOG_PORT ?? 3002);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('BLOG_PORT must be an integer from 1 to 65535.');
}

const require = createRequire(import.meta.url);
const child = spawn(
  process.execPath,
  [require.resolve('next/dist/bin/next'), command, '--port', `${port}`],
  {
    cwd: appDirectory,
    env: process.env,
    stdio: 'inherit',
  },
);

child.on('error', (error) => {
  throw error;
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exitCode = code ?? 1;
});
