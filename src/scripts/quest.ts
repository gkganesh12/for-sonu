import confetti from 'canvas-confetti';
import {
  intro,
  quiz,
  timeline,
  balloons,
  gallery,
  starry,
  cake,
  letter,
  question,
  finale,
} from '../content';

type Photo = { src: string; caption: string };

const photos: Photo[] = JSON.parse(document.getElementById('photo-data')!.textContent ?? '[]');

const app = document.getElementById('scene-container')!;
const bgBack = document.getElementById('bg-back')!;
const bgFront = document.getElementById('bg-front')!;
const levelChip = document.getElementById('level-chip')!;

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = {
  scene: 0,
  transitioning: false,
  quizIndex: 0,
  popped: 0,
  tossed: 0,
  starsConnected: 0,
  candlesOut: 0,
  noCount: 0,
  lastRunAway: 0,
  mouse: { x: innerWidth / 2, y: innerHeight / 2 },
};

const pastel = (color: string) => `radial-gradient(circle at center, ${color} 0%, var(--bg-white) 100%)`;

const backgrounds = [
  pastel('var(--bg-pink)'),
  pastel('var(--bg-sky)'),
  pastel('var(--bg-lavender)'),
  pastel('var(--bg-mint)'),
  pastel('var(--bg-peach)'),
  'var(--bg-midnight)',
  pastel('var(--bg-butter)'),
  pastel('var(--bg-pink)'),
  pastel('var(--bg-lavender)'),
  'radial-gradient(circle at center, #f8bbd0 0%, var(--bg-pink) 100%)',
];

const CONFETTI_COLORS = ['#f06292', '#b085d6', '#e8b64c', '#8fd3b6', '#ffffff'];

const pop = (opts: confetti.Options = {}) =>
  confetti({ colors: CONFETTI_COLORS, disableForReducedMotion: true, zIndex: 95, ...opts });

/* ————————————————— scenes ————————————————— */

