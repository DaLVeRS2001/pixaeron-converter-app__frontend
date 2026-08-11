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
const sourceContent = await readFile(resolve('public', '_headers'), 'utf8');

if (headersContent !== sourceContent) {
  throw new Error('build/_headers does not match public/_headers.');
}

const CLOUDFLARE_PATH_LINE = /^([^\s]+:\/\/|\/)/;
const CLOUDFLARE_MAX_LINE_LENGTH = 2000;

const lines = headersContent
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

if (lines[0] !== '/*') {
  throw new Error('build/_headers must open with a single "/*" rule.');
}

const declaredHeaders = new Map();

for (const line of lines.slice(1)) {
  if (line.length > CLOUDFLARE_MAX_LINE_LENGTH) {
    throw new Error(`build/_headers line exceeds Cloudflare's limit: ${line.slice(0, 60)}…`);
  }

  if (CLOUDFLARE_PATH_LINE.test(line)) {
    throw new Error(
      `build/_headers line would start a new rule instead of a header: ${line.slice(0, 60)}…`
    );
  }

  const separator = line.indexOf(':');
  if (separator < 1) {
    throw new Error(`build/_headers line is not a header: ${line.slice(0, 60)}…`);
  }

  const name = line.slice(0, separator).trim();

  declaredHeaders.set(name.toLowerCase(), line.slice(separator + 1).trim());
}

const requiredHeaders = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), geolocation=(), microphone=()',
  'cross-origin-opener-policy': 'same-origin-allow-popups',
};

for (const [name, value] of Object.entries(requiredHeaders)) {
  const declared = declaredHeaders.get(name);
  if (declared !== value) {
    throw new Error(
      `build/_headers must declare "${name}: ${value}", found "${declared ?? ''}".`
    );
  }
}

const policyNames = ['content-security-policy', 'content-security-policy-report-only'].filter(
  (name) => declaredHeaders.has(name)
);

if (policyNames.length !== 1) {
  throw new Error(
    'build/_headers must declare exactly one of Content-Security-Policy or Content-Security-Policy-Report-Only.'
  );
}

const directives = new Map(
  declaredHeaders
    .get(policyNames[0])
    .split(';')
    .map((directive) => directive.trim())
    .filter(Boolean)
    .map((directive) => {
      const [name, ...values] = directive.split(/\s+/);
      return [name.toLowerCase(), values];
    })
);

const requiredDirectives = {
  'default-src': ["'self'"],
  'base-uri': ["'self'"],
  'object-src': ["'none'"],
  'frame-ancestors': ["'none'"],
  'form-action': ["'self'"],
  'script-src': ["'self'", 'https://accounts.google.com', 'https://challenges.cloudflare.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://accounts.google.com'],
  'img-src': ["'self'", 'data:'],
  'font-src': ["'self'"],
  'connect-src': ["'self'", 'https://api.pixaeron.com'],
  'frame-src': ['https://accounts.google.com', 'https://challenges.cloudflare.com'],
};

for (const [name, expected] of Object.entries(requiredDirectives)) {
  const declared = directives.get(name);
  if (!declared) {
    throw new Error(`The content security policy is missing the "${name}" directive.`);
  }

  for (const value of expected) {
    if (!declared.includes(value)) {
      throw new Error(`The "${name}" directive must allow ${value}.`);
    }
  }
}

for (const unsafeSource of ["'unsafe-eval'", "'unsafe-inline'"]) {
  if (directives.get('script-src').includes(unsafeSource)) {
    throw new Error(`The "script-src" directive must not allow ${unsafeSource}.`);
  }
}

process.stdout.write('Cloudflare static asset structure and security headers are valid.\n');
