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

## Built with IBM Bob

BLACKOUT was built entirely within a single hackathon session using **IBM Bob** — IBM's AI software development assistant — as the primary engineering tool. No code was written by hand.

### How Bob was used

**1. Product specification → working code in one pass**

The entire product was specified in a single detailed prompt — product concept, screen flow, simulation logic, visual direction, accessibility requirements, test cases and deployment config. Bob read the full spec and produced every file: types, data models, simulation engine, all React components, CSS, tests, `vercel.json` and README. The project went from an empty repository to a passing build without any manual coding.

**2. Simulation engine design**

Bob designed and implemented the deterministic dependency graph engine in [`src/lib/simulation.ts`](src/lib/simulation.ts). This includes:
- directed graph traversal to propagate failures when the phone node is removed
- DFS-based cycle detection to surface circular recovery dependencies
- explainable failure reasons for every capability — no invented scores or percentages

**3. Test-driven correctness**

Bob wrote six test groups in [`src/tests/simulation.test.ts`](src/tests/simulation.test.ts) covering phone removal, independent fallback survival, uncertain states, circular dependency detection, fix application and demo mode outcome verification. All 14 tests pass. When the initial build failed due to a TypeScript type error in the test file, Bob diagnosed and fixed it immediately without being asked.

**4. Iterative fixes without stopping**

When `npm run build` produced a TypeScript error, Bob caught it in the build output, applied the fix, and reran the build — all in the same session, autonomously.

**5. Git and deployment**

Bob initialised the repository, staged all files, wrote the commit message, pushed to `main` on GitHub, checked for Vercel CLI authentication, and provided the exact manual deployment step when CLI auth was unavailable.

### What Bob did not do

Bob did not invent features beyond the spec. It did not add unnecessary dependencies, abstractions or boilerplate. Every file it produced traces directly to a requirement in the original brief — a core principle it was instructed to follow.

### Bob modes used

| Mode | Purpose |
|------|---------|
| **Plan** | Initial session — read the spec, asked zero clarifying questions, produced the full plan |
| **Agent** | Implementation — wrote all files, ran `npm install`, `npm test`, `npm run build`, fixed errors, committed and pushed |

---

## Built for

**IBM Malaysia Build with Bob + Mini Bob-a-thon with Developer Kaki**
