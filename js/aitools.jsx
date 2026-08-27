const { useRef: useRefAI, useEffect: useEffectAI } = React;

/* ------------------------------------------------------------------
   SPIRAL — cards ride a vertical helix (a coil). Each card sits at a
   point along the coil; scrolling advances every card UP the spiral
   (they swing side-to-side as they climb, front cards larger/sharper).
   Cards wrap top↔bottom and fade at the ends so the loop is seamless.
   Fully reversible — driven by scroll position, no timer. Off on mobile.
------------------------------------------------------------------- */
function useOrbit(count) {
  const wrapRef = useRefAI(null);
  const orbRefs = useRefAI([]);
  orbRefs.current = [];
  const addRef = (el) => { if (el) orbRefs.current.push(el); };

  useEffectAI(() => {
    const mq = window.matchMedia('(max-width: 760px), (hover:none), (pointer:coarse)');
    const N = count;
    const TWO_PI = Math.PI * 2;
    const TURNS = 1.5;               // how many times the coil twists
    let radius = 170, spanY = 680;
    const sizeRing = () => {
      const wrap = wrapRef.current;
      const w = wrap ? wrap.clientWidth : 1000;
      const h = wrap ? wrap.clientHeight : 720;
      radius = Math.max(140, Math.min(240, w * 0.2));
      spanY = Math.min(880, h * 0.94);
    };
    sizeRing();

    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        if (mq.matches) {
          orbRefs.current.forEach((o) => { o.style.transform = ''; o.style.opacity = ''; o.style.zIndex = ''; o.style.filter = ''; });
          return;
        }
        const rect = wrap.getBoundingClientRect();
        const vh = window.innerHeight;
        // 0 when the section top reaches the bottom of the viewport (entry),
        // 1 when its bottom reaches the top (exit) — motion begins on entry.
        const p = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));

        orbRefs.current.forEach((orb, i) => {
          // position along the coil, 0 = bottom, 1 = top; advances with scroll
          const q = (((i / N) + p) % 1 + 1) % 1;
          const y = (0.5 - q) * spanY;           // higher q → higher up
          const ang = q * TURNS * TWO_PI;
          const x = Math.sin(ang) * radius;
          const depth = (Math.cos(ang) + 1) / 2; // 1 = swung toward viewer
          const edge = Math.min(q, 1 - q);
          const fade = Math.max(0, Math.min(1, edge / 0.12));
          const scale = 0.8 + depth * 0.24;
          orb.style.transform = `translate(-50%,-50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${scale.toFixed(3)})`;
          orb.style.opacity = ((0.35 + depth * 0.65) * fade).toFixed(3);
          orb.style.filter = depth < 0.5 ? `blur(${((0.5 - depth) * 3).toFixed(2)}px)` : 'none';
          orb.style.zIndex = String(Math.round(depth * 100));
        });
      });
    };

    const onResize = () => { sizeRing(); onScroll(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [count]);

  return { wrapRef, addRef };
}

/* ------------------------------------------------------------------
   TILT — interactive 3D tilt toward the cursor on the inner card.
   Applied to .ai-bento-card only, so it never fights the .orb's
   scroll-driven orbit transform. Mouse-only, reduced-motion aware,
   rAF-throttled, layout read once on enter.
   Tweak strength via MAX_TILT (deg) and HOVER_SCALE below.
------------------------------------------------------------------- */
const MAX_TILT = 8;      // max rotateX / rotateY in degrees
const HOVER_SCALE = 1.02; // scale while hovering

