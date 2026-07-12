import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import confetti from 'canvas-confetti';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ————————————————— starfield ————————————————— */

function initStarfield() {
  const canvas = document.getElementById('starfield') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;

  type Star = { x: number; y: number; r: number; depth: number; phase: number; speed: number };
  type Meteor = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number };

  let stars: Star[] = [];
  const meteors: Meteor[] = [];

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas!.width = width * dpr;
    canvas!.height = height * dpr;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(170, Math.round((width * height) / 6500));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.3 + 0.35,
      depth: Math.random() * 0.55 + 0.15,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.6 + 0.4,
    }));
  }

  function spawnMeteor(fromX?: number) {
    const x = fromX ?? Math.random() * width * 0.9;
    meteors.push({
      x,
      y: Math.random() * height * 0.35,
      vx: 6 + Math.random() * 5,
      vy: 3.2 + Math.random() * 2.4,
      life: 0,
      maxLife: 46 + Math.random() * 22,
    });
  }

  let nextMeteorAt = 240;
  let frame = 0;
  let running = true;

  function draw() {
    ctx!.clearRect(0, 0, width, height);
    const scroll = window.scrollY;
    const t = frame / 60;

    for (const s of stars) {
      const twinkle = 0.55 + 0.45 * Math.sin(t * s.speed * 2 + s.phase);
      const y = (((s.y - scroll * s.depth * 0.18) % height) + height) % height;
      ctx!.globalAlpha = twinkle * (0.45 + s.depth * 0.8);
      ctx!.fillStyle = s.depth > 0.5 ? '#fff8e7' : '#cfd8ff';
      ctx!.beginPath();
      ctx!.arc(s.x, y, s.r, 0, Math.PI * 2);
      ctx!.fill();
    }

    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.life++;
      m.x += m.vx;
      m.y += m.vy;
      const fade = 1 - m.life / m.maxLife;
      if (fade <= 0 || m.x > width + 80 || m.y > height + 80) {
        meteors.splice(i, 1);
        continue;
      }
      const grad = ctx!.createLinearGradient(m.x, m.y, m.x - m.vx * 9, m.y - m.vy * 9);
      grad.addColorStop(0, `rgba(255, 244, 214, ${0.95 * fade})`);
      grad.addColorStop(1, 'rgba(255, 244, 214, 0)');
      ctx!.strokeStyle = grad;
      ctx!.lineWidth = 1.8;
      ctx!.globalAlpha = 1;
      ctx!.beginPath();
      ctx!.moveTo(m.x, m.y);
      ctx!.lineTo(m.x - m.vx * 9, m.y - m.vy * 9);
      ctx!.stroke();
    }

    ctx!.globalAlpha = 1;
    frame++;
    if (!reduced && frame >= nextMeteorAt) {
      spawnMeteor();
      nextMeteorAt = frame + 240 + Math.random() * 300; // every 4–9s
    }
    if (running) requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    const wasRunning = running;
    running = !document.hidden;
    if (running && !wasRunning) requestAnimationFrame(draw);
  });

  // the finale "make a wish" fires a meteor shower
  window.addEventListener('sonu:wish', () => {
    for (let i = 0; i < 7; i++) {
      setTimeout(() => spawnMeteor(Math.random() * width * 0.7), i * 320);
    }
  });

  resize();
  if (reduced) {
    // static sky: one frame, no loop, no meteors
    running = false;
    frame = 1;
    draw();
  } else {
    requestAnimationFrame(draw);
  }
}

/* ————————————————— shared reveals ————————————————— */

function initReveals() {
  const els = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  if (reduced) return; // leave everything visible and static
  for (const el of els) {
    gsap.from(el, {
      autoAlpha: 0,
      y: 28,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 84%' },
    });
  }
}

function initHero() {
  const els = gsap.utils.toArray<HTMLElement>('[data-hero]');
  if (reduced || els.length === 0) return;
  gsap.from(els, {
    autoAlpha: 0,
    y: 22,
    duration: 1.1,
    ease: 'power2.out',
    stagger: 0.16,
    delay: 0.3,
  });
}

/* ————————————————— chapter mechanics ————————————————— */

