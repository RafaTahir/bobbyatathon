# BLACKOUT

**What happens when the device you need to recover your digital life is the thing you just lost?**

## Problem

Our phones have become the single key to nearly every system we rely on — banking, authentication, contacts, transport and the very tools we would use to recover them if lost. Most people believe they have backups. Many of those backups secretly depend on the same phone.

## Solution

BLACKOUT applies chaos-engineering thinking to personal digital resilience. It simulates losing your phone, runs a deterministic dependency graph to expose which capabilities collapse, reveals circular recovery dependencies, and guides you to create independent fallbacks — then proves they work by rerunning the simulation.

## How it works

```
MAP → BREAK → DISCOVER → FIX → BREAK AGAIN → SURVIVE
```

1. **Map** — answer 7 quick questions about your digital fallbacks
2. **Break** — press KILL MY PHONE to remove the central node
3. **Discover** — watch failures propagate through the dependency graph
4. **Fix** — create independent fallback routes for each failure
5. **Break again** — rerun the simulation with fixes applied
6. **Survive** — see how many capabilities now have independent paths

## Privacy

BLACKOUT requires no passwords, authentication codes, recovery codes or banking credentials. All answers stay in the browser. No backend. No analytics. No remote storage.

> Your drill runs locally in this browser. BLACKOUT does not need your passwords, recovery codes or financial credentials.

## Tech stack

- **Vite** + **React** + **TypeScript**
- No backend, no database, no auth, no external APIs
- Pure static site — deployable anywhere

## Local development

```bash
cd blackout
npm install
npm run dev
```

Open http://localhost:5173

## Run tests

```bash
npm test
```

## Production build

```bash
npm run build
```

Output goes to `dist/` — a fully static site ready for deployment.

## Deployment

### Vercel (recommended)

```bash
npm i -g vercel
vercel deploy --prod
```

Or connect the GitHub repo to Vercel and it will deploy automatically on every push to `main`.

No environment variables required.

### Any static host

Upload the contents of `dist/` to any static hosting service (Netlify, GitHub Pages, Cloudflare Pages, S3, etc.).

## Demo mode

Launch the app and click **Try Demo Scenario** to run "The Overconnected Developer" — a seeded scenario that demonstrates the full simulation including circular dependency detection, without entering any personal data.

## Built for

**IBM Malaysia Build with Bob + Mini Bob-a-thon with Developer Kaki**