function useTilt() {
  const ref = useRefAI(null);
  useEffectAI(() => {
    const el = ref.current;
    if (!el) return;
    // Mouse-only + respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

    let rect = null, raf = 0, mx = 0, my = 0;
    const FLAT = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;

    const paint = () => {
      raf = 0;
      if (!rect) return;
      const px = (mx - rect.left) / rect.width;   // 0..1 across card
      const py = (my - rect.top) / rect.height;   // 0..1 down card
      const ry = (px - 0.5) * 2 * MAX_TILT;       // rotateY toward cursor
      const rx = -(py - 0.5) * 2 * MAX_TILT;      // rotateX toward cursor
      el.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${HOVER_SCALE})`;
      el.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
      el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    };

    const onEnter = () => {
      rect = el.getBoundingClientRect();          // read layout once
      el.style.willChange = 'transform';
      el.style.transition = 'transform .08s ease-out, box-shadow .4s ease-out';
      el.classList.add('tilting');
    };
    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      el.style.transition = 'transform .4s ease-out, box-shadow .4s ease-out';
      el.style.transform = FLAT;
      el.classList.remove('tilting');
      const done = () => { el.style.willChange = ''; el.removeEventListener('transitionend', done); };
      el.addEventListener('transitionend', done);
    };

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return ref;
}

function TiltCard({ t, marks }) {
  const tiltRef = useTilt();
  return (
    <div className="ai-bento-card" data-cursor ref={tiltRef}>
      <span className={`ai-bento-ico${t.img ? ' has-img' : ''}`} style={{ background: t.c }}>
        {t.mark && marks[t.mark]}
        {t.logo && !t.img && <img src={`https://cdn.simpleicons.org/${t.logo}/ffffff`} alt="" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
        <b>{t.n[0]}</b>
        {t.img && <img className="logo-fill" src={t.img} alt={t.n} loading="lazy" decoding="async" onError={(e) => { e.currentTarget.remove(); }} />}
      </span>
      <div>
        <div className="ai-bento-name">{t.n}</div>
        <div className="ai-bento-sub">{t.u && t.u.includes('·') ? t.u.split('·').pop().trim() : t.u}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   GRID STAGGER — as the section scrolls through the viewport the cards
   come up one by one: each card is assigned a slice of the scroll range
   and rises from below (hidden → visible) within its slice, so they
   reveal sequentially. Scroll-linked (reversible), rAF-throttled,
   off on mobile / reduced-motion.
------------------------------------------------------------------- */
function useGridParallax(axis) {
  const wrapRef = useRefAI(null);
  const orbRefs = useRefAI([]);
  orbRefs.current = [];
  const addRef = (el) => { if (el) orbRefs.current.push(el); };

  useEffectAI(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const off = window.matchMedia('(max-width: 760px), (prefers-reduced-motion: reduce)');

    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const N = orbRefs.current.length;
        if (off.matches || !N) {
          orbRefs.current.forEach((o) => { o.style.transform = ''; o.style.opacity = ''; });
          return;
        }
        const rect = wrap.getBoundingClientRect();
        const vh = window.innerHeight;
        // reveal drives while the block travels from just-entered to centered
        const p = Math.max(0, Math.min(1, (vh - rect.top) / (vh * 0.9)));
        const span = 1 / N;          // each card owns a slice of the range
        const overlap = 1.8;         // >1 so neighbours overlap slightly
        orbRefs.current.forEach((o, i) => {
          const start = i * span;
          let local = (p - start) / (span * overlap);
          local = Math.max(0, Math.min(1, local));
          const eased = 1 - Math.pow(1 - local, 3);   // easeOutCubic
          if (axis === 'x') {
            const x = (1 - eased) * -64;   // slides in from the left
            o.style.transform = `translateX(${x.toFixed(1)}px)`;
          } else {
            const y = (1 - eased) * 44;    // rises up from below
            o.style.transform = `translateY(${y.toFixed(1)}px)`;
          }
          o.style.opacity = eased.toFixed(3);
        });
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [axis]);

  return { wrapRef, addRef };
}

function AITools({ id = 'ai', heading = 'Tools I use.', variant = 'grid' }) {
  const tools = window.PORT.aiTools;
  const marks = {
    adobe: <svg viewBox="0 0 24 24" fill="#fff" width="24" height="24" aria-hidden="true"><path d="M13.966 22.624l-1.69-4.281H8.122l3.892-9.144 5.662 13.425zM8.884 1.376H0v21.248zm15.116 0h-8.884L24 22.624z" /></svg>,
  };
  const [ref] = useInView({ threshold: 0.12 });
  const { wrapRef, addRef } = useGridParallax(variant === 'horizontal' ? 'x' : 'y');

  return (
    <section className="section-pad ai-lab-sec" id={id} ref={ref}>
      <div className="wrap">
        <Reveal as="div" className="eyebrow">The AI Lab</Reveal>
        <SplitText text={heading} className="section-h" as="h2" />
        <Reveal as="p" className="section-lead" delay={80}>
          The real stack behind faster concepts, motion and shipping — every output is a draft. Taste, judgement and the final call stay human.
        </Reveal>

        <div className="ai-grid-wrap" ref={wrapRef}>
          {tools.map((t) => (
            <div className="orb" key={t.n} ref={addRef}>
              <TiltCard t={t} marks={marks} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

window.AITools = AITools;
