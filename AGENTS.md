<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Performance Testing Rule

**CRITICAL RULE**: Do NOT optimize blindly for "making the Lighthouse number green". Never deploy performance-related changes (LCP fixes, script loading changes, animations, etc.) without testing the behavior locally first. 

Before committing or deploying ANY performance change:
1. Run a local trace (via `puppeteer` trace scripts or `npx lighthouse http://localhost:3000 --chrome-flags="--headless"` on the production build).
2. Verify that the Network stays idle when expected, the CPU doesn't stay indefinitely busy (e.g. no infinite layout thrashing or polling), and no new runtime errors/timeouts are introduced.
3. Only after the local trace confirms clean behavior, commit and deploy the change.