function initConstellation() {
  const line = document.querySelector<SVGPolylineElement>('.constellation .line');
  const nodes = gsap.utils.toArray<SVGCircleElement>('.constellation .node');
  if (!line) return;
  const length = line.getTotalLength();
  line.style.strokeDasharray = `${length}`;

  if (reduced) {
    line.style.strokeDashoffset = '0';
    return;
  }

  line.style.strokeDashoffset = `${length}`;
  gsap.to(line, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '.constellation',
      start: 'top 88%',
      end: 'top 30%',
      scrub: 0.6,
    },
  });
  gsap.from(nodes, {
    scale: 0,
    transformOrigin: '50% 50%',
    ease: 'none',
    stagger: 0.06,
    scrollTrigger: {
      trigger: '.constellation',
      start: 'top 88%',
      end: 'top 30%',
      scrub: 0.6,
    },
  });
}

function initTimeline() {
  const thread = document.querySelector<HTMLElement>('.timeline .thread');
  const items = gsap.utils.toArray<HTMLElement>('.timeline li');

  if (reduced) {
    items.forEach((li) => li.classList.add('lit'));
    return;
  }

  if (thread) {
    gsap.fromTo(
      thread,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.timeline',
          start: 'top 78%',
          end: 'bottom 55%',
          scrub: 0.5,
        },
      }
    );
  }

  for (const li of items) {
    ScrollTrigger.create({
      trigger: li,
      start: 'top 74%',
      onEnter: () => li.classList.add('lit'),
    });
    gsap.from(li, {
      autoAlpha: 0,
      x: -18,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: { trigger: li, start: 'top 84%' },
    });
  }
}

function initTalks() {
  const bubbles = gsap.utils.toArray<HTMLElement>('.bubble');

  if (reduced) {
    bubbles.forEach((b) => {
      b.classList.add('said');
      b.style.visibility = 'visible';
    });
    return;
  }

  bubbles.forEach((bubble, i) => {
    ScrollTrigger.create({
      trigger: bubble,
      start: 'top 88%',
      onEnter: () => {
        const tl = gsap.timeline({ delay: i * 0.35 });
        tl.set(bubble, { visibility: 'visible' })
          .from(bubble, { autoAlpha: 0, y: 14, scale: 0.9, duration: 0.4, ease: 'back.out(1.6)' })
          .add(() => bubble.classList.add('said'), '+=0.9')
          .from(bubble.querySelector('.msg'), { autoAlpha: 0, duration: 0.25 });
      },
      once: true,
    });
  });
}

function initStorm() {
  const section = document.getElementById('storms');
  const rain = document.querySelector<HTMLElement>('#storms .rain');
  const bg = document.querySelector<HTMLElement>('#storms .storm-bg');
  const before = document.querySelector<HTMLElement>('#storms .storm-line.before');
  const after = document.querySelector<HTMLElement>('#storms .storm-line.after');
  const small = document.querySelector<HTMLElement>('#storms [data-storm-small]');
  if (!section || !rain || !bg || !before || !after || !small) return;

  if (reduced) return; // everything stays visible and static — CSS already killed the animation

  gsap.set(after, { autoAlpha: 0, y: 16 });
  gsap.set(small, { autoAlpha: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=130%',
      scrub: 0.6,
      pin: true,
    },
  });

  tl.from(before, { autoAlpha: 0, y: 16, duration: 0.18 })
    .to(before, { autoAlpha: 0.25, duration: 0.25 }, 0.45)
    .to(rain, { opacity: 0, duration: 0.35 }, 0.45)
    .to(bg, { opacity: 0, duration: 0.4 }, 0.5)
    .to(after, { autoAlpha: 1, y: 0, duration: 0.3 }, 0.62)
    .to(small, { autoAlpha: 1, duration: 0.2 }, 0.82);
}

function initCards() {
  const cards = gsap.utils.toArray<HTMLButtonElement>('.card');

  for (const card of cards) {
    card.addEventListener('click', () => card.classList.toggle('flipped'));
  }

  const fill = document.querySelector<HTMLElement>('.meter .fill');
  if (fill) {
    if (reduced) {
      fill.style.width = '100%';
    } else {
      gsap.to(fill, {
        width: '100%',
        duration: 1.8,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: '.meter', start: 'top 85%' },
      });
    }
  }

  if (!reduced) {
    gsap.from(cards, {
      autoAlpha: 0,
      y: 30,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.08,
      scrollTrigger: { trigger: '.cards', start: 'top 82%' },
    });
  }
}

