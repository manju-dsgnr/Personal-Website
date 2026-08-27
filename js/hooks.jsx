const { useState, useEffect, useRef, useCallback } = React;

/* ============================ CUSTOM CURSOR ============================ */
function Cursor() {
  const ring = useRef(null);
  const dot = useRef(null);
  useEffect(() => {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    document.body.classList.add('has-cursor');
    const m = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const r = { x: m.x, y: m.y };
    const d = { x: m.x, y: m.y };
    let raf;
    const onMove = (e) => { m.x = e.clientX; m.y = e.clientY; };
    const onOver = (e) => {
      const interactive = e.target.closest('a, button, [data-cursor], input, image-slot, .pill, .work-card, .ui-card, .blog');
      if (ring.current) ring.current.classList.toggle('hovering', !!interactive);
    };
    const loop = () => {
      r.x += (m.x - r.x) * 0.16; r.y += (m.y - r.y) * 0.16;
      d.x += (m.x - d.x) * 0.42; d.y += (m.y - d.y) * 0.42;
      if (ring.current) ring.current.style.transform = `translate(${r.x}px, ${r.y}px)`;
      if (dot.current) dot.current.style.transform = `translate(${d.x}px, ${d.y}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      document.body.classList.remove('has-cursor');
    };
  }, []);
  return (
    <React.Fragment>
      <div className="cursor-ring" ref={ring}></div>
      <div className="cursor-dot" ref={dot}></div>
    </React.Fragment>
  );
}

/* ============================ MAGNETIC ============================ */
// Wraps children; inner element translates toward cursor on hover.
function Magnetic({ children, strength = 0.35, className = '', ...rest }) {
  const outer = useRef(null);
  const inner = useRef(null);
  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      if (inner.current) inner.current.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };
    const onLeave = () => { if (inner.current) inner.current.style.transform = 'translate(0,0)'; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, [strength]);
  return (
    <span ref={outer} className={className} style={{ display: 'inline-flex' }} {...rest}>
      <span ref={inner} className="mag-inner" style={{ transition: 'transform .35s cubic-bezier(0.22,1,0.36,1)' }}>{children}</span>
    </span>
  );
}

/* ============================ REVEAL (IntersectionObserver) ============================ */
function useInView(opts = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); if (opts.once !== false) io.unobserve(el); }
    }, { threshold: opts.threshold ?? 0.18, rootMargin: opts.rootMargin ?? '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}

function Reveal({ children, className = '', as = 'div', delay = 0, ...rest }) {
  const [ref, inView] = useInView();
  const Tag = as;
  return (
    <Tag ref={ref} className={`reveal ${inView ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

/* ============================ SPLIT TEXT (char reveal on scroll) ============================ */
function SplitText({ text, className = '', as = 'h2', stagger = 28, baseDelay = 0 }) {
  const [ref, inView] = useInView({ threshold: 0.3 });
  const Tag = as;
  const chars = [...text];
  let idx = 0;
  return (
    <Tag ref={ref} className={`split ${inView ? 'in' : ''} ${className}`}>
      {chars.map((c, i) => {
        const delay = c === ' ' ? 0 : baseDelay + (idx++ * stagger);
        return (
          <span key={i} className="ch" style={{ transitionDelay: `${delay}ms` }}>
            {c === ' ' ? '\u00A0' : c}
          </span>
        );
      })}
    </Tag>
  );
}

Object.assign(window, { Cursor, Magnetic, Reveal, SplitText, useInView });
