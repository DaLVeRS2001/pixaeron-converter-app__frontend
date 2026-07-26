import {
  buildClientSchema,
  getIntrospectionQuery,
  lexicographicSortSchema,
  printSchema,
} from 'graphql';
import { readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';

const schemaUrl = process.env.GRAPHQL_SCHEMA_URL ?? 'http://127.0.0.1:3001/auth';
const schemaPath = new URL('../graphql/schema.graphql', import.meta.url);
const checkOnly = process.argv.includes('--check');

let response;

try {
  response = await fetch(schemaUrl, {
    method: 'POST',
    signal: AbortSignal.timeout(10_000),
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: getIntrospectionQuery() }),
  });
} catch (error) {
  throw new Error(`GraphQL introspection request failed at ${schemaUrl}`, { cause: error });
}

if (!response.ok) {
  throw new Error(`GraphQL introspection failed with HTTP ${response.status} at ${schemaUrl}`);
}

const payload = await response.json();
if (payload.errors?.length || !payload.data) {
  throw new Error(`GraphQL introspection failed: ${JSON.stringify(payload.errors ?? [])}`);
}

const schema = lexicographicSortSchema(buildClientSchema(payload.data));
const nextSchema = `${printSchema(schema)}\n`;

if (checkOnly) {
  const currentSchema = await readFile(schemaPath, 'utf8');
  if (currentSchema !== nextSchema) {
    throw new Error(
      'graphql/schema.graphql is stale. Run npm run schema:pull against the backend.'
    );
  }
} else {
  await writeFile(schemaPath, nextSchema, 'utf8');
  process.stdout.write(`Updated graphql/schema.graphql from ${schemaUrl}\n`);
}
