// ---------- EMOTIONAL VOICE SYSTEM ----------
function stripEmoji(str) {
  return str
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------- VOICE SELECTION - Force Microsoft Zira (Female Voice) ----------
let cachedVoice = null;

function pickBestVoice() {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Log all available voices to console for debugging
  console.log('🔊 Available voices:');
  voices.forEach(v => console.log(`  - ${v.name} (${v.lang})`));

  const rank = (v) => {
    const name = v.name.toLowerCase();
    const lang = v.lang.toLowerCase();
    
    if (!lang.startsWith('en')) return -1;
    
    // Microsoft Zira - TOP PRIORITY
    if (name.includes('zira')) return 1000;
    // Microsoft Jenny (female)
    if (name.includes('jenny')) return 950;
    // Microsoft Aria (female)
    if (name.includes('aria')) return 900;
    // Microsoft Susan (female)
    if (name.includes('susan')) return 900;
    // Any Microsoft voice
    if (name.includes('microsoft')) return 800;
    // Google female voices
    if (name.includes('google') && (name.includes('uk') || name.includes('female'))) return 700;
    // Windows Natural voices
    if (name.includes('natural') && name.includes('female')) return 600;
    // Any female-sounding voice
    if (name.includes('female') || name.includes('girl') || name.includes('woman')) return 500;
    // Any Google voice
    if (name.includes('google')) return 400;
    // Generic English voice
    return 100;
  };

  const sorted = [...voices].sort((a, b) => rank(b) - rank(a));
  const best = sorted[0];
  
  console.log('✅ Selected voice:', best ? best.name : 'None found');
  return best;
}

function getVoice() {
  if (cachedVoice) {
    const voices = window.speechSynthesis.getVoices();
    const stillExists = voices.some(v => v.voiceURI === cachedVoice.voiceURI);
    if (!stillExists) {
      cachedVoice = null;
    }
  }
  
  if (!cachedVoice) {
    cachedVoice = pickBestVoice();
  }
  return cachedVoice;
}

if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    console.log('🔄 Voices changed, refreshing...');
    cachedVoice = pickBestVoice();
  };
}

// ---------- MOOD PRESETS ----------
const MOOD_PRESETS = {
  deadpan:   { rate: 0.88, pitch: 0.95, volume: 1.00, pauseMs: 420, leadInMs: 350, prefix: '',       finalRate: 0.95, finalPitch: 0.90 },
  sleepy:    { rate: 0.72, pitch: 0.80, volume: 0.85, pauseMs: 420, leadInMs: 300, prefix: '',       finalRate: 0.85, finalPitch: 0.85 },
  dramatic:  { rate: 0.80, pitch: 1.10, volume: 1.00, pauseMs: 600, leadInMs: 450, prefix: 'Okay.',   finalRate: 0.82, finalPitch: 0.85 },
  sarcastic: { rate: 0.95, pitch: 1.30, volume: 1.00, pauseMs: 280, leadInMs: 150, prefix: 'Oh really?', finalRate: 1.00, finalPitch: 1.12 },
  playful:   { rate: 1.15, pitch: 1.30, volume: 1.00, pauseMs: 160, leadInMs: 100, prefix: '',       finalRate: 1.08, finalPitch: 1.15 },
  annoyed:   { rate: 1.05, pitch: 1.12, volume: 1.00, pauseMs: 210, leadInMs: 120, prefix: '',       finalRate: 1.10, finalPitch: 1.08 },
  caring:    { rate: 0.90, pitch: 1.02, volume: 0.95, pauseMs: 360, leadInMs: 400, prefix: 'Hey.',    finalRate: 0.85, finalPitch: 0.95 }
};

function splitIntoClauses(text) {
  const parts = text.match(/[^.,!?…]+[.,!?…]?/g);
  return (parts && parts.length ? parts : [text]).map((p) => p.trim()).filter(Boolean);
}

