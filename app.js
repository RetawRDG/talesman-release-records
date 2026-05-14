document.documentElement.classList.remove('no-js');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

window.addEventListener('load', () => {
  const preloader = document.querySelector('.preloader');
  if (!preloader) return;
  setTimeout(() => preloader.classList.add('is-hidden'), prefersReducedMotion ? 0 : 650);
});

const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const header = document.querySelector('[data-header]');
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  if (!header) return;
  const y = window.scrollY;
  header.style.transform = y > 120 && y > lastScrollY ? 'translateX(-50%) translateY(-120%)' : 'translateX(-50%) translateY(0)';
  lastScrollY = y;
}, { passive: true });

if (!prefersReducedMotion) {
  const cursor = document.querySelector('.cursor');
  if (cursor) {
    window.addEventListener('mousemove', (event) => {
      cursor.classList.add('is-visible');
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    });
    document.querySelectorAll('a, button, .work-card, .service-card').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
    });
  }

  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('mousemove', (event) => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.14}px, ${y * 0.18}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = 'translate(0, 0)'; });
  });

  const parallax = document.querySelector('[data-parallax]');
  if (parallax) {
    window.addEventListener('mousemove', (event) => {
      const x = (event.clientX / window.innerWidth - .5) * 18;
      const y = (event.clientY / window.innerHeight - .5) * 18;
      parallax.style.transform = `rotateX(${-y * 0.22}deg) rotateY(${x * 0.22}deg)`;
    });
  }
}

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !prefersReducedMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.13 });
  revealElements.forEach((el) => observer.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add('is-visible'));
}

function drawWaveform(canvas, mode = 'after') {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(320, Math.floor(rect.width * dpr));
  canvas.height = Math.floor(120 * dpr);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const bars = 72;
  const gap = 4 * dpr;
  const barWidth = (canvas.width - gap * (bars - 1)) / bars;
  const mid = canvas.height / 2;
  const palette = mode === 'before'
    ? ['rgba(169,161,185,.34)', 'rgba(169,161,185,.74)']
    : mode === 'master'
      ? ['rgba(200,255,53,.62)', 'rgba(255,43,79,.96)']
      : ['rgba(141,77,255,.62)', 'rgba(255,43,79,.9)'];
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, palette[0]);
  gradient.addColorStop(1, palette[1]);
  ctx.fillStyle = gradient;

  for (let i = 0; i < bars; i += 1) {
    const seed = Math.sin(i * 1.7 + mode.length * 2.2) * Math.cos(i * .42);
    const clean = mode === 'before' ? 0.36 : mode === 'master' ? 0.92 : 0.72;
    const height = (18 + Math.abs(seed) * 82 * clean + (i % 7) * 2) * dpr;
    const x = i * (barWidth + gap);
    const y = mid - height / 2;
    roundRect(ctx, x, y, barWidth, height, 999 * dpr);
    ctx.fill();
  }
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

const canvases = document.querySelectorAll('.waveform');
function redrawAllWaveforms() {
  canvases.forEach((canvas) => drawWaveform(canvas, canvas.dataset.mode || 'after'));
}
window.addEventListener('resize', redrawAllWaveforms);
redrawAllWaveforms();

document.querySelectorAll('.work-card').forEach((card) => {
  const canvas = card.querySelector('.waveform');
  const buttons = card.querySelectorAll('[data-mode]');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((btn) => btn.classList.remove('is-active'));
      button.classList.add('is-active');
      const mode = button.dataset.mode;
      canvas.dataset.mode = mode;
      drawWaveform(canvas, mode);
    });
  });
});

const calc = document.querySelector('[data-calculator]');
if (calc) {
  const totalNode = calc.querySelector('[data-total]');
  const link = calc.querySelector('[data-calc-link]');
  const updateCalc = () => {
    const selected = [...calc.querySelectorAll('input[name="service"]:checked')];
    const total = selected.reduce((sum, input) => sum + Number(input.value), 0);
    const labels = selected.map((input) => input.dataset.label).join(', ') || 'нужна консультация';
    totalNode.textContent = total > 0 ? `от ${total.toLocaleString('ru-RU')} ₽` : 'расчёт индивидуально';
    const message = `Хочу рассчитать проект в Release Records. Услуги: ${labels}. Ориентир: ${totalNode.textContent}.`;
    link.href = `https://wa.me/79936131603?text=${encodeURIComponent(message)}`;
  };
  calc.addEventListener('change', updateCalc);
  updateCalc();
}

function initGrain() {
  if (prefersReducedMotion) return;
  const canvas = document.querySelector('.grain');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  const draw = () => {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const buffer = new Uint32Array(imageData.data.buffer);
    for (let i = 0; i < buffer.length; i += 18) {
      const value = Math.random() * 255 | 0;
      buffer[i] = (24 << 24) | (value << 16) | (value << 8) | value;
    }
    ctx.putImageData(imageData, 0, 0);
    setTimeout(() => requestAnimationFrame(draw), 120);
  };
  window.addEventListener('resize', resize);
  resize();
  draw();
}
initGrain();
