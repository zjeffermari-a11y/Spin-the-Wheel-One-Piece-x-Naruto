# First milestone: local character generation

Implemented before native packaging:

- After the wheels finish, choose **Create Offline Character** for local template lore and three signature moves. This sends no generation requests, even with a connection.
- **Generate with AI (Online)** requests lore and a portrait independently. Failed or malformed AI lore falls back to templates; a failed portrait does not discard successful lore.
- Local results offer **Generate AI Version (Internet Required)**. Generation provenance appears on the card and Markdown export. Generating another version resets the saved indicator.
- Template moves use selected lore capsules and deterministic unlocks. Enma's mantle stays locked until its awakening stage is present. The templates use the generated name rather than guessing protagonist pronouns.
- Without Supabase configuration the app opens in Local Mode. Guest saves retain lore source, full tier data and portrait URL. Signed-in users can save locally when offline or after a cloud-save error; these records do not automatically synchronize yet.
- API calls use a shared client with bounded requests. Optional `VITE_API_BASE_URL` configures a public HTTPS backend address for future native clients. It is not a place for credentials.

Validation: regression tests cover no-network generation, fallback behavior, Enma unlocks, malformed local storage, request timeout and startup without Supabase credentials. Existing identity and progression tests also remain in the suite.

PWA shell caching and offline reopening are now implemented for production web builds. Local fonts, backgrounds and lazy export libraries are precached. The app reports when the cache is ready; updates wait until all app tabs/windows close. Browser tests cover offline reload, full automatic wheel creation, local save and roster reopen.

Roster backup/import is available in the Crew dialog. Backups include character data and portrait URLs, not image bytes. Imports stay local, preserve existing records and reject malformed backups.

Still pending: persistent portrait downloads, durable cross-device synchronization, production API authorization/quotas and complete native device validation. An existing remote portrait URL alone does not make the image available offline. Browser-local saves and caches can be lost if site data is cleared. The first-ever visit needs a connection; installation and service workers require HTTPS or localhost.
