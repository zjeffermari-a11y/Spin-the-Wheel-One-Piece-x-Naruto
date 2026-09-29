# Monetization research and feature recommendations

Research date: September 26, 2026. Scope: inspected the current local source and project documentation; researched public competitor offers, provider prices, and distribution policies. No production analytics, customer interviews, billing records, or rights agreements were available. Recommendations and proposed prices are hypotheses to validate, not revenue forecasts. USD examples assume a web-first pilot; target country, business location, audience age, and native distribution remain open decisions.

## Recommendation

Keep the core character-building game free. Launch a one-time Character Studio pack, then test a Creator Pro subscription with repeat-use publishing and hosting tools. Sell bounded AI generation bundles as an optional add-on. Build free sharing and daily challenges alongside these offers to create acquisition and return visits.

The current product is a character generator and collection experience, not yet a battle game or persistent RPG. Its best immediate paid product is a better way to personalize, present, and reuse characters. A full multiplayer economy would require a much larger investment before monetization can be validated.

## What the project already contains

| Existing capability | Evidence | Commercial implication |
|---|---|---|
| Sequential rolls, automatic spinning, build completion | `src/App.jsx` | Preserve the immediate free experience. |
| Stats, synergies, bounty, progression-related rolls | `src/utils/buildStats.js`, `src/utils/buildMechanics.js`, `src/data/progression.js` | Useful foundation for challenges and comparison; these are not an ongoing XP/campaign system. |
| Template lore and optional generated lore/portrait | `src/utils/localLore.js`, `api/generate-lore.js`, `api/generate-portrait.js` | Free offline output has low marginal service cost; paid AI must be metered separately. |
| Character cards, Markdown copy, PDF export | `src/components/CharacterCard.jsx` | Charge for new templates, advanced editing, and additional output workflows; avoid removing existing exports. |
| Local roster, optional Supabase saves, JSON import/export | `src/components/RosterModal.jsx`, `src/utils/localRoster.js` | Add organization and synchronization quality; basic saving is already available. |
| PWA and Tauri desktop/Android foundations | package scripts and platform documents | Web can validate demand before introducing multiple billing integrations. |

No payment, entitlement, product analytics, daily challenge, or authoritative competitive system was found in the inspected runtime. The existing production audit documents anonymous generation access and unknown deployed database ownership policies; source inspection also shows no token verification or quota enforcement in the generation handlers. This research did not re-test the live backend.

The wheel currently selects a uniform random option with `Math.random()` in the browser. Rarity weights exist in `src/data/rarity.js`, but that roll function does not use them. Do not interpret the configured weights as actual purchase odds or treat local saves as verified competitive records.

## Market evidence