function initLightbox() {
  const dialog = document.getElementById('lightbox') as HTMLDialogElement | null;
  if (!dialog) return;
  const img = dialog.querySelector('img')!;
  const caption = dialog.querySelector<HTMLElement>('.lb-caption')!;

  document.querySelectorAll<HTMLButtonElement>('.polaroid:not(.placeholder)').forEach((p) => {
    p.addEventListener('click', () => {
      const source = p.querySelector('img');
      if (!source) return;
      img.src = source.currentSrc || source.src;
      img.alt = source.alt;
      caption.textContent = p.dataset.caption ?? '';
      dialog.showModal();
    });
  });

  dialog.querySelector('.lb-close')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
}

/* ————————————————— finale ————————————————— */

function celebrate() {
  const colors = ['#f5c76b', '#b9a7e8', '#e8a7c3', '#fff8e7'];
  const fire = (opts: confetti.Options) =>
    confetti({ colors, disableForReducedMotion: true, zIndex: 90, ...opts });

  fire({ particleCount: 90, spread: 75, origin: { y: 0.7 }, scalar: 1.05 });
  setTimeout(() => fire({ particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.75 } }), 250);
  setTimeout(() => fire({ particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.75 } }), 450);
  setTimeout(
    () =>
      fire({
        particleCount: 36,
        spread: 100,
        shapes: ['star'],
        scalar: 1.3,
        gravity: 0.7,
        origin: { y: 0.55 },
      }),
    750
  );
}

function initCake() {
  const candles = Array.from(document.querySelectorAll<HTMLButtonElement>('.candle'));
  const hint = document.querySelector<HTMLElement>('[data-cake-hint]');
  if (candles.length === 0) return;
  let out = 0;
  let done = false;

  for (const candle of candles) {
    candle.addEventListener('click', () => {
      if (candle.classList.contains('out') || done) return;
      candle.classList.add('out');
      out++;
      if (out === candles.length) {
        done = true;
        celebrate();
        if (hint) hint.textContent = hint.dataset.done ?? 'candles out! ✨';
      }
    });
  }
}

function initWish() {
  const btn = document.getElementById('wish') as HTMLButtonElement | null;
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('sonu:wish'));
    confetti({
      particleCount: 40,
      spread: 90,
      shapes: ['star'],
      scalar: 1.2,
      colors: ['#f5c76b', '#fff8e7'],
      disableForReducedMotion: true,
      zIndex: 90,
      origin: { y: 0.6 },
    });
    btn.textContent = btn.dataset.doneLabel ?? btn.textContent;
    gsap.fromTo(btn, { scale: 0.94 }, { scale: 1, duration: 0.5, ease: 'back.out(2)' });
  });
}

/* ————————————————— music ————————————————— */

const MUSIC_SRC = '/audio/ambient.mp3';
let audio: HTMLAudioElement | null = null;

function fadeTo(volume: number, onDone?: () => void) {
  if (!audio) return;
  gsap.to(audio, { volume, duration: 1.4, ease: 'power1.inOut', onComplete: onDone });
}

function tryPlayMusic() {
  const toggle = document.getElementById('music-toggle');
  if (!toggle || !toggle.classList.contains('available')) return;
  if (!audio) {
    audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.volume = 0;
  }
  audio
    .play()
    .then(() => {
      fadeTo(0.32);
      toggle.classList.add('playing');
    })
    .catch(() => {
      /* autoplay blocked — the toggle still works on tap */
    });
}

function initMusic() {
  const toggle = document.getElementById('music-toggle');
  if (!toggle) return;

  // only surface the toggle if the track actually shipped
  fetch(MUSIC_SRC, { method: 'HEAD' })
    .then((res) => {
      const type = res.headers.get('content-type') ?? '';
      if (res.ok && type.includes('audio')) toggle.classList.add('available');
    })
    .catch(() => {});

  toggle.addEventListener('click', () => {
    if (!audio || audio.paused) {
      tryPlayMusic();
    } else {
      fadeTo(0, () => audio?.pause());
      toggle.classList.remove('playing');
    }
  });
}

/* ————————————————— begin ————————————————— */

function initBegin() {
  const btn = document.getElementById('begin');
  btn?.addEventListener('click', () => {
    tryPlayMusic();
    document.getElementById('beginning')?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
    });
  });
}

/* ————————————————— go ————————————————— */

initStarfield();
initHero();
initReveals();
initConstellation();
initTimeline();
initTalks();
initStorm();
initCards();
initLightbox();
initCake();
initWish();
initMusic();
initBegin();
