# Production-readiness audit

Audit date: 2026-09-26. Scope: local working tree, including changes already present when the audit began. No deployments, live database operations, paid provider requests, external security scans, native installation, or destructive tests were performed. Existing user changes were preserved.

## Executive Summary

**Not ready for unrestricted public production with paid AI and cloud saves enabled.** The local/offline game works in the browser, builds successfully, and has useful domain tests. The principal verified security issue is anonymous access to paid generation without quotas. Cloud data isolation is a release-blocking unknown: no database schema, migrations, grants, or RLS policies are supplied. This is not proof that the deployed database lacks RLS.

Safe fixes made during this audit cover input limits, generic provider errors, server-side generation deadlines, malformed AI optional fields, zero-valued calculations, a false synergy, basic response headers, and environment-file ignore rules. Authentication, distributed quotas, database policies, persistent jobs, and storage migration require coordinated implementation and were not silently introduced.

Evidence labels used below: **verified** means exercised locally or directly demonstrated in executable code; **code-confirmed** means the behavior follows from reviewed code but the full concurrent/UI scenario was not executed; **conditional** requires another failure or external configuration; **untested** means evidence is unavailable. No Critical-severity exploit was established. One High-severity public API exposure was verified.

### Architecture and inventory

- React 19 SPA, mostly JavaScript/JSX, Vite 8, Tailwind 4, Framer Motion, canvas wheel, procedural Web Audio; pure modules calculate character stats, synergies, identity, and local lore.
- Express 5 in `server.ts` supports local development and a portable production server. Two shared JavaScript handlers in `api/` also deploy as Vercel functions. Groq generates lore; Higgsfield submits/polls portraits. Credentials are server environment variables.
- Supabase browser SDK optionally provides email/password accounts and direct `saved_characters` reads/inserts/deletes. There is no application admin role, payment flow, upload service, custom password hashing, JWT implementation, or server database client.
- Local rosters use one localStorage JSON array. Backup JSON is imported in-browser with a 10 MB and 1,000-record per-import cap. Local-first generation survives provider failure; remote portraits remain URLs.
- Service worker precaches the frontend, excludes API calls/remote origins, and versions caches. Native builds bundle `dist-native` with Tauri 2/Rust; Android Gradle project is present. Only core Tauri permissions are granted; native CSP exists; Android release disables cleartext traffic.
- npm and Cargo lockfiles exist; an older Bun lockfile also exists. No checked-in CI workflow, Dockerfile, compose file, IaC, SQL migrations, formatter configuration, TypeScript configuration, or typecheck script was found. `server.ts` is transpiled without type checking. README remains a template; platform documents describe both implemented and future work.
- Tracked inventory: 266 files at audit start. Source review covered frontend flows, API handlers, shared utilities, PWA, build/native scripts, configuration, tests, and release documentation. Root `patch_*`, `fix_*`, and ad hoc provider test scripts are legacy developer utilities, not runtime endpoints; they were not executed. Generated/binary artifacts received configuration/inventory checks, not a complete binary audit.

## Critical Findings

No Critical-severity finding was verified. Address **S1** before exposing paid generation publicly. Resolve **S2** before trusting cloud record isolation.

## Security Findings

### S1 — High — Unauthenticated, unmetered paid generation (verified; OPEN)

- **Files/functions:** `api/generate-lore.js:4` and `api/generate-portrait.js:5`, `handler`; `server-utils/cors.js:12`, `handleCors`; `src/utils/apiClient.js:8`, request construction.
- **Relevant code:** handlers proceed from CORS/method checks directly to server credentials and provider fetch. No bearer verification, caller identity, quota reservation, idempotency key, or concurrency limit exists. Lore accepts client-owned `systemInstruction`; provider output tokens are not explicitly capped.
- **Impact:** anyone who can reach the endpoint can spend the operator's provider quota, repurpose the lore proxy, and occupy function/server capacity. Requests without Origin are accepted, and a non-browser client can supply any allowed Origin. Browser CORS is not access control.
- **Reproduction:** `tests/audit-regressions.test.js`, “documents remaining exposure,” supplies a synthetic provider key, mocks fetch, and sends valid JSON with empty headers. The handler calls the provider and returns 200. No real provider was contacted. Repeat requests have no application quota check.
- **Fix:** verify Supabase access tokens server-side; add shared atomic per-user/IP quotas, global spend caps, concurrency limits and idempotency; construct prompts from validated build IDs on the server. If guest AI is required, design a bounded guest allowance. Do not substitute an in-memory limit in a multi-instance deployment.
- **Fixed?** No. Input/deadline fixes reduce individual request cost but do not resolve this exposure.
- **Verify:** anonymous/expired tokens return 401; exhausted quota returns 429 before provider access; concurrent replicas cannot overspend; repeated idempotency keys produce one charged job. Change the characterization test to assert denial after implementing auth.