| Product | Observed offer | Relevance |
|---|---|---|
| [SpinVerse One Piece Builder](https://spinverse.app/tools/one-piece-builder) | Advertises free, unlimited builds without sign-up, including stats and sharing/downloads. | A basic franchise wheel and generated stats face direct free competition. |
| [Grand Line Spin](https://www.grandlinespin.com/) | Crew drafting, synergy scoring, leaderboard, and tip prompts. | Team construction and comparison are adjacent engagement patterns, but no public revenue evidence was found. |
| [Wheel of Names](https://wheelofnames.com/faq) | Advertising supports free access; its FAQ says it accepts neither payments nor donations. | Charging for ordinary spins competes against an established free utility model. |
| [Picker Wheel](https://pickerwheel.com/plan/) | Premium customization, branding, larger storage and participation limits. Captured annual prices are $60, $120, and $300, displayed as $5, $10, and $25 monthly equivalents. | Useful analogue for creator/host utility. These are annual commitments, not verified monthly checkout prices. |
| [Hero Forge](https://heroforge.com/content/product-information/subscriptions/) | Pro includes portraits, token creation, scene tools, and saved-character folders. Listed Pro pricing is $5.99 for one month or $3.99/month on a 12-month term. | Strong fit for monetizing creative output and organization around a free character builder. |
| [AI Dungeon](https://help.aidungeon.com/memberships-benefits) | Journey costs $14.99/month; subscriptions bundle richer models, memory/context, and generation credits. | Recurring narrative use can support a subscription, but this project currently lacks that repeat-use story loop. |
| [Perchance character generator](https://perchance.org/ai-character-generator) | Its public page advertises free, no-sign-up, unlimited generation. | Generic AI generation alone is a weak differentiator. |

These pages verify advertised products and prices, not their profitability, customer satisfaction, rights clearance, or willingness to pay for this project. Community search results also show character-wheel sharing and comparisons, but anecdotal posts are not a market-size estimate.

[RevenueCat's 2026 report](https://www.revenuecat.com/state-of-subscription-apps) reports weaker 12-month subscriber retention for AI apps than non-AI apps in its monthly and annual cohorts. It is broad subscription-app evidence, not a conversion forecast for a browser anime game. The relevant lesson is to validate repeat utility before selling recurring access.

## Ranked features

Effort is relative to this codebase and includes product complexity, not a delivery estimate. Ranking reflects fit, implementation burden, recurring costs, and likely purchase clarity. There is no user data supporting a precise revenue ranking yet.

### 1. Character Studio — best first paid feature

**Customer:** a casual player who likes a generated character and wants to personalize or share it.

**Build:** editable name, title and biography; original card frames and backgrounds; color palettes; portrait crop and positioning; square and vertical social layouts; direct high-resolution PNG export; a crew collage assembled from saved characters. Changes to identity/presentation should not change rolled power.

**Free boundary:** keep normal rolls, local lore, basic saving, existing Markdown/PDF exports, and a basic share image free. If simple name editing materially improves activation, make it free too; the sellable bundle should be the richer studio and finished visual outputs.

**Offer:** test $7.99 one-time for a clearly defined bundle of local editing/export features. Separately test original cosmetic packs at $2.99–$4.99. These are proposed prices, not validated willingness to pay. Do not promise lifetime cloud hosting, AI, or every future pack.

**Purchase moment:** after the user has seen and saved a completed character, show a live preview of a premium layout.

**Effort:** medium. Existing card rendering/export lowers the starting cost; payment and entitlement foundations are still necessary.

**Validation:** actual purchases, premium-preview-to-purchase conversion, exports per buyer, refunds, and whether free sharing declines.

### 2. Creator Pro — best recurring revenue hypothesis

**Customer:** a video creator or community host who repeatedly produces character challenges.

**Build:** recording layouts for 9:16 and 16:9; keyboard controls and adjustable reveal pacing; branding presets; reusable custom wheel rule sets; batch card export; versus/team graphics. Start with these concrete production tools. Add OBS browser-source layouts, viewer submissions, private rooms, and event controls only when hosts demonstrate demand.

**Offer:** test $9.99/month for repeat-use tools, bounded cloud resources, and a small measured AI allowance. Consider an annual plan only after observing renewal behavior. The subscription does not grant rights to underlying franchise assets.

**Free boundary:** joining a creator's challenge and viewing/sharing a result should remain free. Make organizers the customers rather than charging every participant.

**Effort:** medium for export/presentation features; high for live rooms and moderation. An embedded OBS view needs a deliberate exception to the project's current framing restrictions.

**Validation:** interview about ten relevant creators; observe their recording workflow; recruit three to five design partners. Treat repeated use and actual paid renewal as stronger evidence than enthusiastic feedback. These sample sizes are practical pilot targets, not statistically conclusive tests.

### 3. AI portrait and lore bundles — useful add-on

**Customer:** someone refining a favorite character, not someone purchasing stronger game outcomes.

**Build:** separate portrait and lore actions; choice of visual treatment; previewable prompt inputs; bounded retries; persistent generation history; durable image storage; visible price and job status. The current AI mode invokes both lore and portrait generation, which makes separate metering and selective retries particularly useful.

**Offer:** test a $4.99 prepaid bundle only after measuring how many successful outputs can be delivered profitably. State clearly whether customers buy completed outputs or attempts. Recommended policy: failed jobs release reserved credit; successful accepted jobs consume it. Account for provider costs even when the user receives a credit refund.

**Do not launch:** unlimited AI, opaque currencies, or recurring charges justified only by one initial portrait. Check whether the chosen image model supports reference-based editing before promising consistent identity across poses or scenes.

**Effort:** medium-high because reliable jobs, storage, metering, and billing matter more than adding a button.

**Validation:** cost per successfully delivered portrait, retries, completion rate, time to output, repeat purchase, and support/refund burden.

### 4. Daily challenges and share links — highest-priority free supporting features

**Build:** one short daily ruleset, comparable attempt limits, a friend challenge link, shareable result pages, and a collection journal. Example: build the strongest team under a fixed power budget. A daily seed can define consistent challenge inputs, but replaying the same seed must not permit unlimited counted attempts.

These features help purchases by bringing people back and distributing the product. They do not automatically create revenue. Keep ordinary participation and sharing free; monetize presentation and host tools.

Start with friendly unranked comparisons. If rankings matter, issue/validate attempts server-side, version rules, recompute scores, and exclude edited/imported offline builds from verified rankings. Deterministic stats are not a complete combat simulator; do not present simple power comparisons as canonical battle outcomes.

**Effort:** medium for sharing; medium-high for fair scored challenges. Public pages need privacy controls and abuse reporting. A full public gallery adds moderation and should follow, not precede, basic sharing.

**Validation:** completion rate, repeat sessions, day-1/day-7 retention, sharing rate, and the fraction of referred visitors who complete a build.

### 5. Collection management and cloud convenience — bundle with Pro

Add folders, tags, search, side-by-side comparisons, relationship/team views, version history, durable portraits and reliable cross-device synchronization. Prefer reliable organization over arbitrary local roster limits. Retain reading/export access to existing creations when a subscription ends; define reasonable cloud limits and grace periods clearly.

This strengthens an established habit. Storage capacity alone is unlikely to be the best first paid proposition because local saves and backups already exist.

### 6. Story campaigns and original expansions — later growth

Branching adventures, rivalries, training arcs, and fixed-price original-world expansions could give saved characters continuing purpose. First test a short authored adventure with deterministic outcomes and optional AI narration. Do not let paid narration silently change powers or outcomes.

Avoid starting with an open-ended AI RPG, real-time PvP, trading marketplace, or battle pass. Those introduce content cadence, balance, abuse, moderation, or cost obligations before customer demand is established. A seasonal cosmetic pass only makes sense after players already return for a season's activities.

## Commercial rights and distribution

The repository explicitly uses One Piece/Naruto content and named characters/abilities. No commercial license was established by this research. Before charging for franchise-based content, confirm permission for the intended commercial uses or build a genuinely original setting, characters, assets, names, and lore. Renaming a few labels does not establish clearance. A fan disclaimer, free release, donation button, or AI-generated portrait does not by itself settle rights.

The [U.S. Copyright Office](https://www.copyright.gov/what-is-copyright/) explains owners' derivative-work rights and the existence of exceptions; the applicable analysis depends on jurisdiction and the actual material. [Google Play's IP policy](https://support.google.com/googleplay/android-developer/answer/9888072?hl=en) prohibits infringement and addresses permission documentation. Obtain targeted rights advice for the chosen launch markets rather than treating this report as a legal determination.

For distribution, validate on the web/PWA first. [Google Play payments policy](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en) generally requires its billing system for in-app digital purchases, with regional/program exceptions. [Apple's review rules](https://developer.apple.com/app-store/review/guidelines/) have their own purchase and content requirements. A web checkout must not simply be assumed to work unchanged inside native apps.

I would not sell paid luck, rare-character rolls, power boosts, or competitive rerolls. Besides fairness and the current client-controlled architecture, both stores require probability disclosure for purchased randomized virtual items. This is not a claim that every random wheel is gambling; it is a reason to prefer clearer fixed-value purchases here.

## Unit economics and advertising

The lore handler currently uses Groq's `openai/gpt-oss-120b`. [Groq lists](https://console.groq.com/docs/models) $0.15 per million input tokens and $0.60 per million output tokens. An illustrative request with 3,000 input and 1,000 billable output tokens costs $0.00105 for model usage. Actual reasoning tokens, retries, token counts, infrastructure, and support alter total delivery cost; this is not a measured project average.

The portrait handler calls Higgsfield Soul v2 standard. [Higgsfield's API information](https://higgsfield.ai/blog/higgsfield-api) distinguishes API billing from consumer subscriptions. Public catalog snippets showed Soul 2 prices, but this research did not verify the exact billed configuration of the existing endpoint. Use provider invoices and measured jobs before setting bundle quantity.

For a $4.99 web purchase, an illustrative US domestic-card fee of 2.9% + $0.30 leaves approximately $4.55 before delivery costs. That fee comes from [Stripe's US pricing page](https://stripe.com/pricing); it is not a provider recommendation or a rate applicable to every country, payment method, subscription product, or store.

At a proposed target contribution of 70% of gross sales after processing and direct delivery, the remaining delivery budget is about $1.06 per $4.99 sale: $4.99 - $0.44471 - $3.493. If measured all-in variable cost per successful output is $0.02, $0.05, or $0.10, the mathematical maxima are 52, 21, or 10 outputs respectively. Round down further for uncertainty. These costs are sensitivity inputs, not claimed Higgsfield prices. Taxes, fixed hosting, development, acquisition, and other overhead remain outside this illustration.

Ads should be a later secondary experiment. Prefer an optional rewarded cosmetic unlock with no expensive backend work. At a hypothetical $10 rewarded eCPM, one filled impression earns about $0.01; that may not fund a portrait and its retries. Actual fill, geography, consent, age rules, and engagement determine results. [AdMob's rewarded-ad policy](https://support.google.com/admob/answer/7313578?hl=en-GB) requires clear reward terms and appropriate user choice. Avoid interstitials after every spin, which would interrupt the central experience.

For scale intuition only: 10,000 monthly active users with 2% paying $7.99 would yield $1,598 gross that month. For a one-time pack this is not recurring revenue; the same cohort cannot be counted as new buyers every month. Separately, 50 active Creator Pro subscribers at $9.99 yield $499.50 MRR before costs. Neither scenario predicts this project's traffic or conversion.

## Implementation sequence and decision gates

### Phase 1: establish a safe paid pilot

Resolve original/licensed content scope and launch market. Instrument the funnel: session start, first spin, completed build, save, export, share, referral completion, premium preview, checkout start, confirmed payment, generation success/failure/cost, and repeat visit. Avoid logging biography/prompt text by default. Distinguish unique users from repeat events and segment acquisition sources.

Implement backend token verification, atomic quotas and credit reservation, idempotent jobs, provider spend ceilings, verified payment webhooks, refund/revocation handling, account ownership rules, and entitlement checks. Browser flags are not proof of purchase. Add persistent jobs and owned image storage so retries or page refreshes do not duplicate charges or lose purchased results. Keep offline local features working.

Acceptance gate: duplicate webhooks cannot double-grant credits; simultaneous requests cannot overspend; failed jobs reconcile; expired/foreign accounts cannot spend another user's balance; offline entitlements have a defined restore/grace behavior. This is necessary revenue infrastructure, not a customer-facing premium feature.

### Phase 2: test one purchase

Deliver a small Character Studio bundle and free share images/links. Show specific previews after a successful build. Run an honest paid pilot with disclosed deliverables. At low traffic, interviews and sequential price pilots are more useful than underpowered A/B tests. Monitor refund-adjusted contribution and repeat use, not checkout clicks alone.

### Phase 3: test recurring creator value

Ship recording presets, reusable rules, and batch/versus exports to creator design partners. Offer Creator Pro when those tools are usable. Expand to hosting only if creators repeatedly ask for it and use the simpler tools. Add AI packs once measured delivery costs and job reliability support a specific quantity.

### Phase 4: expand the return loop

Add daily challenges and improved collection tools, then evaluate stories or original expansions. Build a battle pass or larger multiplayer system only if observed engagement supports the ongoing production burden.

Track four distinct outcomes: completed characters per new visitor, returning creators/players, actual paid conversion by offer, and contribution after variable costs/refunds. Do not import general mobile-industry conversion figures as success thresholds. Establish the project's baseline, preregister each experiment's intended improvement and guardrails, and report uncertainty when samples are small.

## Decisions that would change the recommendation

- Existing audience: creator-heavy traffic would move Creator Pro ahead of the casual Studio pack.
- Session pattern: mostly one-time visits favor one-time packs; repeated campaign use favors subscriptions.
- Existing commercial rights: a license could support official franchise expansions; otherwise prioritize original content.
- Primary market and audience age: these affect price, payment availability, advertising, and privacy design.
- Real AI cost and usage: these determine credits per bundle and free allowance.
- Budget and distribution: a required native-store launch changes billing scope and economics.

The recommended initial offer remains narrow: free character creation and sharing, a paid presentation/customization bundle, and measured validation of creator subscription demand.