const scenes: Array<() => string> = [
  // 0 · intro
  () => `
    <p class="eyebrow">${intro.eyebrow}</p>
    <h1 class="intro-title">${intro.title}</h1>
    <div class="gift">🎁</div>
    <p class="sub">${intro.sub}</p>
    <button class="btn" data-action="next">${intro.button}</button>
  `,

  // 1 · quiz
  () => {
    state.quizIndex = 0;
    return `
      <h1>${quiz.heading}</h1>
      <p class="sub">${quiz.sub}</p>
      <div class="card-glass" id="quiz-card">${quizCard()}</div>
      <div class="quiz-progress">${quiz.questions.map(() => '<i></i>').join('')}</div>
    `;
  },

  // 2 · timeline cards
  () => {
    return `
      <h1>${timeline.heading}</h1>
      <p class="sub">${timeline.sub}</p>
      <div class="tcard-stage">
        ${timeline.milestones
          .map(
            (m, i) => `
          <div class="tcard" data-action="tcard" style="z-index:${timeline.milestones.length - i}">
            <span class="emoji">${m.emoji}</span>
            <span class="when">${m.when}</span>
            <h3>${m.label}</h3>
            <p>${m.text}</p>
            <span class="tap-hint">tap · ${i + 1}/${timeline.milestones.length}</span>
          </div>`
          )
          .join('')}
      </div>
      <button class="btn locked" id="unlock-btn" data-action="next">continue →</button>
    `;
  },

  // 3 · balloons
  () => {
    state.popped = 0;
    const spots = [
      { top: '4%', left: '6%', c: '#f06292', d: '0s' },
      { top: '10%', left: '64%', c: '#b085d6', d: '0.5s' },
      { top: '38%', left: '32%', c: '#e8b64c', d: '1s' },
      { top: '44%', left: '74%', c: '#8fd3b6', d: '0.2s' },
      { top: '66%', left: '10%', c: '#f2a1b8', d: '0.8s' },
      { top: '70%', left: '52%', c: '#7fb8e6', d: '1.3s' },
    ];
    return `
      <h1>${balloons.heading}</h1>
      <p class="sub">${balloons.sub}</p>
      <div class="balloon-field">
        ${spots
          .map(
            (s, i) => `
          <button class="balloon" data-action="balloon" data-fact="${i}"
            style="top:${s.top}; left:${s.left}; --b-color:${s.c}; --b-delay:${s.d}"
            aria-label="Pop balloon ${i + 1}"></button>`
          )
          .join('')}
      </div>
      <div class="fact-list" id="fact-list"></div>
      <button class="btn locked" id="unlock-btn" data-action="next">continue →</button>
    `;
  },

  // 4 · polaroid toss
  () => {
    state.tossed = 0;
    return `
      <h1>${gallery.heading}</h1>
      <p class="sub">${gallery.sub}</p>
      <div class="polaroid-stack">
        ${photos
          .map(
            (p, i) => `
          <div class="polaroid" data-action="toss"
            style="z-index:${photos.length - i}; transform: rotate(${(((i * 47) % 15) - 7)}deg)">
            <img src="${p.src}" alt="${p.caption}" loading="${i < 2 ? 'eager' : 'lazy'}" />
            <div class="caption">${p.caption}</div>
          </div>`
          )
          .join('')}
      </div>
      <button class="btn locked" id="unlock-btn" data-action="next">continue →</button>
    `;
  },

  // 5 · starry night
  () => {
    state.starsConnected = 0;
    setTimeout(initStarry, 80);
    return `
      <canvas id="constellation-canvas"></canvas>
      <h1>${starry.heading}</h1>
      <p class="sub">${starry.sub}</p>
      <p class="star-count" id="star-count"></p>
      <button class="btn ghost locked" id="unlock-btn" data-action="next">${starry.button}</button>
    `;
  },

  // 6 · cake
  () => {
    state.candlesOut = 0;
    return `
      <h1>${cake.heading}</h1>
      <p class="sub" id="cake-sub">${cake.sub}</p>
      <div class="cake-stage">
        <div class="cake" role="group" aria-label="Birthday cake with five candles">
          <div class="candles">
            ${[1, 2, 3, 4, 5]
              .map(
                (n) => `
              <button class="candle" data-action="candle" aria-label="Blow out candle ${n}">
                <span class="flame"></span><span class="smoke"></span><span class="stick"></span>
              </button>`
              )
              .join('')}
          </div>
          <div class="tier top"><span class="sprinkles"></span></div>
          <div class="tier bottom"><span class="sprinkles"></span></div>
          <div class="plate"></div>
        </div>
      </div>
      <button class="btn locked" id="unlock-btn" data-action="next">continue →</button>
    `;
  },

  // 7 · envelope letter
  () => `
    <h1>${letter.heading}</h1>
    <p class="sub">${letter.sub}</p>
    <div class="envelope-wrapper" data-action="envelope">
      <div class="envelope-back"></div>
      <div class="letter-card">
        <div class="stamp">🎂</div>
        ${letter.lines.map((l) => `<p>${l}</p>`).join('')}
        <p class="signoff">${letter.signoff}</p>
      </div>
      <div class="envelope-front"></div>
      <div class="flap"></div>
    </div>
    <button class="btn locked" id="unlock-btn" data-action="next">continue →</button>
  `,

  // 8 · the question
  () => {
    state.noCount = 0;
    return `
      <h1>${question.heading}</h1>
      <p class="sub" style="font-size: clamp(1.5rem, 6vw, 2rem); color: var(--ink);">${question.q}</p>
      <div class="btn-row">
        <button class="btn" data-action="yes">${question.yes}</button>
        <button class="no-btn" data-action="no">${question.no}</button>
      </div>
    `;
  },

  // 9 · finale
  () => `
    <h1 class="finale-title">${finale.title}</h1>
    <p class="sub">${finale.sub}</p>
    <div class="btn-row">
      <button class="btn" data-action="wish" data-done="${finale.wishDone}">${finale.wishButton}</button>
      <button class="btn ghost" data-action="replay">${finale.replay}</button>
    </div>
    <div class="footer-note">
      ${finale.footer}
      <small>${finale.musicCredit}</small>
    </div>
  `,
];

function quizCard(): string {
  const q = quiz.questions[state.quizIndex];
  // shuffle deterministically enough: rotate options by question index
  const opts = q.options.map((o, i) => ({ o, i }));
  return `
    <p class="quiz-q">${q.q}</p>
    <div class="quiz-options">
      ${opts
        .map(
          ({ o, i }) => `
        <button class="quiz-opt" data-action="quiz" data-i="${i}" ${'correct' in o && o.correct ? 'data-correct="1"' : ''}>
          ${o.text}
        </button>`
        )
        .join('')}
    </div>
  `;
}

/* ————————————————— engine ————————————————— */