function speakExpressive(text, moodKey, mult = {}) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const preset = MOOD_PRESETS[moodKey] || MOOD_PRESETS.deadpan;
  const rateMult = mult.rateMult ?? 1;
  const pitchMult = mult.pitchMult ?? 1;
  const volumeMult = mult.volumeMult ?? 1;
  const voice = getVoice();

  const cleanText = stripEmoji(text);
  const clauses = splitIntoClauses(preset.prefix ? `${preset.prefix} ${cleanText}` : cleanText);
  const lastIndex = clauses.length - 1;
  let i = 0;

  function speakNext() {
    if (i >= clauses.length) return;
    const isLast = i === lastIndex;
    const utterance = new SpeechSynthesisUtterance(clauses[i]);
    if (voice) utterance.voice = voice;

    const jitter = 0.97 + Math.random() * 0.06;
    const rateShift = isLast ? preset.finalRate : 1;
    const pitchShift = isLast ? preset.finalPitch : 1;

    utterance.rate = clamp(preset.rate * rateMult * rateShift * jitter, 0.3, 3);
    utterance.pitch = clamp(preset.pitch * pitchMult * pitchShift * jitter, 0, 2);
    utterance.volume = clamp(preset.volume * volumeMult, 0, 1);

    utterance.onend = () => {
      i += 1;
      if (i < clauses.length) setTimeout(speakNext, preset.pauseMs);
    };
    window.speechSynthesis.speak(utterance);
  }

  setTimeout(speakNext, preset.leadInMs);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function stopAllSpeech() {
  window.speechSynthesis && window.speechSynthesis.cancel();
}

// ---------- SCREEN ANIMATIONS ----------
function triggerScreenAnimation(mood, intensity = 1.0) {
  const overlay = document.createElement('div');
  overlay.id = 'screen-animation';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9999;
    transition: all 0.3s ease;
  `;
  document.body.appendChild(overlay);

  const scaledIntensity = Math.min(intensity * 1.5, 2.0);

  switch(mood) {
    case 'dramatic':
      dramaticFlash(overlay, scaledIntensity);
      break;
    case 'annoyed':
      shakeEffect(overlay, scaledIntensity);
      break;
    case 'sleepy':
      gentlePulse(overlay, scaledIntensity);
      break;
    case 'sarcastic':
      sarcasticSwipe(overlay, scaledIntensity);
      break;
    case 'playful':
      playfulBounce(overlay, scaledIntensity);
      break;
    case 'caring':
      warmGlow(overlay, scaledIntensity);
      break;
    default:
      subtleFade(overlay, scaledIntensity);
  }

  setTimeout(() => overlay.remove(), 1500);
}

function dramaticFlash(overlay, intensity) {
  const flashStrength = 0.6 * intensity;
  overlay.style.background = `rgba(255, 255, 255, ${flashStrength + 0.2})`;
  overlay.style.transition = 'all 0.1s ease';
  
  setTimeout(() => {
    overlay.style.background = `rgba(255, 200, 0, ${0.3 * intensity})`;
    overlay.style.boxShadow = `inset 0 0 ${100 * intensity}px rgba(255, 200, 0, ${0.5 * intensity})`;
  }, 150);
  
  setTimeout(() => {
    overlay.style.background = `rgba(255, 255, 255, ${flashStrength * 0.7})`;
  }, 300);
  
  setTimeout(() => {
    overlay.style.background = `rgba(255, 200, 0, ${0.2 * intensity})`;
  }, 500);
}

function shakeEffect(overlay, intensity) {
  overlay.style.background = `rgba(255, 0, 0, ${0.1 * intensity})`;
  overlay.style.transition = 'all 0.05s ease';
  
  let shakes = 0;
  const maxShakes = 10 + Math.floor(intensity * 5);
  const interval = setInterval(() => {
    const shakeIntensity = (maxShakes - shakes) * 1.5 * intensity;
    const x = (Math.random() - 0.5) * shakeIntensity;
    const y = (Math.random() - 0.5) * shakeIntensity;
    overlay.style.transform = `translate(${x}px, ${y}px)`;
    overlay.style.background = `rgba(255, 0, 0, ${0.1 * intensity - shakes * 0.01})`;
    shakes++;
    if (shakes > maxShakes) {
      clearInterval(interval);
      overlay.style.transform = 'translate(0, 0)';
      overlay.style.background = 'rgba(255,0,0,0)';
    }
  }, 50);
}

function gentlePulse(overlay, intensity) {
  overlay.style.background = `rgba(100, 100, 200, ${0.1 * intensity})`;
  overlay.style.transition = 'all 0.5s ease';
  
  let pulse = 0;
  const maxPulses = Math.PI * 3;
  const interval = setInterval(() => {
    const pulseIntensity = 0.1 + Math.sin(pulse) * 0.08 * intensity;
    overlay.style.background = `rgba(100, 100, 200, ${pulseIntensity})`;
    overlay.style.transform = `scale(${1 + Math.sin(pulse) * 0.005 * intensity})`;
    pulse += 0.3;
    if (pulse > maxPulses) {
      clearInterval(interval);
      overlay.style.background = 'rgba(100, 100, 200, 0)';
      overlay.style.transform = 'scale(1)';
    }
  }, 100);
}

function sarcasticSwipe(overlay, intensity) {
  overlay.style.background = `rgba(255, 200, 0, ${0.3 * intensity})`;
  overlay.style.transition = 'all 0.2s ease';
  overlay.style.transform = 'translateX(100%)';
  
  setTimeout(() => {
    overlay.style.transform = 'translateX(-100%)';
    overlay.style.background = `rgba(255, 200, 0, ${0.2 * intensity})`;
  }, 300);
  
  setTimeout(() => {
    overlay.style.transform = 'translateX(0)';
    overlay.style.background = `rgba(255, 200, 0, ${0.1 * intensity})`;
  }, 600);
  
  setTimeout(() => {
    overlay.style.background = 'rgba(255, 200, 0, 0)';
  }, 900);
}

function playfulBounce(overlay, intensity) {
  overlay.style.background = `rgba(100, 200, 255, ${0.2 * intensity})`;
  overlay.style.transition = `all 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
  
  let bounces = 0;
  const maxBounces = 8 + Math.floor(intensity * 4);
  const interval = setInterval(() => {
    const bounceIntensity = (maxBounces - bounces) * 2 * intensity;
    overlay.style.transform = `scale(${1 + bounceIntensity * 0.02})`;
    overlay.style.background = `rgba(100, 200, 255, ${0.2 * intensity - bounces * 0.02})`;
    bounces++;
    if (bounces > maxBounces) {
      clearInterval(interval);
      overlay.style.transform = 'scale(1)';
      overlay.style.background = 'rgba(100, 200, 255, 0)';
    }
  }, 120);
}

