// Plays the whole birthday quest at phone size, screenshotting every level.
// Run: npm run preview -- --host  (in another shell)  then: node scripts/verify.mjs
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
page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` });
const nextViaUnlock = async () => {
  await page.waitForSelector('#unlock-btn:not(.locked)', { timeout: 8000 });
  await page.click('#unlock-btn');
  await sleep(1400);
};

await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle0' });
await sleep(1500);

// 0 · intro
await shot('01-intro');
await page.click('[data-action="next"]');
await sleep(1500);

// 1 · quiz — answer the 3 questions correctly (with one wrong answer for the toast)
await shot('02-quiz');
await page.click('.quiz-opt:not([data-correct])'); // wrong on purpose
await sleep(700);
await shot('03-quiz-wrong-toast');
for (let i = 0; i < 3; i++) {
  await page.waitForSelector('.quiz-opt[data-correct]', { timeout: 5000 });
  await page.click('.quiz-opt[data-correct]');
  await sleep(1000);
}
await sleep(1800); // auto-advance to timeline

// 2 · timeline — tap through all six cards
await shot('04-timeline');
for (let i = 0; i < 6; i++) {
  const card = await page.$('.tcard:not(.gone)');
  if (card) await card.click();
  await sleep(500);
}
await shot('05-timeline-done');
await nextViaUnlock();

// 3 · balloons — pop all six
await shot('06-balloons');
for (const b of await page.$$('.balloon')) {
  await b.click();
  await sleep(320);
}
await sleep(600);
await shot('07-balloons-done');
await nextViaUnlock();

// 4 · polaroids — toss four
await shot('08-polaroids');
for (let i = 0; i < 4; i++) {
  await page.click('.polaroid-stack');
  await sleep(500);
}
await shot('09-polaroids-tossed');
await nextViaUnlock();

// 5 · starry night — sweep the pointer to connect stars
await sleep(600);
await shot('10-starry');
for (let ry = 0.15; ry <= 0.85; ry += 0.14) {
  await page.mouse.move(30, 874 * ry);
  await page.mouse.move(372, 874 * ry, { steps: 22 });
}
await sleep(700);
await shot('11-starry-connected');
await nextViaUnlock();

// 6 · cake — blow out the candles
await shot('12-cake');
for (const c of await page.$$('.candle')) {
  await c.click();
  await sleep(220);
}
await sleep(1200);
await shot('13-cake-out');
await nextViaUnlock();

// 7 · envelope letter
await shot('14-envelope');
await page.click('.envelope-wrapper');
await sleep(1500);
await shot('15-letter-open');
await nextViaUnlock();

// 8 · the question — poke the No button once, then say yes
await shot('16-question');
const no = await page.$('[data-action="no"]');
if (no) {
  const box = await no.boundingBox();
  if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await sleep(600);
  await shot('17-no-ran-away');
}
await page.click('[data-action="yes"]');
await sleep(2600);

// 9 · finale
await shot('18-finale');
await page.click('[data-action="wish"]');
await sleep(1100);
await shot('19-wish');

console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'no console/page errors');
await browser.close();