function renderScene() {
  const current = app.querySelector('.scene');
  const build = () => {
    bgBack.style.background = bgFront.style.background || backgrounds[0];
    bgBack.style.opacity = '1';
    bgFront.style.background = backgrounds[state.scene];
    bgFront.style.opacity = '0';
    requestAnimationFrame(() => (bgFront.style.opacity = '1'));

    const scene = document.createElement('div');
    scene.className = 'scene' + (state.scene === 5 ? ' dark' : '');
    scene.innerHTML = scenes[state.scene]();
    app.innerHTML = '';
    app.appendChild(scene);
    requestAnimationFrame(() => requestAnimationFrame(() => scene.classList.add('active')));

    levelChip.textContent =
      state.scene === 0
        ? 'for sonu ✨'
        : state.scene === scenes.length - 1
          ? 'you made it 🎉'
          : `level ${state.scene} / ${scenes.length - 2}`;

    state.transitioning = false;
  };

  if (current) {
    current.classList.remove('active');
    current.classList.add('exit');
    setTimeout(build, 480);
  } else {
    build();
  }
}

function nextScene() {
  if (state.transitioning || state.scene >= scenes.length - 1) return;
  state.transitioning = true;
  state.scene++;
  renderScene();
}

function unlock() {
  const btn = document.getElementById('unlock-btn');
  if (btn) {
    btn.classList.remove('locked');
    btn.classList.add('pulse');
  }
}

function toast(msg: string) {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2300);
}

/* ————————————————— interactions ————————————————— */

document.addEventListener('click', (e) => {
  const target = (e.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!target) return;
  const action = target.dataset.action!;

  if (action === 'next') nextScene();

  if (action === 'quiz') {
    if (target.dataset.correct) {
      target.classList.add('right');
      const dots = document.querySelectorAll('.quiz-progress i');
      dots[state.quizIndex]?.classList.add('done');
      state.quizIndex++;
      if (state.quizIndex >= quiz.questions.length) {
        toast(quiz.done);
        pop({ particleCount: 60, spread: 70, origin: { y: 0.65 } });
        setTimeout(nextScene, 1300);
      } else {
        setTimeout(() => {
          const card = document.getElementById('quiz-card');
          if (card) card.innerHTML = quizCard();
        }, 650);
      }
    } else {
      target.classList.remove('wrong');
      void target.offsetWidth; // restart shake
      target.classList.add('wrong');
      const q = quiz.questions[state.quizIndex];
      const opt = q.options[Number(target.dataset.i)];
      if (opt && 'reaction' in opt && opt.reaction) toast(opt.reaction);
    }
  }

  if (action === 'tcard') {
    target.classList.add('gone');
    const left = document.querySelectorAll('.tcard:not(.gone)').length;
    if (left === 0) {
      toast(timeline.done);
      unlock();
    }
  }

  if (action === 'balloon') {
    if (target.classList.contains('popped')) return;
    target.classList.add('popped');
    sparkleBurst(e.clientX, e.clientY);
    const fact = balloons.facts[Number(target.dataset.fact)];
    const list = document.getElementById('fact-list');
    if (list && fact) {
      const chip = document.createElement('div');
      chip.className = 'fact-chip';
      chip.textContent = fact;
      list.appendChild(chip);
    }
    state.popped++;
    if (state.popped >= balloons.facts.length) {
      toast(balloons.done);
      pop({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      unlock();
    }
  }

  if (action === 'toss') {
    const x = (Math.random() - 0.5) * innerWidth * 1.4;
    const y = (Math.random() - 0.5) * innerHeight * 1.4;
    const rot = (Math.random() - 0.5) * 120;
    target.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
    target.style.opacity = '0';
    target.style.pointerEvents = 'none';
    state.tossed++;
    if (state.tossed >= Math.min(4, photos.length)) {
      toast(gallery.done);
      unlock();
    }
  }

  if (action === 'candle') {
    if (target.classList.contains('out')) return;
    target.classList.add('out');
    state.candlesOut++;
    if (state.candlesOut === 5) {
      const sub = document.getElementById('cake-sub');
      if (sub) sub.textContent = cake.done;
      celebrate();
      unlock();
    }
  }

  if (action === 'envelope') {
    const wrapper = target.closest('.envelope-wrapper') ?? target;
    if (!wrapper.classList.contains('open')) {
      wrapper.classList.add('open');
      setTimeout(unlock, 1100);
    } else {
      wrapper.classList.remove('open');
    }
  }

  if (action === 'yes') sayYes();

  if (action === 'wish') {
    pop({ particleCount: 45, spread: 100, shapes: ['star'], scalar: 1.25, origin: { y: 0.55 } });
    pop({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    target.textContent = target.dataset.done ?? target.textContent;
  }

  if (action === 'replay') {
    state.scene = -1;
    nextScene();
  }
});

/* runaway No button — the classic */
function runAway(el: HTMLElement) {
  const now = Date.now();
  if (now - state.lastRunAway < 100) return;
  state.lastRunAway = now;

  if (el.style.position !== 'fixed') {
    document.body.appendChild(el);
    el.style.position = 'fixed';
    el.style.zIndex = '9999';
  }
  state.noCount++;

  const padX = innerWidth * 0.15;
  const padY = innerHeight * 0.15;
  el.style.left = `${padX + Math.random() * (innerWidth - padX * 2 - 120)}px`;
  el.style.top = `${padY + Math.random() * (innerHeight - padY * 2 - 60)}px`;
  el.style.transform = `rotate(${(Math.random() - 0.5) * 30}deg)`;

  if (state.noCount > 4) {
    const i = Math.min(state.noCount - 5, question.begging.length - 1);
    el.innerText = question.begging[i];
  }

  if (state.noCount > 22) {
    el.innerText = question.surrender;
    el.style.background = 'var(--accent)';
    el.style.color = '#fff';
    el.style.border = 'none';
    el.style.left = '50%';
    el.style.top = '68%';
    el.style.transform = 'translate(-50%, -50%) scale(1.2)';
    el.dataset.action = 'yes';
  }
}

document.addEventListener('pointerover', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-action="no"]');
  if (el) runAway(el);
});

document.addEventListener('touchstart', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-action="no"]');
  if (el) runAway(el);
}, { passive: true });

