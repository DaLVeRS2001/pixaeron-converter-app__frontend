# Pixaeron web

React 19 frontend for the Pixaeron image conversion application. Authentication uses Apollo Client 4, generated GraphQL types, React Hook Form, Zod, Cloudflare Turnstile, Google Identity Services, and cookie-based sessions.

## Local development

Use Node.js 24. Install the pinned Rover 0.41.0 CLI once and authenticate it with a personal GraphOS key:

```powershell
iwr 'https://rover.apollo.dev/win/v0.41.0' | iex
rover config auth
npm ci
```

Copy `.env.example` to `.env` and set `APOLLO_GRAPH_REF` to `<graph-id>@production`. The personal key is stored by Rover; do not put `APOLLO_KEY` in `.env`.

```bash
npm run schema:pull
npm run codegen
npm start
```

The development server runs on port `3000`; browser requests go to `/graphql`, and Webpack proxies that stable public path to the Auth service's current internal `/auth` endpoint.

Environment responsibilities:

- `GRAPHQL_API_URL` is the browser-facing GraphQL URL embedded at build time. Use `/graphql` locally and `https://api.pixaeron.com/graphql` for production builds.
- `AUTH_API_URL` is used only by the local Webpack proxy. It defaults to `http://127.0.0.1:3001` and is not shipped to browsers.
- `APOLLO_GRAPH_REF` is used only by schema synchronization and is not shipped to browsers.
- `TURNSTILE_SITE_KEY` and `GOOGLE_CLIENT_ID` are public browser identifiers, not secrets.

Webpack validates these build variables before compilation. Production builds require an HTTPS GraphQL URL plus valid Google and Turnstile public identifiers.

The committed `graphql/schema.graphql` file is the composed API schema fetched with `rover graph fetch`; it is not a copied Auth subgraph schema. Do not edit it manually. After a published GraphQL contract change, run `npm run schema:pull`, review the schema diff, run `npm run codegen`, and commit the schema and generated-client changes together.

## Verification

```bash
npm run check
npm run schema:check # requires GraphOS authentication
npm run lint:ts
npm run lint:scss
npx prettier . --check
```

`npm run check` runs deterministic client generation from the committed schema, ESLint, Stylelint, TypeScript type checking, unit tests, and the production Webpack build.

## CI/CD and hosting

Pull requests call the immutable central Pixaeron frontend workflow. Trusted runs fetch the composed GraphOS API schema before Codegen and require the committed snapshot to match it. Fork and Dependabot pull requests cannot receive GitHub secrets, so they verify against the committed snapshot. Trusted `main` runs preserve the exact verified `build/` as a short-lived workflow artifact, then the repository-local protected job deploys it to Cloudflare Workers Static Assets.

GitHub repository variables:

```text
APOLLO_GRAPH_REF=<graph-id>@production
GRAPHQL_API_URL=https://api.pixaeron.com/graphql
GOOGLE_CLIENT_ID=<production web client ID>
TURNSTILE_SITE_KEY=<production site key>
```

GitHub repository secret used only by the central schema-fetch step:

```text
APOLLO_KEY=<dedicated frontend GraphOS key>
```

Use a separate Consumer/read-only Graph API key when the GraphOS plan exposes that role. Never expose this key to Webpack or browser code.

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