### S2 — High-priority release gate — Cloud ownership enforcement unknown (untested; OPEN)

- **Severity:** High if permissive deployed policies exist; not a verified BOLA vulnerability.
- **Files/functions:** `src/components/RosterModal.jsx:51` (`select('*')`), `:87` (delete by record ID); `src/App.jsx:143` (insert with caller-supplied `user_id`); `src/utils/supabaseClient.js:6`.
- **Impact:** without correct database grants/RLS, anonymous users or account A may read/delete account B's records or assign another owner. Adding a frontend `.eq('user_id', ...)` is not sufficient authorization.
- **Reproduction:** in an isolated staging database, create A/B records; issue SELECT/INSERT/UPDATE/DELETE directly with anonymous, A, B and expired tokens, including modified IDs and ownership fields. This was not run against the live project.
- **Fix:** version schema/grants/policies, enable RLS, enforce `auth.uid() = user_id` on read/delete and insert/update checks, verify immutable ownership, and index ownership plus sort columns. Confirm actual table names/types first.
- **Fixed?** No; no database modifications were performed.
- **Verify:** two-user policy tests must show no foreign rows, no cross-owner mutation, and no anonymous access; test uniqueness, foreign keys, rollback and expiry in staging.

### S3 — Medium — Raw provider errors exposed through responses/logs (verified in original handlers; FIXED)

- **Files/functions:** `api/generate-lore.js`, provider failure and catch; `api/generate-portrait.js`, submission/status failure and catch; shared replacement `server-utils/generation.js:10`.
- **Impact:** provider bodies and exception messages could disclose request/account details. No actual credential disclosure was observed.
- **Reproduction:** mock a provider error containing a private marker. Original code relayed that body/detail; regression tests now assert a generic 502 response. Timeout errors return 504. Logs contain only a fixed event and category.
- **Fix/verification:** implemented centralized redacted errors. Tests cover both handlers, thrown timeouts, and malformed JSON. Missing-key diagnostics still name missing configuration fields, never their values.

### S4 — Medium — Inadequate input/resource bounds (verified; PARTIALLY FIXED)

- **Files/functions:** handler body extraction and provider fetch in both API files; `server.ts:19`; `server-utils/generation.js:1`.
- **Original behavior/impact:** lore accepted missing/object/oversized fields; portrait accepted whitespace/unbounded strings; Express accepted 10 MB bodies. Fetch calls had no timeout; 25 portrait polls did not cap elapsed time because network operations could hang.
- **Reproduction:** missing/null/array/object/blank/oversized inputs, stalled mocked fetch, malformed upstream JSON. Original lore returned exceptions rather than validation errors; unbounded fetch had no AbortSignal.
- **Fix:** required nonblank strings (32,000 characters per lore field; 8,000 portrait), Express 256 KB parser cap, generic parser errors, and one 55-second signal spanning provider submission, body reads and portrait polling/delays. Both hosting paths execute handler validation. Unsupported methods reach handler 405 consistently in Express.
- **Verify:** regression and HTTP integration tests. The timeout response branch is mocked; actual signal presence is asserted, not a 55-second live-provider soak test.
- **Remaining:** quotas/output token caps absent; Vercel's pre-handler body limits, runtime duration, and proxy limits require deployment verification. Timeout/disconnection does not cancel an already purchased provider job.

### S5 — Low — Web hardening headers incomplete (configuration verified; PARTIALLY FIXED)

- **Files:** `server.ts:12`, `vercel.json` headers; native policy in `src-tauri/tauri.conf.json`.
- **Impact/reproduction:** original web configuration lacked explicit clickjacking/MIME/referrer controls. Inspect a local production response or hosting header rules. No exploitable XSS was demonstrated.
- **Fix:** added `nosniff`, `X-Frame-Options: DENY`, strict-origin referrer policy on Express/Vercel; removed Express fingerprint header. Local HTTP tests verify key headers. Hosted delivery remains untested.
- **Remaining/verify:** stage a web CSP with actual Supabase/provider/export origins, validate report-only policy first, and verify HTTPS/HSTS at the edge. Native CSP is not a web policy. Framing the app is now intentionally denied; confirm no embedding requirement.

