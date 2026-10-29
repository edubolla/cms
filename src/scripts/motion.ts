// Efeitos de movimento do site. Tudo respeita "reduzir movimento" do sistema.
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Cabeçalho: ganha fundo ao rolar e abre/fecha no celular */
const header = document.querySelector<HTMLElement>('[data-header]');
const burger = document.querySelector<HTMLButtonElement>('[data-burger]');
if (header) {
  const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 24);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });
  const setOpen = (open: boolean) => {
    header.toggleAttribute('data-open', open);
    burger?.setAttribute('aria-expanded', String(open));
    burger?.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  burger?.addEventListener('click', () => setOpen(!header.hasAttribute('data-open')));
  header.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => setOpen(false)));
}

/* Entrada dos blocos ao rolar */
const reveals = document.querySelectorAll<HTMLElement>('[data-reveal]');
if (reduced || !('IntersectionObserver' in window)) {
  reveals.forEach(el => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }),
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  reveals.forEach(el => io.observe(el));
}

/* Brilho que acompanha o mouse nos cartões */
document.querySelectorAll<HTMLElement>('[data-spot]').forEach(el => {
  el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

/* Troca de palavras do título */
const rot = document.querySelector<HTMLElement>('[data-rotator]');
if (rot && !reduced) {
  const words: string[] = JSON.parse(rot.dataset.words || '[]');
  const el = rot.querySelector<HTMLElement>('.rotator__word')!;
  let i = 0;
  if (words.length > 1) {
    setInterval(() => {
      if (document.hidden) return;
      el.classList.add('is-out');
      setTimeout(() => {
        i = (i + 1) % words.length;
        el.textContent = words[i];
        el.classList.remove('is-out');
        el.classList.add('is-pre');
        void el.offsetWidth; // reinicia a transição
        el.classList.remove('is-pre');
      }, 560);
    }, 2800);
  }
}

/* Rede de pontos no fundo do hero (remete aos nós do logo) */
const canvas = document.querySelector<HTMLCanvasElement>('[data-network]');
const ctx = canvas?.getContext('2d');
if (canvas && ctx) {
  type P = { x: number; y: number; vx: number; vy: number };
  let w = 0, h = 0, dpr = 1, pts: P[] = [], visible = true, raf = 0;
  const mouse = { x: -9999, y: -9999 };

  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(70, Math.round((w * h) / 16000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
    }));
    draw();
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    const max = 150;
    for (let a = 0; a < pts.length; a++) {
      const p = pts[a];
      for (let b = a + 1; b < pts.length; b++) {
        const q = pts[b], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < max) {
          ctx.strokeStyle = `rgba(141,187,255,${(1 - d / max) * 0.22})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (dm < 180) {
        ctx.strokeStyle = `rgba(244,248,255,${(1 - dm / 180) * 0.35})`;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(169,186,208,0.75)';
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2); ctx.fill();
    }
  };

  const tick = () => {
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }
    draw();
    raf = visible && !document.hidden ? requestAnimationFrame(tick) : 0;
  };

  resize();
  addEventListener('resize', resize);
  if (!reduced) {
    const hero = canvas.parentElement!;
    hero.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) tick(); }).observe(hero);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !raf) tick(); });
    tick();
  }
}
