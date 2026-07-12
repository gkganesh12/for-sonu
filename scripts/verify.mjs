// Visual verification: walks every scene at phone size, exercises interactions,
// saves screenshots to /tmp/sonu-verify/. Run: node scripts/verify.mjs
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const OUT = '/tmp/sonu-verify';
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
});

const page = await browser.newPage();
await page.setViewport({ width: 402, height: 874, deviceScaleFactor: 2 });

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`);
});

await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle0' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await sleep(2200);

const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` });

// 1 — arrival (hero entrance should have finished)
await shot('01-arrival');

// helper: slow-scroll to a section so ScrollTriggers fire naturally
async function scrollToSection(id) {
  await page.evaluate(async (sel) => {
    const target = document.querySelector(sel);
    const y = target.getBoundingClientRect().top + window.scrollY;
    const steps = 30;
    const from = window.scrollY;
    for (let i = 1; i <= steps; i++) {
      window.scrollTo(0, from + ((y - from) * i) / steps);
      await new Promise((r) => setTimeout(r, 40));
    }
  }, id);
  await sleep(1400);
}

await scrollToSection('#beginning');
await shot('02-beginning');

await scrollToSection('#timeline');
await sleep(400);
await shot('03-timeline-top');
await page.evaluate(() => window.scrollBy({ top: 700, behavior: 'smooth' }));
await sleep(1300);
await shot('04-timeline-more');

await scrollToSection('#talks');
await sleep(3200); // let bubbles type themselves
await shot('05-talks');

await scrollToSection('#storms');
await sleep(600);
await shot('06-storms-raining');
// scrub through the pinned storm
await page.evaluate(async () => {
  for (let i = 0; i < 40; i++) {
    window.scrollBy(0, 42);
    await new Promise((r) => setTimeout(r, 45));
  }
});
await sleep(900);
await shot('07-storms-cleared');

await scrollToSection('#so-sonu');
await sleep(900);
await shot('08-cards');
await page.click('#so-sonu .card:nth-child(1)');
await sleep(900);
await shot('09-card-flipped');

await scrollToSection('#moments');
await sleep(800);
await shot('10-moments');
// open + close the lightbox if real photos are present
const hasPhotos = await page.$('.polaroid:not(.placeholder)');
if (hasPhotos) {
  await hasPhotos.click();
  await sleep(700);
  await shot('10b-lightbox');
  await page.click('#lightbox .lb-close');
  await sleep(400);
}

await scrollToSection('#finale');
await sleep(900);
await shot('11-finale-cake');
// blow out all five candles
for (let i = 1; i <= 5; i++) {
  await page.click(`.candles .candle:nth-child(${i})`);
  await sleep(220);
}
await sleep(1400);
await shot('12-candles-out-confetti');

await page.evaluate(() => document.querySelector('.big-wish').scrollIntoView({ behavior: 'smooth' }));
await sleep(1600);
await shot('13-big-wish');
await page.click('#wish');
await sleep(1200);
await shot('14-wish-made');

console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'no console/page errors');
await browser.close();
