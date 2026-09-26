# Kitaabistan — Frontend (Next.js)

A frontend-only build of the offline bilingual library app described in
the Product & Business Blueprint. No backend is wired in — auth,
profiles, progress, streaks, bookmarks, and downloads are simulated with
`localStorage` so the whole UI is fully demonstrable end-to-end; every
context is written so real API calls can be swapped in later without
touching page code.

---

## 1. Run it in VS Code

**Requirements:** [Node.js 20+](https://nodejs.org) (includes `npm`) and VS Code.

```bash
# 1. Unzip the project, then open the folder in VS Code
cd kitaabistan-frontend
code .

# 2. Open the built-in terminal in VS Code (Ctrl+` / Cmd+`) and run:
npm install
npm run dev
```

Open **http://localhost:3000** in your browser. Any change you save
hot-reloads instantly.

**Recommended VS Code extensions** (optional, all free on the Marketplace):
- `ES7+ React/Redux/React-Native snippets`
- `Tailwind CSS IntelliSense`
- `Prettier — Code formatter`
- `ESLint`

**Other useful commands:**
```bash
npm run build   # production build — also the best way to catch real errors
npm run start   # run the production build locally
npm run lint    # check code style
```

---

## 2. Is this "complete" vs. the blueprint? — Honest status

**Everything that belongs in a frontend, for Phase 1 (Section 7 of the
blueprint), is built.** Three things are true at the same time, and it's
worth being precise about which is which:

### Fully built (Phase 1 Feature Checklist, Section 7)
Offline library UI across all 8 pillars (comedy correctly nested as a
sub-shelf inside Novels, not a 9th shelf) — bilingual Urdu/English poems
side-by-side — offline-chatbot UI with curated Q&A matching,
unanswered-question logging, thumbs up/down feedback, "you might also
want to know" suggestions, voice input and text-to-speech output —
bookmarks + reading progress — search — light/dark mode + adjustable
font size/line spacing + dyslexia-friendly font — full Urdu/English
app-wide switch — Kids Mode with content filtering — multiple reader
profiles — reading streaks + badges — onboarding (language, tour,
optional profile setup, starter-pack download) — a simulated
download-once-then-offline system per book, so the core "offline" pitch
is actually visible in the UI, not just claimed — a live "you're
offline" banner — Privacy Policy & Terms pages — branded 404 page — app
icon, PWA manifest, favicons, SEO metadata, robots.txt + sitemap.

### Simulated on purpose (needs a real backend to become real)
- **Book/poem/story content** is placeholder text (two poems have real
  bilingual lines as a working example). Real content goes in once the
  admin panel/backend exists.
- **The chatbot's brain** is a small in-file keyword matcher standing in
  for the real on-device Q&A engine — same UX, fake knowledge base.
- **"Download once, read offline"** is a realistic simulation (progress
  bar, persisted in localStorage) — not an actual file fetch, because
  there's no file server yet.
- Everything is **per-browser**, not per-account — nothing syncs across
  devices without a real backend and login.

### Not a frontend concern (per the blueprint's own section breakdown)
Admin panel (Section 10) — real Q&A/content database — local DB
encryption, CI/CD, crash analytics (Section 10) — content-rights
register and moderation process (Section 11, a workflow, not a screen)
— Team/Budget/Roadmap (Sections 12-13, business planning docs) — any
Phase 2 item (ads, payments, institutional dashboard, audiobooks, push
notifications, cloud sync) — the blueprint itself scopes these to after
Phase 1 launch.

**So: nothing that could be built without a server has been skipped.**
What's left is backend/admin work plus swapping real content in.

---

## 3. Publishing this — Website vs. Play Store (important distinction)

This is a **Next.js web app**. That matters for how each target actually works:

### As a website (Google-searchable) — straightforward
1. Push this folder to a GitHub repo.
2. Deploy free on [Vercel](https://vercel.com) (the company that makes
   Next.js) — connect the repo, it builds and deploys automatically on
   every push, and gives you a live HTTPS URL immediately.
3. Point your own domain at it (e.g. kitaabistan.app) in Vercel's
   domain settings.
4. Update `SITE_URL` in `src/app/layout.js` and `src/app/sitemap.js`,
   and the `Sitemap:` line in `public/robots.txt`, to your real domain.
5. Submit the sitemap (yourdomain.com/sitemap.xml) in
   [Google Search Console](https://search.google.com/search-console) so
   Google indexes it.

### As a Play Store app — needs one extra step (this is normal, not a gap)
A Next.js site isn't a native `.apk`/`.aab` by itself — no web framework
produces one directly, including the Flutter-recommended path in the
blueprint's own Technical Architecture section, which assumes a separate
native build. Two realistic paths from here:

1. **Fastest, recommended for an MVP/launch:** this app already ships a
   PWA manifest + icons (`public/manifest.json`), so it's installable
   as-is. Use [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap)
   or [PWABuilder](https://www.pwabuilder.com) to generate a **Trusted
   Web Activity** — a thin native Android wrapper Google explicitly
   supports for Play Store submission. Takes a few hours, not a rebuild.
2. **Long-term, for deep native features** (offline file storage beyond
   browser storage, background sync, etc.): rebuild with Flutter or
   React Native per the blueprint's Section 10 recommendation, using
   this frontend as the exact design and UX reference.

Either way, this frontend is the correct design/UX source of truth for
that next step — nothing here needs to be rebuilt for it to work.

---

## 4. Structure

```
src/
  app/
    page.js                 Public marketing homepage ("web")
    onboarding/page.js       Language -> tour -> optional profile -> starter pack
    demo/, login/, signup/   Auth flows
    home/page.js             Main dashboard (protected, "app")
    library/page.js          All categories + search (Kids-Mode filtered)
    library/[category]/      Books inside one category, incl. Comedy sub-shelf
                              nested inside Novels
    book/[id]/                Reading screen: download gate, progress, TTS,
                              dark mode, bilingual side-by-side poems
    chatbot/page.js          Curated Q&A + voice in/out + feedback
    saved/page.js            Bookmarked books
    profile/page.js          Account, streak/badges, reader-profile manager
    not-found.js             Branded 404
    sitemap.js               SEO sitemap (Next.js App Router convention)
  components/
    AppShell.js       Route guard + responsive nav + demo/offline banners
    Providers.js      Wraps the app in every context below
    StarterPackModal.js, CategoryTile.js, BookCard.js
  context/
    AuthContext.js        Demo timer + signup/login/logout
    LanguageContext.js    Urdu/English toggle
    BookmarksContext.js   Saved books
    ProgressContext.js    Per-book reading progress (scroll-based)
    StreakContext.js      Daily reading streak + badges
    ProfilesContext.js    Multiple reader profiles + Kids Mode flag
    DownloadsContext.js   Simulated per-book "download once, read offline"
  lib/
    booksData.js      Categories & books (incl. Comedy sub-shelf under
                      Novels), kidsSafe flags, bilingual poem data,
                      bundled/sizeMb download metadata
    translations.js   UI chrome dictionary + t(lang, key, vars) helper
    onboarding.js     First-run / starter-pack localStorage helpers
public/
  manifest.json, icon-*.png, apple-touch-icon.png, favicon*.png,
  robots.txt   PWA + SEO assets
```

## 5. Design system

Colors and type follow the blueprint's Design & Visual Theme (Section 9)
exactly:
- Deep Teal `#0E5C4C`, Night Teal `#0B4A3D`, Warm Gold `#C79A3F`, Soft
  Cream `#FAF3E7` — see `:root` in `src/app/globals.css`.
- Headings: Georgia (English) / Noto Naskh Arabic (Urdu) — a literary
  serif, distinct from body text.
- Body: Manrope (English) / Noto Nastaliq Urdu (Urdu body script).
- Accessibility: Lexend dyslexia-friendly mode, adjustable line
  spacing, icon+label navigation (never icon-only), checked contrast in
  both light and dark themes.