function warmGlow(overlay, intensity) {
  overlay.style.background = `radial-gradient(circle at center, rgba(255, 150, 200, ${0.3 * intensity}) 0%, rgba(255, 150, 200, 0) 70%)`;
  overlay.style.transition = 'all 1s ease';
  overlay.style.transform = 'scale(0.5)';
  overlay.style.opacity = '0';
  
  setTimeout(() => {
    overlay.style.opacity = '1';
    overlay.style.transform = 'scale(1)';
  }, 50);
  
  setTimeout(() => {
    overlay.style.opacity = '0';
    overlay.style.transform = `scale(${1.5 * intensity})`;
  }, 1000);
}

function subtleFade(overlay, intensity) {
  overlay.style.background = `rgba(240, 169, 60, ${0.05 * intensity})`;
  overlay.style.transition = 'all 0.5s ease';
  overlay.style.opacity = '0';
  
  setTimeout(() => {
    overlay.style.opacity = '1';
  }, 50);
  
  setTimeout(() => {
    overlay.style.opacity = '0';
  }, 800);
}

// ---------- PARTICLE EFFECTS ----------
function createParticles(mood, intensity = 1.0) {
  const colors = {
    dramatic: ['#ff6b6b', '#ffd93d', '#ff9640'],
    sleepy: ['#8888cc', '#aa88dd', '#66aaff'],
    playful: ['#6bcbff', '#6bcb77', '#ffd93d'],
    caring: ['#ff6b9d', '#ff8a9d', '#ffb8c9'],
    sarcastic: ['#ffd93d', '#ff9640', '#ff6b6b'],
    annoyed: ['#ff6b6b', '#ff4d4d', '#ff3333'],
    default: ['#f0a93c', '#ffd93d', '#ff9640']
  };

  const particleColors = colors[mood] || colors.default;
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
  `;
  document.body.appendChild(container);

  const numParticles = Math.floor((15 + Math.random() * 15) * intensity);
  
  for (let i = 0; i < numParticles; i++) {
    const particle = document.createElement('div');
    const size = 3 + Math.random() * 8 * intensity;
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const color = particleColors[Math.floor(Math.random() * particleColors.length)];
    
    const tx = (Math.random() - 0.5) * 200 * intensity;
    const ty = (-100 - Math.random() * 300) * intensity;
    
    const style = document.createElement('style');
    const keyframes = `
      @keyframes particleFloat_${i} {
        0% { opacity: 0; transform: translate(0, 0) scale(0.5) rotate(0deg); }
        20% { opacity: 1; }
        100% { opacity: 0; transform: translate(${tx}px, ${ty}px) scale(0) rotate(${360 + Math.random() * 360}deg); }
      }
    `;
    style.textContent = keyframes;
    document.head.appendChild(style);
    
    particle.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      box-shadow: 0 0 ${size * 2}px ${color};
      animation: particleFloat_${i} ${1 + Math.random() * 2}s ease-out forwards;
      animation-delay: ${Math.random() * 0.5}s;
      opacity: 0;
    `;
    
    container.appendChild(particle);
  }

  setTimeout(() => container.remove(), 3000);
}