### S6 — Low — Environment variants were not ignored (verified; FIXED)

- **File:** `.gitignore`, Environment section.
- **Reproduction:** before fix `git check-ignore .env.production .env.staging` produced no matches. `.env` and local variants were ignored.
- **Impact/fix:** future credentials in environment variants could be accidentally committed. Added `.env.*` with explicit `.env.example` exception. No confirmed leaked credential requiring rotation was discovered by the bounded scans.
- **Verify:** `git check-ignore .env.production .env.staging`; verify `.env.example` remains tracked. If historical leakage is discovered separately, revoke and replace credentials at their providers; removing text does not revoke a credential.

### S7 — Low — Provider-supplied polling URL is trusted (conditional; OPEN)

- **File/function:** `api/generate-portrait.js:62`, `fetch(status_url)` attaches provider authorization.
- **Impact:** a malicious/compromised provider response could direct an authenticated server request to another origin or internal address. No client input directly controls `status_url`; no practical anonymous SSRF exploit was established. Do not classify this as proven remote SSRF.
- **Reproduction:** mocked submission returns an unexpected status URL; inspect destination of the next fetch without making that request.
- **Fix/verify:** confirm provider's documented polling origins, require HTTPS/exact allowlisted origins, reject URL userinfo, and constrain redirects. Test disallowed hosts, loopback/private URLs and redirects. Not changed because the supported polling-origin contract was not established in this audit.

### Other security controls examined

React renders character strings as text; no application `dangerouslySetInnerHTML`, eval, SQL string execution, request-controlled shell execution, file upload endpoint, URL redirect endpoint, custom deserialization execution, or JWT parser was found in runtime code. Supabase operations use SDK query builders. Backup field allowlisting excludes remote IDs/ownership, limits imported count/size, strips non-HTTPS portrait URLs, and avoids merging arbitrary object keys into prototypes. These observations narrow reachable attack surfaces; they are not proof against every XSS/prototype-pollution variant.

Cookie CSRF, password reset, brute-force throttling, refresh-token revocation, session expiry and Supabase auth settings were not verified. Browser Supabase session storage remains exposed to any future same-origin script compromise. Native secure token storage is not implemented. No project-specific request-smuggling evidence was found; edge/proxy behavior is untested.

## Authentication, Authorization and API Matrix

| Operation | Anonymous | Signed-in owner | Other account | Enforcement/evidence |
|---|---|---|---|---|
| Local spin/lore/save/import/export | Allowed | Allowed | Same browser profile shares guest storage | Local-only by design |
| POST `/api/generate-lore` | Currently allowed | Allowed | Allowed | Missing auth/quota; verified with mocked provider |
| POST `/api/generate-portrait` | Currently allowed by code | Allowed | Allowed | Same missing auth/quota |
| OPTIONS both generation endpoints | Allowed origin receives 204 | Same | Same | Native preflight tested; untrusted origin 403 |
| Other methods both endpoints | 405 | 405 | 405 | Handler tests; Express routes all methods |
| Supabase sign-up/sign-in/sign-out | SDK delegates to service | SDK delegates to service | N/A | Hosted settings/session invalidation untested |
| `saved_characters` SELECT/INSERT/DELETE | Must deny | Must restrict to owner | Must deny foreign rows | Actual RLS/grants untested |

There is no admin role or sensitive local upload API to test. Generation has string validation and no-store responses, but no authentication, ownership, quota, or deduplication. Supabase endpoint URLs derive from public configuration; no remote account operations were exercised. Roster selection has no pagination (`select('*').order(...)`); configured Supabase row caps may truncate results.

## QA Findings

### Q1 — Medium — Explicit zero rolls became 50 (verified; FIXED)

- **File/function:** `src/utils/buildStats.js:5`, `calculateBuildStats/getVal`.
- **Impact/reproduction:** `val || 50` converted `{name:'None', val:0}` Haki and other zero-valued abilities to a baseline of 50, inflating stats/overall/tier/bounty. New test supplies three zero Haki selections and checks Haki equals zero.
- **Fix/verify:** use nullish fallback; zero stays zero and absent legacy selections still default to 50. Regression tests pass. Existing saved snapshots are not recalculated or migrated.

