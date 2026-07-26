import { spawnSync } from 'node:child_process';
import process from 'node:process';

const generatedPaths = ['graphql/schema.graphql', 'src/shared/api/generated'];
const result = spawnSync('git', ['diff', '--exit-code', '--', ...generatedPaths], {
  encoding: 'utf8',
  shell: false,
});

if (result.error) {
  throw new Error('Unable to verify generated GraphQL files with Git.', {
    cause: result.error,
  });
}

if (result.status === 1) {
  process.stderr.write(
    'GraphQL generated files changed after codegen. Commit the schema and generated client together.\\n'
  );
  process.stderr.write(result.stdout);
  process.exit(1);
}

if (result.status !== 0) {
  process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}
