const audio=document.getElementById('audio');
const btn=document.getElementById('playToggle');
const bars=document.querySelector('.bars');
if(bars){for(let i=0;i<90;i++){const b=document.createElement('i');b.style.setProperty('--h',`${18+Math.round(Math.abs(Math.sin(i*.61))*52+Math.random()*18)}px`);bars.appendChild(b)}}
if(btn&&audio){btn.addEventListener('click',async()=>{try{if(audio.paused){await audio.play();btn.textContent='Ⅱ'}else{audio.pause();btn.textContent='▶'}}catch(e){btn.textContent='▶'}});audio.addEventListener('ended',()=>btn.textContent='▶')}