### Q2 — Medium — None senjutsu granted Six Paths bonus (verified; FIXED)

- **File/function:** `src/utils/gameLogic.js:22`, `calculateSynergies`.
- **Impact/reproduction:** Rinnegan plus `jutsu_sen.name = 'None'` satisfied a truthy string condition and granted 15 overall bonus points. Use `hasSelection`; tests cover absent, None and selected senjutsu.
- **Fixed?** Yes; verify the regression test and gameplay with the corresponding selections.

### Q3 — Medium — Malformed optional AI fields could crash rendering (verified validation gap; FIXED)

- **Files/functions:** `src/utils/localLore.js:37`, `isUsableLore`; `src/App.jsx:333`, custom synergy merge; `src/components/CharacterCard.jsx:241`, rendered synergy fields.
- **Impact/reproduction:** otherwise valid AI lore with object-valued epithet, synergy name/description or bonus passed the original minimal validator and could become an invalid React child. Mock such outputs in the new test.
- **Fix/verify:** reject malformed optional fields and use deterministic local fallback. All four malformed variants pass the fallback regression. This is a rendering/availability bug, not demonstrated script execution.

### Q4 — Medium — Local deletion overwrites a stale roster snapshot (code-confirmed; OPEN)

- **File/function:** `src/components/RosterModal.jsx:100-111`, `handleDelete`.
- **Impact/reproduction:** open roster in tab A with record X; save/import Y in tab B; delete X in A. A writes its old in-memory list after deleting X, losing Y. It reads fresh `guestSaves` but does not use it. No automatic backup exists.
- **Fix:** stable local IDs, transactional storage (such as IndexedDB) and deletion against current records, with storage-change reconciliation. Avoid a large storage migration during this audit.
- **Verify:** two tabs concurrently save/import/delete without losing unrelated records; add quota/corruption recovery tests. This exact multi-tab flow remains unexecuted.

### Q5 — Medium — Duplicate cloud saves and ambiguous fallback (code-confirmed; OPEN)

- **File/function:** `src/App.jsx:137`, `handleSaveCharacter`; button at `:614` only disables after success.
- **Impact/reproduction:** delay insert and click Save twice; both requests can insert. A server-committed write followed by a lost response falls back to a local copy. There is no stable record ID/idempotency key or database uniqueness evidence.
- **Fix/verify:** immediate in-flight guard, stable client-generated ID with owner-scoped uniqueness/upsert, and explicit unknown-outcome recovery. Test rapid duplicates, commit-then-disconnect, failed DB insert, and full local storage. Not changed because reliable deduplication requires a verified storage contract.

### Q6 — Medium — Stale cloud reads survive account changes (code-confirmed; OPEN)

- **File/function:** `src/components/RosterModal.jsx:32-77`, async `loadCharacters`.
- **Impact/reproduction:** delay account A's cloud load, sign out/switch to B, then resolve A's old request. It can overwrite the newer roster with A's previous response on this device. This is a frontend stale-response issue, not evidence of RLS bypass.
- **Fix/verify:** generation/request token or effect cancellation keyed to user ID and modal lifecycle; clear old cloud state immediately. Test out-of-order responses and logout during fetch.

### Q7 — Low — Large/partial rosters and malformed persisted data (code-confirmed; OPEN)

- **Files:** `src/components/RosterModal.jsx:35`, `:52`; `src/utils/localRoster.js:1` and `importRoster`; `src/components/CharacterCard.jsx:9`.
- **Impact/reproduction:** cloud loads have no paging and may silently omit records past server row caps; local storage is parsed as an array without validating each legacy record, while repeated imports can exceed aggregate storage quota. A tampered legacy lore/build can crash display. Existing import checks cover common shapes but not a complete versioned record schema.
- **Fix/verify:** normalize all ingress, cap individual fields and total roster size, paginate cloud records, surface cloud errors, and validate backup completeness. Test corrupted legacy records, quota exhaustion and multi-page exports. Existing corruption tests establish preservation on write failure, not recovery of all malformed records.

## DevOps Findings

### D1 — Medium — Release checks and reproducible runtime are not enforced (verified repository gap; OPEN)

