const { useRef: useRefW, useEffect: useEffectW } = React;

/* ------------------------------------------------------------------
   PROJECT SPIRAL — each card sits on a vertical helix. Scrolling the
   pinned stage advances every card UP the coil (swinging L↔R as it
   climbs; front cards larger/sharper). Cards wrap top↔bottom and fade
   at the ends so the loop is seamless. Scroll-driven & reversible.
------------------------------------------------------------------- */
function useSpiral(count) {
  const wrapRef = useRefW(null);
  const stageRef = useRefW(null);
  const cardRefs = useRefW([]);
  cardRefs.current = [];
  const addRef = (el) => { if (el) cardRefs.current.push(el); };

  useEffectW(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const N = count;
    const TWO_PI = Math.PI * 2, TURNS = 2;
    let radius = 240, spanY = 720, raf, alive = true, lastP = -1, lastMobile = null;
    const sizeRing = () => {
      const st = stageRef.current;
      const w = st ? st.clientWidth : 1000;
      const h = st ? st.clientHeight : 720;
      // radius scales with viewport so the helix fits tablets too
      radius = Math.max(140, Math.min(380, w * 0.30));
      spanY = Math.min(1300, h * 1.30);
    };
    sizeRing();

    const apply = () => {
      const sec = wrapRef.current;
      if (!sec) return;
      const cards = sec.querySelectorAll('.scard');
      if (mq.matches) {
        // phones: plain stacked cards, no helix scrub
        if (lastMobile !== true) {
          cards.forEach((o) => { o.style.transform = ''; o.style.opacity = ''; o.style.zIndex = ''; o.style.filter = ''; o.style.boxShadow = ''; o.style.removeProperty('--veil'); o.classList.remove('front'); });
          lastMobile = true;
        }
        return;
      }
      lastMobile = false;
      const rect = sec.getBoundingClientRect();
      const scrollable = Math.max(1, sec.offsetHeight - window.innerHeight);
      const p = Math.max(0, Math.min(1, -rect.top / scrollable));
      if (Math.abs(p - lastP) < 0.0002) return;   // skip idle frames
      lastP = p;

      // ---- spiral helix: each card rides a vertical coil, swinging L↔R as it
      //      climbs. One card swings fully to the front (focus); the rest recede
      //      and dissolve into the page background.
      let frontIdx = 0, frontDepth = -1;
      const meta = [];
      cards.forEach((card, i) => {
        const q = (((i / N) + p * 1.05) % 1 + 1) % 1;   // climbs upward as p grows
        const y = (0.5 - q) * spanY;
        const ang = q * TURNS * TWO_PI;
        const x = Math.sin(ang) * radius;
        const depth = (Math.cos(ang) + 1) / 2;          // 1 = swung toward viewer
        const edge = Math.min(q, 1 - q);
        const fade = Math.max(0, Math.min(1, edge / 0.08)); // fade near the wrap seam
        const scale = 0.6 + depth * 0.5;
        meta.push({ x, y, depth, fade, scale });
        if (depth > frontDepth && fade > 0.5) { frontDepth = depth; frontIdx = i; }
      });
      cards.forEach((card, i) => {
        const { x, y, depth, fade, scale } = meta[i];
        const isFront = i === frontIdx;
        card.style.transform = `translate(-50%,-50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${scale.toFixed(3)})`;
        card.style.opacity = fade.toFixed(3);
        // Front card = crisp & solid. Every other card dissolves into the background:
        // the veil (page-bg colour) ramps up hard as depth falls away from the front.
        const veil = isFront ? 0 : Math.min(0.94, 0.5 + (1 - depth) * 0.55);
        card.style.setProperty('--veil', veil.toFixed(3));
        card.style.boxShadow = isFront ? '' : `0 ${(26 * depth).toFixed(0)}px ${(56 * depth).toFixed(0)}px rgba(24,22,15,${(0.2 * depth).toFixed(3)})`;
        card.classList.toggle('front', isFront);
        card.style.zIndex = String(Math.round(depth * 100));
      });
    };

    const tick = () => { if (!alive) return; apply(); raf = requestAnimationFrame(tick); };
    tick();
    const onScroll = () => { lastP = -1; apply(); };
    const onResize = () => { sizeRing(); lastP = -1; apply(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, true);   // capture — covers non-window scrollers
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [count]);

  return { wrapRef, stageRef, addRef };
}

function Work() {
  const projects = window.PORT.projects;
  const { wrapRef, stageRef, addRef } = useSpiral(projects.length);

  return (
    <section className="spiral-sec" id="work" ref={wrapRef} style={{ height: `${(projects.length + 1) * 100}vh` }}>
      <div className="spiral-stage" ref={stageRef}>
        <div className="spiral-field">
          {projects.map((p) => {
            const Tag = p.link ? 'a' : 'article';
            const linkProps = p.link ? { href: p.link } : {};
            return (
              <Tag className="scard" data-cursor key={p.name} ref={addRef} style={{ '--pa': p.accent }} {...linkProps}>
                <div className={`scard-thumb ${p.contain ? 'contain' : ''}`} style={{ background: p.bg }}>
                  {p.img && <img src={p.img} alt={p.name} loading="lazy" decoding="async" />}
                </div>
                <div className="scard-body">
                  <div>
                    <div className="scard-name">{p.name}</div>
                    <div className="scard-type">{p.type}</div>
                  </div>
                  <span className="scard-arrow">→</span>
                </div>
              </Tag>
            );
          })}
        </div>
      </div>
    </section>
  );
}

window.Work = Work;