function sayYes() {
  document.querySelector<HTMLElement>('[data-action="no"]')?.remove();
  heartsExplosion();
  setTimeout(nextScene, 1900);
}

/* ————————————————— effects ————————————————— */

function sparkleBurst(x: number, y: number) {
  for (let i = 0; i < 8; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    const angle = (i / 8) * Math.PI * 2;
    s.animate(
      [
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${Math.cos(angle) * 55}px, ${Math.sin(angle) * 55}px) scale(0)`, opacity: 0 },
      ],
      { duration: 550 + Math.random() * 350, easing: 'cubic-bezier(0,0,.2,1)' }
    );
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 950);
  }
}

function celebrate() {
  pop({ particleCount: 90, spread: 75, origin: { y: 0.7 } });
  setTimeout(() => pop({ particleCount: 45, angle: 60, spread: 60, origin: { x: 0, y: 0.75 } }), 250);
  setTimeout(() => pop({ particleCount: 45, angle: 120, spread: 60, origin: { x: 1, y: 0.75 } }), 450);
}

function heartsExplosion() {
  if (reduced) return;
  const emojis = ['❤️', '💖', '💝', '💕', '🎂', '✨'];
  for (let i = 0; i < 90; i++) {
    setTimeout(() => {
      const h = document.createElement('div');
      h.className = 'heart';
      h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      h.style.left = `${Math.random() * 100}vw`;
      h.style.fontSize = `${Math.random() * 1.4 + 1}rem`;
      h.style.animationDuration = `${Math.random() * 2 + 2}s`;
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 4200);
    }, i * 45);
  }
}

/* petals drifting down, always (except the dark scene) */
function startPetals() {
  if (reduced) return;
  const emojis = ['🎈', '✨', '🌸', '🫧', '💛', '🎀'];
  setInterval(() => {
    if (state.scene === 5 || document.hidden) return;
    const p = document.createElement('div');
    p.className = 'petal';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left = `${Math.random() * 100}vw`;
    p.style.fontSize = `${Math.random() * 0.9 + 0.6}rem`;
    p.style.opacity = `${Math.random() * 0.5 + 0.35}`;
    p.style.animationDuration = `${Math.random() * 5 + 6}s`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 11500);
  }, 450);
}

/* cursor heart + trail (desktop only) + click sparkles + bg glow follow */
function startPointerMagic() {
  const fine = window.matchMedia('(pointer: fine)').matches;
  let cursor: HTMLElement | null = null;
  if (fine) {
    cursor = document.createElement('div');
    cursor.className = 'cursor-heart';
    cursor.textContent = '🩷';
    document.body.appendChild(cursor);
  }

  const words = ['Sonu', '✨', 'bestie', '🎂', 'forever', '💛', 'birthday girl'];
  let lastWord = 0;

  const update = (x: number, y: number) => {
    state.mouse.x = x;
    state.mouse.y = y;
    if (cursor) {
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
    }
    if (fine && !reduced && Date.now() - lastWord > 200 && state.scene !== 5) {
      lastWord = Date.now();
      const w = document.createElement('div');
      w.className = 'trail-word';
      w.textContent = words[Math.floor(Math.random() * words.length)];
      w.style.left = `${x}px`;
      w.style.top = `${y}px`;
      document.body.appendChild(w);
      setTimeout(() => w.remove(), 1900);
    }
    if (state.scene !== 5) {
      bgFront.style.background = backgrounds[state.scene].replace(
        'center',
        `${(x / innerWidth) * 100}% ${(y / innerHeight) * 100}%`
      );
    }
  };

  document.addEventListener('mousemove', (e) => update(e.clientX, e.clientY));
  document.addEventListener(
    'touchmove',
    (e) => e.touches[0] && update(e.touches[0].clientX, e.touches[0].clientY),
    { passive: true }
  );
  document.addEventListener('pointerdown', (e) => sparkleBurst(e.clientX, e.clientY));
}

/* starry night mini-game */
function initStarry() {
  const canvas = document.getElementById('constellation-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d')!;
  const NEEDED = 25;

  const resize = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  };
  window.addEventListener('resize', resize);
  resize();

  type Star = { px: number; py: number; size: number; connected?: boolean };
  const stars: Star[] = Array.from({ length: 90 }, () => ({
    px: Math.random(),
    py: Math.random(),
    size: Math.random() * 2 + 1,
  }));

  const counter = document.getElementById('star-count');

  function draw() {
    if (state.scene !== 5) return;
    ctx.clearRect(0, 0, canvas!.width, canvas!.height);
    ctx.strokeStyle = 'rgba(232, 182, 76, 0.35)';
    ctx.lineWidth = 1.5;

    for (const star of stars) {
      const sx = star.px * canvas!.width;
      const sy = star.py * canvas!.height;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(sx, sy, star.size / 2 + 0.6, 0, Math.PI * 2);
      ctx.fill();

      const dist = Math.hypot(sx - state.mouse.x, sy - state.mouse.y);
      if (dist < 140) {
        if (!star.connected) {
          star.connected = true;
          state.starsConnected++;
        }
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(state.mouse.x, state.mouse.y);
        ctx.stroke();
      }
    }

    if (counter) {
      counter.textContent =
        state.starsConnected >= NEEDED
          ? 'the sky is officially yours ✨'
          : `${state.starsConnected} / ${NEEDED} stars connected`;
    }

    if (state.starsConnected >= NEEDED) unlock();
    requestAnimationFrame(draw);
  }

  if (reduced) {
    // no chase required — hand over the sky
    state.starsConnected = NEEDED;
    unlock();
    if (counter) counter.textContent = 'the sky is officially yours ✨';
    return;
  }
  draw();
}

/* ————————————————— music ————————————————— */

const MUSIC_SRC = '/audio/ambient.mp3';
let audio: HTMLAudioElement | null = null;

function fadeTo(vol: number, then?: () => void) {
  if (!audio) return;
  const from = audio.volume;
  const start = performance.now();
  const step = (t: number) => {
    const k = Math.min(1, (t - start) / 1200);
    audio!.volume = from + (vol - from) * k;
    if (k < 1) requestAnimationFrame(step);
    else then?.();
  };
  requestAnimationFrame(step);
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
      fadeTo(0.3);
      toggle.classList.add('playing');
    })
    .catch(() => {});
}

function initMusic() {
  const toggle = document.getElementById('music-toggle');
  if (!toggle) return;
  fetch(MUSIC_SRC, { method: 'HEAD' })
    .then((res) => {
      if (res.ok && (res.headers.get('content-type') ?? '').includes('audio'))
        toggle.classList.add('available');
    })
    .catch(() => {});
  toggle.addEventListener('click', () => {
    if (!audio || audio.paused) tryPlayMusic();
    else {
      fadeTo(0, () => audio?.pause());
      toggle.classList.remove('playing');
    }
  });
  // first tap into the experience also starts the music
  document.addEventListener(
    'click',
    (e) => {
      if ((e.target as HTMLElement).closest('[data-action="next"]')) tryPlayMusic();
    },
    { once: true }
  );
}

/* ————————————————— go ————————————————— */

startPetals();
startPointerMagic();
initMusic();
renderScene();
