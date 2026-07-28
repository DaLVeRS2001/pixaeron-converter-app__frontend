import 'dotenv/config';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const graphRef = process.env.APOLLO_GRAPH_REF;
if (!graphRef) {
  throw new Error('APOLLO_GRAPH_REF is required in graph-id@variant format.');
}

const schemaPath = fileURLToPath(new URL('../graphql/schema.graphql', import.meta.url));
const checkOnly = process.argv.includes('--check');
const temporaryDirectory = checkOnly
  ? await mkdtemp(join(tmpdir(), 'pixaeron-graphql-schema-'))
  : undefined;
const outputPath = temporaryDirectory
  ? join(temporaryDirectory, 'schema.graphql')
  : schemaPath;

try {
  await runRoverGraphFetch(outputPath);

  if (checkOnly) {
    const [currentSchema, fetchedSchema] = await Promise.all([
      readFile(schemaPath, 'utf8'),
      readFile(outputPath, 'utf8'),
    ]);

    if (currentSchema.replaceAll('\r\n', '\n') !== fetchedSchema.replaceAll('\r\n', '\n')) {
      throw new Error(
        'graphql/schema.graphql differs from GraphOS. Run npm run schema:pull and commit the result.'
      );
    }
  } else {
    process.stdout.write(`Updated graphql/schema.graphql from ${graphRef}\n`);
  }
} finally {
  if (temporaryDirectory) {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

function runRoverGraphFetch(output) {
  return new Promise((resolve, reject) => {
    const rover = spawn(
      'rover',
      ['--skip-update-check', 'graph', 'fetch', graphRef, '--output', output],
      { stdio: 'inherit', windowsHide: true }
    );

    rover.once('error', (error) => {
      reject(
        new Error(
          'Unable to start Rover 0.41.0. Install it from https://www.apollographql.com/docs/rover/getting-started.',
          { cause: error }
        )
      );
    });
    rover.once('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Rover graph fetch exited with code ${code}.`));
    });
  });
}
