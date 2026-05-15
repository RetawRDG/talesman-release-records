const audio = document.getElementById('audio');
const playBtn = document.getElementById('playToggle');
const barsWrap = document.querySelector('.bars');
const studioVideo = document.querySelector('.video-tile video');

const METRIKA_ID = null; // add real Yandex Metrika counter ID here later
const GA4_ID = null; // add real GA4 measurement ID here later

function trackGoal(name, params = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...params });
  if (METRIKA_ID && window.ym) window.ym(METRIKA_ID, 'reachGoal', name, params);
  if (GA4_ID && window.gtag) window.gtag('event', name, params);
}

const bars = [];
if (barsWrap) {
  for (let i = 0; i < 90; i += 1) {
    const bar = document.createElement('i');
    const idle = 16 + Math.round(Math.abs(Math.sin(i * 0.47)) * 44);
    bar.style.setProperty('--h', `${idle}px`);
    barsWrap.appendChild(bar);
    bars.push(bar);
  }
}

let audioCtx;
let analyser;
let dataArray;
let source;
let raf;
let audioTracked = false;
let videoTracked = false;

function setPlayState(isPlaying) {
  if (playBtn) playBtn.textContent = isPlaying ? 'Ⅱ' : '▶';
  document.body.classList.toggle('audio-playing', isPlaying);
}

function initAnalyser() {
  if (!audio || !bars.length || audioCtx) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  audioCtx = new AudioContext();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.72;
  dataArray = new Uint8Array(analyser.frequencyBinCount);
  source = audioCtx.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
}

function drawBars() {
  if (!analyser || !dataArray) return;
  analyser.getByteFrequencyData(dataArray);
  bars.forEach((bar, i) => {
    const idx = Math.floor((i / bars.length) * dataArray.length);
    const value = dataArray[idx] || 0;
    const height = 8 + Math.round((value / 255) * 68);
    bar.style.setProperty('--h', `${height}px`);
    bar.style.opacity = String(0.38 + (value / 255) * 0.62);
  });
  raf = requestAnimationFrame(drawBars);
}

function stopVisualizer() {
  if (raf) cancelAnimationFrame(raf);
  raf = null;
  bars.forEach((bar, i) => {
    const idle = 16 + Math.round(Math.abs(Math.sin(i * 0.47)) * 34);
    bar.style.setProperty('--h', `${idle}px`);
    bar.style.opacity = '0.65';
  });
}

async function playAudio() {
  if (!audio) return;
  if (studioVideo && !studioVideo.paused) studioVideo.pause();
  initAnalyser();
  if (audioCtx && audioCtx.state === 'suspended') await audioCtx.resume();
  await audio.play();
}

if (playBtn && audio) {
  playBtn.addEventListener('click', async () => {
    try {
      if (audio.paused) await playAudio();
      else audio.pause();
    } catch (_) {
      setPlayState(false);
      stopVisualizer();
    }
  });
  audio.addEventListener('play', () => {
    setPlayState(true);
    if (!audioTracked) {
      trackGoal('play_audio', { label: 'tale-track' });
      audioTracked = true;
    }
    if (!raf) drawBars();
  });
  audio.addEventListener('pause', () => {
    setPlayState(false);
    stopVisualizer();
  });
  audio.addEventListener('ended', () => {
    setPlayState(false);
    stopVisualizer();
  });
}

if (studioVideo) {
  studioVideo.addEventListener('play', () => {
    if (audio && !audio.paused) audio.pause();
    if (!videoTracked) {
      trackGoal('play_video', { label: 'studio-session' });
      videoTracked = true;
    }
  });
}

document.querySelectorAll('[data-goal]').forEach((el) => {
  el.addEventListener('click', () => trackGoal(el.dataset.goal, { href: el.href || '' }));
});