- **Files:** `package.json` scripts, `package-lock.json`, `bun.lock`, `scripts/start-server.mjs:2`, `server.ts:3`; no `.github/workflows` or equivalent pipeline found.
- **Impact/reproduction:** build can ship without tests, typecheck or lint gating. Multiple package-manager lockfiles disagree on the intended workflow; no Node engine/packageManager declaration pins runtime. Production server imports Vite, a devDependency, at module scope, so a pruned `npm ci --omit=dev` runtime is expected to fail module resolution (not executed here).
- **Fix/verify:** choose npm lockfile plus a supported pinned Node version; isolate Vite import to development; add CI for clean `npm ci`, build, unit/integration/browser checks and advisories, with minimal permissions and pinned action revisions. Validate the actual pruned deployment package. No existing action permissions or container-root issue exists to assess because these files are absent.

### D2 — Medium — Long portrait request has no durable job recovery (code-confirmed; OPEN)

- **File/function:** `api/generate-portrait.js:55`, polling loop; `src/utils/apiClient.js:4`; `vercel.json`.
- **Impact/reproduction:** provider completion after server/client timeout can be paid for but lost. Retrying submits another job. Function duration and region settings are not established; the new deadline bounds local work but cannot guarantee platform completion.
- **Fix/verify:** persist provider job IDs with ownership and idempotency, use short status requests, configure duration budgets, and retain/cancel work appropriately. Simulate timeout then late completion in staging; no live provider job was created.

### D3 — Medium — Operational monitoring/recovery evidence missing (verified repository gap; OPEN)

- **Files:** `server.ts:45` listener; API error handling; `src/utils/localRoster.js:7` exports; release-plan documentation.
- **Impact/reproduction:** no readiness/liveness route, graceful shutdown/drain, structured request IDs/latency/cost metrics or alert rules are implemented. Provider failures can look like healthy local fallback. Local backups require user action; portrait links can expire; deployed Postgres backups/restore are unknown.
- **Fix/verify:** define SLOs and budget alerts, redacted structured metrics, health routes, graceful drain for portable server, and tested restore/rollback runbooks. Stage termination during requests and restore into a separate database. No production termination or restore test was attempted.

### D4 — Medium for native distribution — Signing/update readiness unverified (OPEN)

- **Files:** `src-tauri/tauri.conf.json` bundle settings, `src-tauri/gen/android/app/build.gradle.kts` release block, `src-tauri/gen/android/gradle/wrapper/gradle-wrapper.properties`.
- **Evidence/impact:** native frontend build succeeds, but this is not a signed Rust executable/APK/AAB build. Release signing, installed-app updates, certificate ownership, Gradle distribution checksum and artifact provenance are not established by checked-in configuration. Debug Android explicitly permits cleartext/debugging; release overrides differ as expected.
- **Fix/verify:** test signed packages on target devices, record toolchain/checksums, verify release manifest/debug flags, keep signing keys outside source, and prove update/rollback paths. No Rust/Gradle advisory scanner or native packaged build was run.

## Engineering Findings

- **E1, Low, verified performance warning:** `src/App.jsx` statically imports the game/UI/data; Vite reports a roughly 740 KB main JS chunk (225 KB gzip). PWA precaches 28 assets, including export chunks. Measure cold-start/memory on target phones, then split heavyweight routes/export dependencies and reconsider eager cache contents; do not rewrite the app solely to remove a warning. Native frontend is similar. No destructive load test was run.
- **E2, Low, code-confirmed lifecycle debt:** `src/components/Wheel.jsx:88` schedules animation frames/timeouts inside `spinTo` without unmount cancellation; `src/App.jsx:247` and `:279` also schedule advancement timers. Navigating/unmounting during a spin can run stale callbacks. Add cleanup and a build-generation token, then test reset/unmount and rapid input. Lint also flags callback dependencies and random values generated during render in particle components; lint warnings alone are not proof of runtime failure.
- **E3, Low, verified maintenance gap:** no formatter/type checker is configured; unused SDK/export dependencies (`@google/genai`, `openai`, `html2pdf.js`) and legacy mutation scripts add supply-chain/maintenance surface. Runtime uses fetch and dynamic jspdf/html-to-image imports. Remove dependencies only after usage/build verification and choose one authoritative development workflow. No speculative rewrite was made.

## Secrets and Dependency Review

