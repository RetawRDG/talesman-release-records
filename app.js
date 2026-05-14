const makeBars = (selector, count, tall = 100) => {
  const el = document.querySelector(selector);
  if (!el) return;
  el.innerHTML = Array.from({ length: count }, (_, i) => {
    const h = 18 + ((i * 37) % tall);
    const delay = -((i % 17) / 9).toFixed(2);
    return `<i style="--h:${h}%;animation-delay:${delay}s;animation-duration:${0.9 + (i % 7) * 0.13}s"></i>`;
  }).join('');
};

makeBars('.mini-bars', 18, 82);
makeBars('.wave', 74, 94);

const audio = document.getElementById('audio');
const play = document.getElementById('playToggle');
if (audio && play) {
  play.addEventListener('click', async () => {
    if (audio.paused) {
      try { await audio.play(); } catch (_) {}
    } else {
      audio.pause();
    }
  });
  audio.addEventListener('play', () => {
    play.textContent = '❚❚';
    document.body.classList.add('is-playing');
  });
  audio.addEventListener('pause', () => {
    play.textContent = '▶';
    document.body.classList.remove('is-playing');
  });
}

const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('show');
  });
}, { threshold: 0.14 });

document.querySelectorAll('section, .service-card, .gallery-card, .process-list article, .format-grid article, details').forEach(el => {
  el.classList.add('reveal');
  io.observe(el);
});
