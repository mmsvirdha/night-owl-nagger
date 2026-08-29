// ---------- Night Owl full-screen burst effect ----------
// Runs inside a transparent, click-through window sized to the whole
// monitor. Reads the mood from the URL (?mood=dramatic etc, set by
// main.js) and plays a short color wash + light rays + rising particle
// burst that originates near the corner where the owl popup lives, so it
// feels connected to the owl rather than random. Self-closes when done.

(function () {
  const params = new URLSearchParams(window.location.search);
  const mood = params.get('mood') || 'default';

  const PALETTES = {
    dramatic: ['#ff6b6b', '#ffd93d', '#ff9640'],
    sleepy: ['#8888cc', '#aa88dd', '#66aaff'],
    playful: ['#6bcbff', '#6bcb77', '#ffd93d'],
    caring: ['#ff6b9d', '#ff8a9d', '#ffb8c9'],
    sarcastic: ['#ffd93d', '#ff9640', '#ff6b6b'],
    annoyed: ['#ff6b6b', '#ff4d4d', '#ff3333'],
    deadpan: ['#9aa5b1', '#c2c9d1', '#6b7785'],
    default: ['#f0a93c', '#ffd93d', '#ff9640']
  };
  const palette = PALETTES[mood] || PALETTES.default;

  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function hexToRgba(hex, alpha) {
    const c = hex.replace('#', '');
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Origin near the bottom-right, matching where the owl popup appears.
  const originX = canvas.width - 140;
  const originY = canvas.height - 140;

  // Particles burst outward, then arc upward like sparks.
  const PARTICLE_COUNT = 90;
  const particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 5;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      size: 1.5 + Math.random() * 3.5,
      color: palette[Math.floor(Math.random() * palette.length)],
      life: 1
    });
  }

  const RAY_COUNT = 10;
  const TOTAL_FRAMES = 150; // ~2.5s at 60fps
  let frame = 0;
  let rafId = null;

  function draw() {
    frame++;
    const t = Math.min(frame / TOTAL_FRAMES, 1);
    const wash = Math.sin(t * Math.PI); // eases in, peaks mid-way, eases out

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Soft color wash radiating from the origin
    const maxRadius = Math.max(canvas.width, canvas.height);
    const gradient = ctx.createRadialGradient(originX, originY, 0, originX, originY, maxRadius);
    gradient.addColorStop(0, hexToRgba(palette[0], 0.30 * wash));
    gradient.addColorStop(0.5, hexToRgba(palette[1] || palette[0], 0.12 * wash));
    gradient.addColorStop(1, hexToRgba(palette[0], 0));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Slowly rotating light rays
    ctx.save();
    ctx.translate(originX, originY);
    ctx.rotate(frame * 0.008);
    for (let i = 0; i < RAY_COUNT; i++) {
      ctx.rotate((Math.PI * 2) / RAY_COUNT);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(maxRadius * wash, 0);
      ctx.lineWidth = 2;
      ctx.strokeStyle = hexToRgba(palette[2] || palette[0], 0.06 * wash);
      ctx.stroke();
    }
    ctx.restore();

    // Rising, fading spark particles
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.025; // gentle gravity so they arc instead of flying forever
      p.vx *= 0.99;
      p.life -= 1 / TOTAL_FRAMES;
      const alpha = Math.max(p.life, 0);
      ctx.beginPath();
      ctx.fillStyle = hexToRgba(p.color, alpha);
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    if (frame < TOTAL_FRAMES) {
      rafId = requestAnimationFrame(draw);
    } else {
      finish();
    }
  }

  function finish() {
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
    // Small delay so the last frame doesn't feel like it's cut off abruptly
    setTimeout(() => window.close(), 50);
  }

  requestAnimationFrame(draw);
})();