Pattern scan across tracked files found no common Groq/OpenAI/GitHub/AWS token literal or private-key marker. A targeted history search for Groq/OpenAI/private-key patterns returned no matching revisions. These bounded patterns do not detect arbitrary secrets, encoded values, every provider key format, or unreachable Git objects. `.env` contains configured server credentials; only variable names/configured flags were inspected in output. Exact server-secret values were compared in memory against existing frontend JS/HTML/JSON/map artifacts; no matches were reported. No secret values were printed or placed in this report. Logs were not comprehensively scanned for arbitrary historical credentials.

`npm ls --depth=0` passed with no dependency-tree conflict. `npm audit --json` returned **zero known vulnerabilities** at audit time after authorized registry access. This does not cover new/unreported vulnerabilities, exploitability of native crates, or malicious packages. Lockfile resolved URLs use the npm registry; install-script flags occur for `@google/genai`, `core-js`, `esbuild`, `fsevents`, and `protobufjs`. Those scripts were inventoried, not sandbox-reviewed in full. A clean dependency installation was not performed over the user's existing node_modules. Dependency freshness/abandonment was not exhaustively verified; no package upgrades were made.

## Tests Performed

| Check | Result and scope |
|---|---|
| Repository/status/instruction/configuration inventory | Reviewed current changes, file inventory, runtime/config/source and existing tests; no repository AGENTS.md found |
| `npm ls --depth=0` | PASS; installed top-level dependency tree |
| `npm audit --json` | PASS, zero advisories; initial sandbox network attempt failed, authorized retry succeeded |
| `npm run build` | PASS, web/PWA and Express bundle; large-chunk warning |
| `npm run build:native` | PASS, frontend only; not a Rust/Android package build |
| `npm run lint` | Exit 0 with existing unused-variable, hook-dependency, render-purity and initialization warnings |
| `npm test` baseline | 25/25 passed after sandbox user-information error was resolved by authorized retry |
| `npm test` final | 32/32 passed; first new-test attempt had three test-helper failures (`t.mock.env` unavailable); helper corrected and suite rerun |
| `node --test tests/integration/server.test.js` | Production server HTTP integration; parser errors/oversized bodies, headers, static root, native preflight, CORS, SW caching; only localhost and empty provider credentials |
| `npm run test:browser` baseline | Both scenarios reported pass; sandbox runner stalled on cleanup and was stopped. Retry initially found its preview port occupied; authorized rerun used clean process management |
| `npm run test:browser` final | PASS, 2/2 on the rebuilt frontend; runner exited successfully in 1.3 minutes |
| Browser scenarios | Offline full auto-spin, local lore, save, reload/reopen with no page errors; manifest/cache locality and exclusion of server/API content |
| Targeted secret/history/bundle scans | No matches within documented scope; configured credential values never printed |
| Lockfile install scripts/source inventory | Registry sources only; install-script flags enumerated |
| `git diff --check` | PASS; CRLF normalization warnings only |
| Typecheck/format check | NOT TESTED: no configured checker or formatter |
| Live auth/DB/provider, native package, proxy/load/restore | NOT TESTED; no external systems attacked or production data altered |

## Tests Added

`tests/audit-regressions.test.js` adds seven tests: zero/default stats, None senjutsu, malformed optional AI fields, invalid API bodies/methods, redacted errors, timeout/malformed-provider responses, and an explicit characterization of remaining anonymous generation exposure. The latter passing test documents insecure current behavior; it is not a security acceptance test.

`tests/integration/server.test.js` adds a local production-process HTTP test with empty provider credentials. Run after `npm run build` using `node --test tests/integration/server.test.js`; it uses localhost port 14379 and stops its own child process. It is separate from the default unit-test glob and should be added to CI.

Recommended next coverage: two-user RLS matrix; invalid/expired auth tokens; distributed quota/idempotency races; account-switch response ordering; two-tab local deletion; duplicate saves/unknown commit outcomes; storage quota/corrupted records; PDF/clipboard permissions and remote-image failures; portrait polling success/failure/late completion; native secure-session/export/update behavior. No payments or admin features currently require tests.

## Changes Made

- `.gitignore`: ignore environment variants while retaining the sample.
- `api/generate-lore.js`, `api/generate-portrait.js`: input validation, shared abort deadline and redacted failures; preserve pre-existing CORS work.
- `server-utils/generation.js`: new common validation, deadline and safe error helpers.
- `server.ts`: smaller parser limit, generic error middleware, basic headers, remove unused key read, method-consistent API routing; preserve pre-existing routes/CORS integration.
- `vercel.json`: mirror basic browser security headers.
- `src/utils/buildStats.js`, `src/utils/gameLogic.js`: zero-value and None-senjutsu corrections.
- `src/utils/localLore.js`: reject malformed optional AI display fields.
- `tests/audit-regressions.test.js`, `tests/integration/server.test.js`: regression and local HTTP coverage.
- `docs/production-readiness-audit.md`: this report.

