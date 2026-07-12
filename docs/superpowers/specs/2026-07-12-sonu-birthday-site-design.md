# "Written in the Stars — for Sonu" — Birthday Site Design

**Date:** 2026-07-12 · **Ship deadline:** birthday is 2026-07-13 (tomorrow)
**Approved by user:** yes ("Start.")

## Purpose

A surprise, cinematic, storytelling birthday website for Sakshi ("Sonu"), from her
closest friend of 4+ years. Opened as a link on her phone; she scrolls through a
night-sky film of their story and reaches an interactive finale.

## Personal source material (from the user)

- Nickname **Sonu**; birthday tomorrow (July 13).
- Met ~4 years ago doing BSc together at **Pradiba College**.
- She is very talkative, endlessly curious, a genuinely good person; every moment
  with her feels good; "I love her, in a sense."
- Shared history: 4+ years together, trips, late-night talks, disasters/storms
  they came through laughing.
- Loves: **Biryani, Pav Bhaji, street food**. (No color preferences given.)
- Sign-off: creative liberty granted; user asked for a **timeline** chapter and a
  **Moments of Us** photo section (photos to be supplied later).

## Approach (chosen from 3)

**Astro + GSAP ScrollTrigger static scroll-cinema.** Rejected: Next.js + R3F
(too heavy/risky for a phone by tomorrow), single HTML file (unmaintainable for
an 8-scene story + photo pipeline).

## Experience — 8 scenes, one continuous scroll

1. **Arrival** — living canvas starfield + shooting stars; "It's your day,
   Sakshi"; *Begin the story* button (starts optional music, scrolls to Ch. 1).
2. **Where it began** — Pradiba College, two BSc kids; an S-shaped constellation
   draws itself on scroll (SVG stroke scrub).
3. **The Timeline** — glowing vertical thread; milestones ignite on entry:
   met → talks that never ended → trips → storms → today.
4. **Late-night talks** — moonlit scene; chat bubbles type themselves in.
5. **The storms** — rain effect scrubbed away into clear sky; "Disasters came.
   We came out laughing."
6. **So very Sonu** — interactive cards: steaming biryani, pav bhaji, street
   food, an overflowing "talkative meter", curiosity.
7. **Moments of Us** — floating polaroid gallery + lightbox. Auto-detects
   images in `src/assets/moments/` via `import.meta.glob`; elegant "a memory
   belongs here" placeholders until photos are dropped in.
8. **Finale** — CSS cake; tap candles to blow them out → confetti + fireworks →
   heartfelt letter revealed line by line → creative sign-off ("the luckiest
   listener of all your stories") → "make a wish" shooting star.

## Architecture

- `src/content.ts` — every line of copy in one file (user-editable, no code).
- `src/pages/index.astro` — assembles scene components in order.
- `src/components/` — one component per scene + `Starfield` (fixed canvas) +
  `MusicToggle`.
- Scene scripts colocated in components; shared GSAP setup in
  `src/scripts/experience.ts`.
- Fonts self-hosted via Fontsource: Playfair Display (display), Caveat
  (handwritten), Inter Variable (UI/body).
- Libraries: `gsap` (ScrollTrigger), `canvas-confetti`.

## Error handling / fallbacks

- No photos → placeholder frames render; site still feels complete.
- Music file absent or autoplay blocked → toggle hidden / stays muted; silent
  experience is first-class.
- `prefers-reduced-motion` → scrub/pin animations disabled, content static and
  fully readable.
- Mobile-first layout; effects tuned for mid-range phones (capped star counts,
  transform/opacity-only animations).

## Testing / verification

- `npm run build` passes; preview server checked at phone viewport.
- Manual pass: every scene renders, candle/confetti/lightbox interactions work,
  no console errors.

## Delivery

Local preview for the user tonight; deployment (Vercel/Netlify free tier) only
on the user's go-ahead. Photos: user drops files in `src/assets/moments/`.

---

## Redesign addendum (2026-07-12, evening)

User verdict on v1 scroll-cinema: not good, wanted it **lighter and gamified
like his old project** (github.com/gkganesh12/love — pastel scene-based
click-through with mini-game gates). Rebuilt as **"Sonu's Birthday Quest"**:
10 tap-through levels — intro gift → identity quiz → timeline card stack →
balloon-pop facts → polaroid toss (real photos) → connect-the-stars (the one
dark scene) → candle blowing → envelope letter → runaway-No "best friends
forever?" → shimmer finale with wish + replay. Pastel glass design system
(quest.css), vanilla scene engine (quest.ts), GSAP removed, ambient petals /
click sparkles / heart cursor with trail words / pointer-following radial
backgrounds ported from the old site. Verified end-to-end by playing the whole
quest headlessly at phone size.
