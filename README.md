# Pixaeron web

React 19 frontend for the Pixaeron image conversion application. Authentication uses Apollo Client 4, generated GraphQL types, React Hook Form, Zod, Cloudflare Turnstile, Google Identity Services, and cookie-based sessions.

## Local development

Use Node.js 24. A normal frontend start does not require GraphOS or Rover:

```powershell
npm ci
Copy-Item .env.example .env
npm start
```

The development server runs on port `3000`; browser requests go to `/graphql`, and Webpack proxies that unchanged path to the local GraphQL Gateway at `http://127.0.0.1:4000`. The browser never targets an individual subgraph.

Environment responsibilities:

- `GRAPHQL_API_URL` is the browser-facing GraphQL URL embedded at build time. Use `/graphql` locally and `https://api.pixaeron.com/graphql` for production builds.
- `GATEWAY_API_URL` is used only by the local Webpack proxy. It defaults to `http://127.0.0.1:4000` and is not shipped to browsers.
- `APOLLO_GRAPH_REF` is used only by schema synchronization and is not shipped to browsers.
- `TURNSTILE_SITE_KEY` and `GOOGLE_CLIENT_ID` are public browser identifiers, not secrets.

Webpack validates these build variables before compilation. Production builds require an HTTPS GraphQL URL plus valid Google and Turnstile public identifiers.

## Updating the GraphQL contract

The committed `graphql/schema.graphql` file is the composed API schema from GraphOS; it is not a copied Auth subgraph schema. Do not edit it manually. GraphQL operation documents under `src/**/*.graphql` are intentionally handwritten product queries and mutations. Codegen validates those operations against the composed schema and generates the typed Apollo documents and TypeScript types under `src/shared/api/generated/`; only that generated directory is machine-written.

Download Rover 0.41.0 from Apollo's official [installation guide](https://www.apollographql.com/docs/rover/getting-started) using the binary-download option, add it to `PATH`, then authenticate interactively with a personal GraphOS API key:

```powershell
rover --version
rover config auth
rover config whoami
```

`rover config auth` prompts for the key; do not append the key as a command argument. Rover stores this local profile outside the repository. Keep `APOLLO_KEY` out of `.env`; CI receives its own key through GitHub Actions secrets.

Keep `APOLLO_GRAPH_REF=pixaeron@production` in `.env`, then use the project commands:

```powershell
npm run schema:pull     # fetches GraphOS and writes graphql/schema.graphql
npm run schema:check    # compares GraphOS with the snapshot without writing
npm run codegen         # writes generated Apollo documents and TypeScript types
npm run codegen:check   # detects generated-output drift without writing
```

The raw Rover equivalent of `schema:pull` is:

```powershell
rover graph fetch pixaeron@production --output .\graphql\schema.graphql
```

After a published backend contract change, run `schema:pull`, review the schema diff, run `codegen`, and commit the schema, handwritten operation changes, and generated-client changes together.

The current Router reports a missing `@authenticated` identity as `UNAUTHORIZED_FIELD_OR_TYPE`, so Apollo treats that code like `UNAUTHENTICATED`, performs one single-flight refresh, and retries once. Apollo Router also uses the same code for `@requiresScopes` and `@policy`. Before either authorization directive is introduced, refine this client/server error contract so a valid user who lacks permission is not treated as having an expired session.

Official references: [Rover authentication](https://www.apollographql.com/docs/rover/configuring) and [`rover graph fetch`](https://www.apollographql.com/docs/rover/commands/graphs).

## Verification

```powershell
$env:GRAPHQL_API_URL = 'https://api.pixaeron.com/graphql'
npm run check
npm run schema:check # requires GraphOS authentication
npm run lint:ts
npm run lint:scss
npx prettier . --check
```

`npm run check` starts with the non-writing `codegen:check`, then runs ESLint, Stylelint, TypeScript type checking, unit tests, the production Webpack build, and Cloudflare asset validation. Because it performs a production build, the PowerShell command above overrides the development-only `/graphql` value for the current terminal; `GOOGLE_CLIENT_ID` and `TURNSTILE_SITE_KEY` must also contain valid public values. Use a fresh terminal or restore `$env:GRAPHQL_API_URL = '/graphql'` before `npm start`. The check uses the committed schema and does not contact GraphOS; `schema:check` is the separate remote comparison.

## CI/CD and hosting

Pull requests call the immutable central Pixaeron frontend workflow. The repository is configured for the Gateway cutover, but a successful public deployment and live auth smoke test through `https://api.pixaeron.com/graphql` have not been verified from this worktree. Trusted runs fetch the composed GraphOS API schema before `npm run check` and require the committed snapshot to match it. Fork and Dependabot pull requests cannot receive GitHub secrets, so they verify against the committed snapshot. Trusted `main` runs preserve the exact verified `build/` as a short-lived workflow artifact, then the repository-local protected job deploys it to Cloudflare Workers Static Assets.

GitHub repository variables:

```text
APOLLO_GRAPH_REF=pixaeron@production
GRAPHQL_API_URL=https://api.pixaeron.com/graphql
GOOGLE_CLIENT_ID=<production web client ID>
TURNSTILE_SITE_KEY=<production site key>
```

GitHub repository secret used only by the central schema-fetch step:

```text
APOLLO_KEY=<dedicated frontend GraphOS graph API key>
```

On the current GraphOS Free plan, every Graph API key has full access to this graph; keep the frontend key separate so it can be rotated or revoked independently. A Consumer/read-only role is available only with GraphOS Enterprise. Never expose the key to Webpack or browser code.

GitHub `production` environment variable:

```text
CLOUDFLARE_ACCOUNT_ID
```

GitHub `production` environment secret (not a repository secret):

```text
CLOUDFLARE_API_TOKEN
```

The deployment token is available only to the local protected job's final Wrangler deploy step.

Use Node.js 24. Detailed API, schema, CI/CD, Cloudflare, Google, Turnstile, AWS, and production operator instructions are indexed in `docs/AGENTS.md`. The `docs/` directory is intentionally ignored by repository policy.

Detailed security, CAPTCHA, session, email, architecture, and deployment documentation lives in the backend repository under `docs/`.
