const { useState: useStateE, useEffect: useEffectE, useRef: useRefE } = React;

/* ---------------- BLOGS ---------------- */
function Blogs() {
  const blogs = window.PORT.blogs;
  return (
    <section className="section-pad" id="thoughts">
      <div className="wrap">
        <Reveal as="div" className="eyebrow">Thoughts</Reveal>
        <SplitText text="Writing about AI & design." className="section-h" as="h2" />
        <div className="blogs">
          {blogs.map((b, i) => (
            <Reveal key={b.n} delay={i * 70}>
              <a className="blog" href="#" data-cursor>
                <div className="date"><span>Essay {b.n}</span><span className="tag">{b.tag}</span></div>
                <div className="b-title"><span>{b.title}</span></div>
                <div className="b-foot">
                  <span className="b-teaser">{b.teaser}</span>
                  <span className="b-arrow">→</span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CONTACT: pull the banner ---------------- */
function Contact() {
  const [open, setOpen] = useStateE(false);
  const [vw, setVw] = useStateE(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const ref = useRefE(null);

  useEffectE(() => {
    const el = ref.current;
    if (!el) return;
    let last = window.scrollY;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setTimeout(() => setOpen(true), 450);
    }, { threshold: 0.4 });
    io.observe(el);
    // close the banner when the user scrolls back upward, away from the section
    const onScroll = () => {
      const y = window.scrollY;
      const goingUp = y < last;
      last = y;
      if (goingUp) {
        const top = el.getBoundingClientRect().top;
        if (top > window.innerHeight * 0.3) setOpen(false);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const onR = () => setVw(window.innerWidth);
    window.addEventListener('resize', onR, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onR); };
  }, []);

  const links = [
    { ic: <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><path d="m3 6 9 6 9-6" /></svg>, label: 'm.manjunatha1098@gmail.com', href: 'mailto:m.manjunatha1098@gmail.com' },
    { ic: 'in', label: 'linkedin.com/in/manjunathadesigner', href: 'https://www.linkedin.com/in/manjunathadesigner/' },
    { ic: 'Bē', label: 'behance.net/manjunathadesigner', href: 'https://www.behance.net/manjunathadesigner' },
  ];

  return (
    <section className="contact" id="contact">
      <div className="wrap">
        <div className="contact-stage" ref={ref} style={{ marginTop: 0 }}>
          <div className="rail"></div>
          <span className="brackets" style={{ left: 'calc(50% - 28%)' }}></span>
          <span className="brackets" style={{ left: 'calc(50% + 28% - 18px)' }}></span>

          {/* pull cord + handle */}
          <div className="cord" style={{ top: 34, height: open ? (vw <= 680 ? 440 : vw <= 1024 ? 300 : 150) : 64, transition: 'height .8s var(--ease)' }}></div>
          <button className="handle" data-cursor aria-label="Pull to reveal contact"
            onClick={() => setOpen(o => !o)}
            style={{ top: 34 + (open ? (vw <= 680 ? 440 : vw <= 1024 ? 300 : 150) : 64), transition: 'top .8s var(--ease)' }}>↕</button>

          {/* the unfurling banner */}
          <div className="banner" data-cursor
            style={{ transform: `translateX(-50%) scaleY(${open ? 1 : 0.02})`, opacity: open ? 1 : 0.4, transition: 'transform .85s var(--ease), opacity .6s var(--ease)' }}>
            <div style={{ opacity: open ? 1 : 0, transition: 'opacity .5s var(--ease) .25s' }}>
              <h3>Let's build something<br />worth remembering.</h3>
              <p>Brand, product, 3D or a bit of everything — if it's interesting, I want in.</p>
              <div className="links">
                {links.map((l, i) => (
                  <a key={i} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                    <span className="ic">{l.ic}</span>{l.label}<span className="ar">→</span>
                  </a>
                ))}
              </div>
            </div>
            <span className="scallop"></span>
          </div>

          {/* little puller figure */}
          <div className="puller">
            <svg width="110" height="150" viewBox="0 0 110 150" fill="none">
              {/* arm angle shifts when open */}
              <g stroke="#888" strokeWidth="5" strokeLinecap="round" fill="none">
                <line x1="55" y1="150" x2="55" y2="92" />
                <line x1="55" y1="100" x2="38" y2="138" />
                <line x1="55" y1="100" x2="72" y2="138" />
                <line x1="55" y1="96" x2="30" y2={open ? 70 : 86} style={{ transition: 'all .8s var(--ease)' }} />
                <line x1="55" y1="96" x2="80" y2={open ? 48 : 70} style={{ transition: 'all .8s var(--ease)' }} />
              </g>
              <circle cx="55" cy="78" r="15" fill="#aaa" />
              <circle cx="80" cy={open ? 48 : 70} r="6" fill="none" stroke="var(--accent)" strokeWidth="3" style={{ transition: 'all .8s var(--ease)' }} />
            </svg>
            <div className="who">that's me, pulling</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FOOTER ---------------- */
function Footer() {
  return (
    <footer>
      <div className="wrap footer-inner">
        <div>
          <div className="l1"><b>Manjunatha</b> — Senior Product Designer</div>
          <div className="l2">Designed &amp; built with obsession · Mumbai · © 2026</div>
        </div>
        <div className="footer-social">
          <a href="mailto:m.manjunatha1098@gmail.com" data-cursor aria-label="Email">✉</a>
          <a href="https://www.linkedin.com/in/manjunathadesigner/" target="_blank" rel="noreferrer" data-cursor aria-label="LinkedIn">in</a>
          <a href="https://www.behance.net/manjunathadesigner" target="_blank" rel="noreferrer" data-cursor aria-label="Behance">Bē</a>
          <a href="#top" data-cursor aria-label="Back to top">↑</a>
        </div>
      </div>
    </footer>
  );
}

window.Blogs = Blogs;
window.Contact = Contact;
window.Footer = Footer;
