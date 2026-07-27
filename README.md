# Pixaeron web

React 19 frontend for the Pixaeron image conversion application. Authentication uses Apollo Client 4, generated GraphQL types, React Hook Form, Zod, Cloudflare Turnstile, Google Identity Services, and cookie-based sessions.

## Local development

```bash
npm install
npm run schema:pull
npm run codegen
npm start
```

Copy `.env.example` to `.env`. The development server runs on port `3000`; browser requests go to `/graphql`, and Webpack proxies that stable public path to the auth service's current internal `/auth` endpoint.

Environment responsibilities:

- `GRAPHQL_API_URL` is the browser-facing GraphQL URL embedded at build time. Use `/graphql` locally and `https://api.pixaeron.com/graphql` for production builds.
- `AUTH_API_URL` is used only by the local Webpack proxy. It defaults to `http://127.0.0.1:3001` and is not shipped to browsers.
- `GRAPHQL_SCHEMA_URL` is used only by `npm run schema:pull` and `npm run schema:check`. It points directly to a running backend schema endpoint.
- `TURNSTILE_SITE_KEY` and `GOOGLE_CLIENT_ID` are public browser identifiers, not secrets.

Webpack validates these build variables before compilation. Production builds require an HTTPS GraphQL URL plus valid Google and Turnstile public identifiers.

The committed `graphql/schema.graphql` file is generated from backend introspection. Do not edit it manually. Ordinary frontend builds consume the committed snapshot and do not depend on a running backend. After a backend GraphQL contract change, run `npm run schema:pull`, review the schema diff, then run `npm run codegen` and commit the schema and generated-client changes together.

## Verification

```bash
npm run check
npm run schema:check # requires the configured backend to be running
npm run lint:ts
npm run lint:scss
npx prettier . --check
```

`npm run check` runs deterministic client generation from the committed schema, ESLint, Stylelint, TypeScript type checking, unit tests, and the production Webpack build.

## CI/CD and hosting

Pull requests call the immutable central Pixaeron frontend workflow and run verification only. Trusted `main` runs use the same central verification, preserve the exact verified `build/` as a short-lived workflow artifact, and then run a small repository-local protected deployment job. That job downloads the artifact and deploys it to Cloudflare Workers Static Assets with lockfile-pinned Wrangler. Cloudflare recommends Workers Static Assets for new SPAs; no frontend Docker image or Worker handler is required.

GitHub repository variables (available to pull-request verification):

```text
GRAPHQL_API_URL
GOOGLE_CLIENT_ID
TURNSTILE_SITE_KEY
```

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
