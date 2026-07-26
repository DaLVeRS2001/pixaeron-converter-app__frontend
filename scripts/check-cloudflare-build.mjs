import { access, lstat, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const buildDirectory = resolve('build');
const requiredFiles = ['index.html', '_headers'];

await Promise.all(requiredFiles.map((file) => access(resolve(buildDirectory, file))));

const headersPath = resolve(buildDirectory, '_headers');
const headers = await lstat(headersPath);
if (!headers.isFile()) {
  throw new Error('build/_headers must be a file at the static asset root.');
}

const headersContent = await readFile(headersPath, 'utf8');
const requiredHeaders = [
  'X-Content-Type-Options: nosniff',
  'X-Frame-Options: DENY',
  'Referrer-Policy: strict-origin-when-cross-origin',
  'Permissions-Policy: camera=(), geolocation=(), microphone=()',
];

for (const header of requiredHeaders) {
  if (!headersContent.includes(header)) {
    throw new Error(`build/_headers is missing required directive: ${header}`);
  }
}

process.stdout.write('Cloudflare static asset structure and security headers are valid.\n');
