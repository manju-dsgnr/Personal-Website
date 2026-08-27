const { useState: useStateM, useEffect: useEffectM, useRef: useRefM } = React;

/* top scroll-progress bar */
function ScrollProgress() {
  const bar = useRefM(null);
  useEffectM(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      if (bar.current) bar.current.style.transform = `scaleX(${Math.max(0, Math.min(1, p))})`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div className="scroll-progress" ref={bar}></div>;
}

/* ===== floating 3D wireframe shapes that spin + parallax on scroll ===== */
function Scene3D() {
  const ref = useRefM(null);
  useEffectM(() => {
    const root = ref.current; if (!root) return;
    const shapes = [...root.querySelectorAll('.shape3d')];
    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        shapes.forEach((s) => {
          const depth = parseFloat(s.dataset.depth || '0.1');
          s.style.setProperty('--sy', `${-y * depth}px`);
          s.style.setProperty('--sr', `${y * depth * 0.35}deg`);
        });
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  const cube = (cls, depth, style) => (
    <div className={`shape3d ${cls}`} data-depth={depth} style={style}>
      <div className="cube">
        <span className="cf fx"></span><span className="cf bx"></span>
        <span className="cf lx"></span><span className="cf rx"></span>
        <span className="cf tp"></span><span className="cf bt"></span>
      </div>
    </div>
  );
  const ring = (cls, depth, style) => (
    <div className={`shape3d ${cls}`} data-depth={depth} style={style}>
      <div className="ring3d"><span></span><span></span><span></span></div>
    </div>
  );

  return (
    <div className="scene3d" ref={ref} aria-hidden="true">
      {cube('s-a', 0.18, { top: '14%', left: '6%', '--sz': '70px' })}
      {ring('s-b', 0.10, { top: '32%', right: '8%', '--sz': '150px' })}
      {cube('s-c', 0.26, { top: '58%', left: '12%', '--sz': '44px' })}
      {ring('s-d', 0.16, { top: '74%', right: '14%', '--sz': '90px' })}
      {cube('s-e', 0.12, { top: '90%', left: '50%', '--sz': '58px' })}
      {cube('s-f', 0.22, { top: '46%', right: '40%', '--sz': '34px' })}
    </div>
  );
}

/* sticky top nav: centered current-section heading (assembles letter-by-letter
   as you scroll it) + a hamburger that opens the section menu. */
const NAV_ITEMS = [
  { id: 'top', label: 'Home' },
  { id: 'craft', label: 'Toolz' },
  { id: 'work', label: 'Work' },
  { id: 'journey', label: 'Journey' },
  { id: 'contact', label: 'Contact' },
];
function Nav() {
  const [scrolled, setScrolled] = useStateM(false);
  const [active, setActive] = useStateM(0);
  const [aprog, setAprog] = useStateM(0);
  const [open, setOpen] = useStateM(false);
  useEffectM(() => {
    const secEls = NAV_ITEMS.map((it) => document.getElementById(it.id));
    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        const H = window.innerHeight;
        let act = 0, actP = 0;
        secEls.forEach((el, i) => {
          if (!el) return;
          const r = el.getBoundingClientRect();
          if (r.top <= H * 0.4 && r.bottom > H * 0.4) {
            act = i;
            const sc = Math.max(1, el.offsetHeight - H);
            actP = Math.max(0, Math.min(1, -r.top / sc));
          }
        });
        setActive(act);
        setAprog(actP);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const cur = NAV_ITEMS[active];
  const L = cur.label.length;
  const fill = Math.min(1, aprog / 0.45);
  const go = (id) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop + 2, behavior: 'smooth' });
  };

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''} ${open ? 'menu-open' : ''}`}>
      <div className="wrap nav-inner nav-3">
        <div className="nav-right">
          <button className={`nav-burger ${open ? 'open' : ''}`} data-cursor aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <span></span><span></span><span></span>
          </button>
          <div className="sec-heading" key={cur.id}>
            {[...cur.label].map((c, k) => {
              const appear = Math.max(0, Math.min(1, fill * (L + 1.5) - k));
              return <span key={k} className="sh-l" style={{ opacity: appear, transform: `translateX(${((appear - 1) * 30).toFixed(1)}px)` }}>{c}</span>;
            })}
          </div>
        </div>
      </div>
      <div className={`nav-menu ${open ? 'show' : ''}`}>
        {NAV_ITEMS.map((it, i) => (
          <button key={it.id} className={`nav-menu-item ${i === active ? 'on' : ''}`} data-cursor
            onClick={() => go(it.id)} style={{ transitionDelay: open ? `${i * 55 + 40}ms` : '0ms' }}>
            <span className="nm-idx">{String(i + 1).padStart(2, '0')}</span>
            <span className="nm-label">{it.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

/* parallax tilt on [data-parallax] (astro scene) */
function useParallax() {
  useEffectM(() => {
    if (window.matchMedia('(hover:none),(pointer:coarse)').matches) return;
    const onMove = (e) => {
      document.querySelectorAll('[data-parallax]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = (e.clientX - cx) / r.width, dy = (e.clientY - cy) / r.height;
        const bg = el.querySelector('.bg');
        if (bg) bg.style.transform = `scale(1.08) translate(${dx * -14}px, ${dy * -14}px)`;
        const sun = el.querySelector('.astro-sun');
        if (sun) sun.style.translate = `${dx * 22}px ${dy * 22}px`;
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
}

/* current-section heading + hamburger menu live inside <Nav>. */

/* mobile/tablet: a large section heading that pins at the top while you scroll
   the section, then flies off to the right (into the menu) as the section ends. */
function MobileSecHead() {
  const [st, setSt] = useStateM({ i: 0, enter: 0, exit: 0 });
  useEffectM(() => {
    const els = NAV_ITEMS.map((it) => document.getElementById(it.id));
    let raf;
    const PROBE = 60; // the line just under the fixed heading bar
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        let act = 0, r = null;
        els.forEach((el, i) => {
          if (!el) return;
          const b = el.getBoundingClientRect();
          if (b.top <= PROBE && b.bottom > PROBE) { act = i; r = b; }
        });
        if (!r) { setSt((s) => ({ ...s, i: act })); return; }
        const enter = Math.max(0, Math.min(1, (PROBE - r.top) / 70));
        const exit = Math.max(0, Math.min(1, 1 - (r.bottom - PROBE) / 130));
        setSt({ i: act, enter, exit });
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, []);
  const { i, enter, exit } = st;
  if (i === 0) return <div className="msec-head" aria-hidden="true" data-off="true"></div>;
  const item = NAV_ITEMS[i];
  const vw = typeof window !== 'undefined' ? window.innerWidth : 400;
  const x = (1 - enter) * -46 + exit * vw * 0.78;
  const op = enter * (1 - exit);
  return (
    <div className="msec-head" aria-hidden="true">
      <span className="msh-in" style={{ transform: `translate(-50%,-50%) translateX(${x.toFixed(1)}px)`, opacity: op.toFixed(2) }}>
        <span className="msh-t">{item.label}</span>
      </span>
    </div>
  );
}

function App() {
  useParallax();
  return (
    <React.Fragment>
      <Cursor />
      <HeroField />
      <ScrollProgress />
      <Nav />
      <MobileSecHead />
      <main>
        <Hero />
        <SkillsTools />
        <Work />
        <Journey />
        <Contact />
      </main>
      <PortfolioTweaks />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