Generated `dist`, `dist-server`, `dist-native` and ignored test artifacts were rebuilt. Existing `.env.example`, `.vercelignore`, native scripts, platform docs, `server-utils/cors.js` and `tests/cors.test.js` changes were present before this audit and are not claimed as new audit work. No lockfiles, secrets, database records, cloud resources or Git history were modified.

## Remaining Risks

This audit establishes local behavior, not deployed guarantees. Supabase policies/schema/session settings, Vercel headers/runtime limits, real provider response contracts and job persistence, native dependencies/signing, production telemetry, backups, and incident response remain unverified. Added limits may reject custom unusually long prompts; normal existing browser flows pass. New stat calculations affect future rolls, while old saves retain snapshots. Shared-user local storage and stale async state need deliberate storage/session design.

## Production Readiness Checklist

| Area | Status | Explanation |
|---|---|---|
| Build | [PASS] | Web/server/native frontend; native packages excluded |
| Unit tests | [PASS] | 32 tests |
| Integration tests | [PASS] | Local production HTTP only; live database integration untested |
| E2E tests | [WARNING] | Offline/cache scenarios pass; online account/provider/export/native coverage incomplete |
| Authentication | [FAIL] | Paid API has none; hosted Supabase auth unverified |
| Authorization | [NOT TESTED] | Actual database grants/RLS unavailable |
| Input validation | [WARNING] | API limits improved; full persisted-record schemas incomplete |
| API security | [FAIL] | No quotas/idempotency/auth; server prompt policy absent |
| Secrets management | [WARNING] | Bounded scans clean; rotation/history/log assurance incomplete |
| Dependency security | [WARNING] | npm audit clean; native/supply-chain checks incomplete |
| Database integrity | [NOT TESTED] | Schema/indexes/constraints/transactions unknown |
| Error handling | [WARNING] | API sanitized and local fallback tested; roster failures/races remain |
| Logging | [WARNING] | Redacted API errors; no request correlation/metrics |
| Rate limiting | [FAIL] | No application-level enforcement |
| Security headers | [WARNING] | Basic headers added; deployed CSP/HSTS unverified |
| Docker security | [NOT TESTED] | No container configuration in scope |
| CI/CD security | [FAIL] | No enforceable pipeline/release gates in repository |
| Production configuration | [WARNING] | Runtime/version/provider budgets and signed packages unresolved |
| Monitoring | [FAIL] | No implemented monitoring/alert configuration found |
| Backup/recovery assumptions | [WARNING] | Manual JSON backup; cloud restore and portrait durability untested |

## TOP 10 ISSUES TO FIX BEFORE PRODUCTION

1. **S1:** authenticate and meter paid generation; shared quotas, spend limits and server-owned prompts.
2. **S2:** verify and version database ownership policies with anonymous/A/B/expired-session tests. This is an unknown release gate, not a proven breach.
3. **Q4:** stop stale local roster deletion from losing concurrently added records.
4. **Q5:** make cloud saves idempotent and guard duplicate submissions/ambiguous outcomes.
5. **Q6:** cancel/ignore stale roster reads across logout and account switches.
6. **D2:** persist portrait jobs and recover late results without duplicate paid submissions.
7. **D1:** establish pinned runtime, one lockfile workflow, clean deployment package and enforced CI checks.
8. **D3:** add operational health/cost alerts, graceful drain, tested database restore and rollback.
9. **Q7:** validate legacy/cloud records and paginate rosters so export/display are complete and safe.
10. **D4:** prove signed native release/update behavior before distributing desktop/Android packages. For a web-only release, prioritize S5's staged CSP/HTTPS verification instead.

### References

The cost-abuse classification follows [OWASP API4: Unrestricted Resource Consumption](https://api-security.owasp.org/editions/2023/en/0xa4-unrestricted-resource-consumption/). Database recommendations follow [Supabase's RLS explanation](https://supabase.com/docs/guides/troubleshooting/rls-simplified-BJTcS8) and [Data API authorization guidance](https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/api/securing-your-api.mdx). These references support the control recommendations, not claims about this project's deployed configuration.