// ---------- FULL DRAMATIC ENTRANCE ----------
function dramaticEntrance(mood, intensity = 1.0) {
  if (intensity <= 0) return;
  
  triggerScreenAnimation(mood, intensity);
  setTimeout(() => createParticles(mood, intensity), 200);
  
  const card = document.querySelector('.card');
  if (card && intensity > 0.3) {
    card.style.transition = 'all 0.05s ease';
    let shakes = 0;
    const maxShakes = Math.floor(6 * intensity);
    const shakeInterval = setInterval(() => {
      const shakeIntensity = (maxShakes - shakes) * 1.5 * intensity;
      const rot = (Math.random() - 0.5) * shakeIntensity * 0.5;
      const x = (Math.random() - 0.5) * shakeIntensity;
      const y = (Math.random() - 0.5) * shakeIntensity;
      card.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
      shakes++;
      if (shakes > maxShakes) {
        clearInterval(shakeInterval);
        card.style.transform = 'translate(0, 0) rotate(0deg)';
        card.style.transition = 'all 0.2s ease';
      }
    }, 60);
  }
}

// ---------- MAIN APP LOGIC ----------
window.owlAPI.onMessage((payload) => {
  const { 
    text, 
    mood, 
    voiceEnabled, 
    rateMult, 
    pitchMult, 
    volumeMult 
  } = payload;
  
  document.getElementById('message').textContent = text;
  
  // 🎬 Trigger screen animations
  dramaticEntrance(mood, 1.0);

  if (voiceEnabled) {
    speakExpressive(text, mood, { rateMult, pitchMult, volumeMult });
  }
});

// ---------- BUTTON HANDLERS ----------
document.getElementById('closeBtn').addEventListener('click', () => {
  stopAllSpeech();
  window.owlAPI.dismiss();
});

document.getElementById('snoozeBtn').addEventListener('click', () => {
  stopAllSpeech();
  window.owlAPI.snooze();
});

document.getElementById('sleepBtn').addEventListener('click', () => {
  stopAllSpeech();
  window.owlAPI.sleepNow();
});

// ---------- OWL ANIMATIONS ----------
const lidL = document.getElementById('lidL');
const lidR = document.getElementById('lidR');

function blink() {
  const closedHeight = 22;
  lidL.setAttribute('height', closedHeight);
  lidR.setAttribute('height', closedHeight);
  setTimeout(() => {
    lidL.setAttribute('height', 0);
    lidR.setAttribute('height', 0);
  }, 140);
}

setInterval(blink, 3200 + Math.random() * 1500);

const pupilL = document.getElementById('pupilL');
const pupilR = document.getElementById('pupilR');
let t = 0;
setInterval(() => {
  t += 0.15;
  const dx = Math.sin(t) * 2.5;
  const dy = Math.cos(t * 0.7) * 1.5;
  pupilL.setAttribute('cx', 40 + dx);
  pupilL.setAttribute('cy', 66 + dy);
  pupilR.setAttribute('cx', 80 + dx);
  pupilR.setAttribute('cy', 66 + dy);
}, 80);