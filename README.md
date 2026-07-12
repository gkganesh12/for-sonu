# Written in the Stars — for Sonu ✨

A cinematic, scrolling birthday story for Sakshi ("Sonu") — eight scenes under a
living starfield: the first hello at Prathibha College, a four-year timeline, the
2 AM talks, the storms, a field guide to her favourite things, a photo gallery,
and a finale with candles to blow out and a wish to make.

## Run it

```bash
npm install
npm run dev          # local preview at http://localhost:4321
npm run build        # production build into dist/
npm run preview -- --host   # preview the build, reachable from your phone on the same wifi
```

To open it on a phone on the same wifi, use `--host` and visit
`http://<your-mac-ip>:4321`.

## Add your photos (the "Moments of us" chapter)

Drop photos into **`src/assets/moments/`** and rebuild — done.

- The file name becomes the caption: `goa-trip.jpg` → *"goa trip"*
- Alphabetical order controls position: `01-first-day.jpg`, `02-goa-trip.jpg`, …
- Until then, elegant placeholder polaroids keep the chapter looking complete.

## Edit any words

All copy — every chapter, the timeline, the chat, the letter, the sign-off —
lives in **`src/content.ts`**. Change text there, rebuild, nothing else needed.

## Deploy

**Render (recommended):** the repo has a `render.yaml` blueprint. In the Render
dashboard: **New + → Blueprint → connect `gkganesh12/for-sonu` → Apply**.
Render builds `npm ci && npm run build` and serves `dist/` — done.

**GitHub Pages:** already wired via `.github/workflows/deploy.yml` — every push
to `master` builds and deploys to `/for-sonu` (base path set by the workflow).

Any other static host works too — the build is plain HTML/CSS/JS in `dist/`.

## Verify after changes

```bash
npm run preview -- --host &
node scripts/verify.mjs      # walks every scene at phone size, screenshots to /tmp/sonu-verify/
```

## Credits

Music: "Frozen Star" — Kevin MacLeod (incompetech.com), licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
