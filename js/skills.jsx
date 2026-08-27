const { useState: useStateSk, useEffect: useEffectSk, useRef: useRefSk } = React;

const cdn = (slug) => `assets/tools/${slug}`;

/* Claude's sunburst mark on its orange tile */
function ClaudeMark() {
  const spokes = [];
  for (let i = 0; i < 12; i++) {
    const a = (i * 30) * Math.PI / 180;
    spokes.push(<line key={i} x1={32} y1={32} x2={32 + Math.cos(a) * 20} y2={32 + Math.sin(a) * 20}
      stroke="#fff" strokeWidth={i % 3 === 0 ? 6.5 : 4.6} strokeLinecap="round" />);
  }
  return (
    <span className="pcard-logo tile" style={{ background: '#D97757', borderRadius: 13 }}>
      <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">{spokes}</svg>
    </span>
  );
}

function ToolCard(t, i) {
  return (
    <div className="pcard" data-cursor key={t.name} style={{ '--cd': `${i * 42}ms`, '--rot': `${(i % 2 ? 1 : -1) * (1 + (i % 3)) * 0.7}deg` }}>
      <span className="pcard-paper" />
      {t.dec !== 'clip' && <span className="pcard-tape" />}
      {t.dec === 'clip' && (
        <svg className="pcard-clip" viewBox="0 0 40 96" aria-hidden="true">
          <path d="M12 88V20a8 8 0 0 1 16 0v58a13 13 0 0 1-26 0V30" fill="none" stroke="#c9c9cf" strokeWidth="4" strokeLinecap="round" />
          <path d="M12 88V20a8 8 0 0 1 16 0v58a13 13 0 0 1-26 0V30" fill="none" stroke="#e9e9ee" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
      {(t.dec === 'pin-brown' || t.dec === 'pin-orange') && (
        <span className={`pcard-pin ${t.dec === 'pin-brown' ? 'brown' : 'orange'}`} />
      )}
      {t.claude ? <ClaudeMark /> : (
        <span className={`pcard-logo ${t.bg ? 'tile' : ''}`}>
          <img src={t.src} alt={t.name} loading="lazy" onError={(e) => { e.target.style.opacity = 0; }} />
        </span>
      )}
      <span className="pcard-name">{t.name}</span>
    </div>
  );
}

/* ============================================================
   TOOLZ — pinned torn-paper board built from the portfolio's
   own tool list. Cards hold pinned, then fall when the stage arms.
============================================================ */
function SkillsTools() {
  const { tools, aiTools } = window.PORT;
  const secRef = useRefSk(null);
  const [armed, setArmed] = useStateSk(false);

  // exact list from data (names + logos), in board order
  const list = [
    ...tools.map((t) => ({ name: t.name, src: cdn(t.logo) })),
    ...aiTools.map((t) => (t.n === 'Claude'
      ? { name: t.n, claude: true }
      : { name: t.n, src: t.img, bg: true })),
  ];
  // physical decorations
  list.forEach((t) => {
    if (t.name.startsWith('Figma')) t.dec = 'clip';
    if (t.name === 'Midjourney') t.dec = 'pin-brown';
    if (t.name === 'Claude') t.dec = 'pin-orange';
  });
  const grid = list.filter((t) => t.name !== 'Claude');
  const claude = list.find((t) => t.name === 'Claude');

  useEffectSk(() => {
    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const sec = secRef.current;
        if (!sec) return;
        const rect = sec.getBoundingClientRect();
        const scrollable = Math.max(1, sec.offsetHeight - window.innerHeight);
        const p = Math.max(0, Math.min(1, -rect.top / scrollable));
        setArmed(p > 0.3);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section className="craft" id="craft" ref={secRef}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="tornEdge" x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence type="fractalNoise" baseFrequency="0.014 0.02" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div className="craft-sticky">
        <div className="wrap craft-inner">
          <div className={`craft-stage ${armed ? 'armed' : ''}`}>
            <div className="pboard">
              <div className="pgrid">{grid.map(ToolCard)}</div>
              <div className="pgrid-claude">{ToolCard(claude, 12)}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

window.SkillsTools = SkillsTools;
