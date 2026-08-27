const { useState: useStateH, useEffect: useEffectH, useRef: useRefH } = React;

/* small US flag chip used inline in the "Currently shaping…" line */
function USFlag() {
  return (
    <svg className="us-flag" viewBox="0 0 38 26" width="26" height="18" aria-label="United States" role="img">
      <rect width="38" height="26" rx="3" fill="#fff" />
      <g fill="#F0531C">
        <rect y="0" width="38" height="2" /><rect y="4" width="38" height="2" /><rect y="8" width="38" height="2" />
        <rect y="12" width="38" height="2" /><rect y="16" width="38" height="2" /><rect y="20" width="38" height="2" /><rect y="24" width="38" height="2" />
      </g>
      <rect width="16" height="14" fill="#2A4D8F" />
      <g fill="#fff">
        <circle cx="3" cy="3" r="1" /><circle cx="8" cy="3" r="1" /><circle cx="13" cy="3" r="1" />
        <circle cx="5.5" cy="7" r="1" /><circle cx="10.5" cy="7" r="1" />
        <circle cx="3" cy="11" r="1" /><circle cx="8" cy="11" r="1" /><circle cx="13" cy="11" r="1" />
      </g>
    </svg>);

}

/* ===== persistent dot field — fixed behind the whole page. Dots drift
   downward as you scroll (so they "travel" through every section) and
   fade out as the globe section arrives, handing off to the dotted globe.
   Reacts to the cursor. ===== */
function HeroField() {
  const ref = useRefH(null);
  useEffectH(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const G = window.__globeDots || [];             // globe land-dot unit vectors
    const steps = (window.PORT && window.PORT.journey) || [];
    const n = steps.length;
    let dots = [], raf, W = 0, H = 0, gapY = 44;
    const mouse = { x: -9999, y: -9999 };
    const ripples = [];   // click-triggered colored waves that sweep the whole screen
    // eased camera state for the globe (persists across frames)
    const cur = { yaw: n ? steps[0].lng * Math.PI / 180 : 0, pitch: n ? steps[0].lat * Math.PI / 180 : 0 };

    // each background dot is one globe land-dot, scattered across the viewport as
    // its "home"; on the journey section it flies to its position on the sphere
    const build = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      const N = Math.max(1, G.length);
      const cols = Math.max(1, Math.round(Math.sqrt(N * (W / (H || 1)))));
      const rows = Math.ceil(N / cols);
      const sx = W / cols; gapY = H / rows;
      for (let i = 0; i < N; i++) {
        const col = i % cols, row = (i / cols) | 0;
        const hx = (col + 0.5) * sx + (Math.random() - 0.5) * sx * 0.6;
        const hy = (row + 0.5) * gapY + (Math.random() - 0.5) * gapY * 0.6;
        dots.push({ vec: G[i], ox: hx, oy: hy, x: hx, y: hy, vx: 0, vy: 0, ph: Math.random() * Math.PI * 2 });
      }
    };
    build();
    window.addEventListener('resize', build);

    const cityVec = (c) => [
      Math.cos(c.lat * Math.PI / 180) * Math.sin(c.lng * Math.PI / 180),
      Math.sin(c.lat * Math.PI / 180),
      Math.cos(c.lat * Math.PI / 180) * Math.cos(c.lng * Math.PI / 180),
    ];

    // gp = how much the field has become the globe (0 background → 1 full globe);
    // pos = travel progress along the route (matches Journey's own computation)
    const globeAmt = () => {
      const j = document.getElementById('journey');
      if (!j) return { gp: 0, pos: 0 };
      const rect = j.getBoundingClientRect();
      const gin = Math.max(0, Math.min(1, (H - rect.top) / (H * 0.85)));
      const gout = Math.max(0, Math.min(1, rect.bottom / (H * 0.85)));
      const scrollable = Math.max(1, j.offsetHeight - H);
      const p = Math.max(0, Math.min(1, -rect.top / scrollable));
      return { gp: Math.min(gin, gout), p };
    };

    let t = 0;
    const loop = (ts = performance.now()) => {
      raf = requestAnimationFrame(loop);
      if (ts - (loop.last || 0) < 24) return;
      loop.last = ts;
      t += 0.012;
      ctx.clearRect(0, 0, W, H);
      const flow = (window.scrollY * 0.16) % (gapY || 1);
      // advance ripple waves (expand + fade)
      const maxR = Math.hypot(W, H);
      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].rad += maxR * 0.012;
        if (ripples[i].rad > maxR) ripples.splice(i, 1);
      }
      let formT = 0;
      const { gp, p } = globeAmt();
      // dot→globe morph is driven BY SCROLL: the first slice of the section's
      // scroll assembles the globe, the rest drives travel along the route.
      const FORM = 0.16;
      formT = Math.max(0, Math.min(1, p / FORM));
      const ease = formT * formT * (3 - 2 * formT);
      // details (arcs, city pins, labels) appear only AFTER the globe has fully formed
      const detail = Math.max(0, Math.min(1, (formT - 0.92) / 0.08));

      // ---- globe projection (only when the section is in view) ----
      let project = null, cx = W / 2, cy = H * 0.56, R = 0, index = 0, travel = 0, nextI = 0;
      if (gp > 0.001 && n) {
        // globe forms over the first FORM slice, then scroll past it drives travel
        const posEff = Math.max(0, (p - FORM) / (1 - FORM)) * (n - 1);
        index = Math.max(0, Math.min(n - 1, Math.floor(posEff)));
        const frac = posEff - index;
        travel = frac < 0.3 ? 0 : (frac - 0.3) / 0.7;
        nextI = Math.min(index + 1, n - 1);
        const tLng = steps[index].lng + (steps[nextI].lng - steps[index].lng) * travel;
        const tLat = steps[index].lat + (steps[nextI].lat - steps[index].lat) * travel;
        const tYaw = tLng * Math.PI / 180, tPitch = tLat * Math.PI / 180;
        const zoomRaw = Math.max(0, Math.min(1, posEff / 0.55));
        const zoomT = zoomRaw * zoomRaw * (3 - 2 * zoomRaw);
        const autoSpin = 0.001 * (1 - zoomT) + 0.0004;
        cur.yaw += autoSpin + (tYaw - cur.yaw) * (0.03 + zoomT * 0.055);
        cur.pitch += (tPitch - cur.pitch) * (0.03 + zoomT * 0.055);
        const dim = Math.min(W, H);
        R = dim * 0.30 + (dim * 0.84 - dim * 0.30) * zoomT;
        // on phones the globe sits a little lower so it clears the eyebrow/heading
        const isM = W <= 640;
        const cyB = isM ? 0.74 : 0.64, cyE = isM ? 0.64 : 0.56;
        cy = H * cyB + (H * cyE - H * cyB) * zoomT;
        cx = W / 2;
        const PITCH_VIEW = 0.20;
        const cosY = Math.cos(cur.yaw), sinY = Math.sin(cur.yaw);
        const cosX = Math.cos(cur.pitch + PITCH_VIEW), sinX = Math.sin(cur.pitch + PITCH_VIEW);
        project = ([x, y, z]) => {
          const x1 = x * cosY - z * sinY;
          const z1 = x * sinY + z * cosY;
          const y2 = y * cosX - z1 * sinX;
          const z2 = y * sinX + z1 * cosX;
          return [cx + x1 * R, cy - y2 * R, z2];
        };
      }

      // ---- dots: drift as the background, morph onto the sphere ----
      for (const d of dots) {
        const dxw = Math.sin(t + d.ph) * 2.4 + Math.sin(t * 0.4) * 1.2;
        const dyw = Math.cos(t * 0.9 + d.ph) * 2.4;
        const mx = d.x - mouse.x, my = d.y - mouse.y;
        const dist = Math.hypot(mx, my);
        const RR = 150;
        let near = 0;
        if (dist < RR && ease < 0.9) {
          const f = (1 - dist / RR) * (1 - ease);
          near = f;
          d.vx += mx / (dist || 1) * f * 2.4;
          d.vy += my / (dist || 1) * f * 2.4;
        }
        d.vx += (d.ox - d.x) * 0.02;
        d.vy += (d.oy - d.y) * 0.02;
        d.vx *= 0.86; d.vy *= 0.86;
        d.x += d.vx; d.y += d.vy;
        const bx = d.x + dxw;
        const by = ((d.y + flow) % (H || 1)) + dyw;

        let gx = cx, gy = cy, front = false, depth = 0;
        if (project && d.vec) {
          const [sx2, sy2, z] = project(d.vec);
          gx = sx2; gy = sy2; depth = (z + 1) / 2; front = z >= 0;
        }
        const px = bx + (gx - bx) * ease;
        const py = by + (gy - by) * ease;

        const bgA = near > 0.04 ? 0.22 + near * 0.32 : 0.12;
        const gA = front ? 0.16 + depth * 0.26 : 0.03;
        const a = bgA + (gA - bgA) * ease;
        if (a <= 0.01) continue;
        const bgS = 1.7 + near * 2.4;
        const gS = front ? 1.2 + depth * 2.0 : 0.5;
        const size = bgS + (gS - bgS) * ease;
        let cr, cg, cb;
        if (near > 0.04 && ease < 0.5) { cr = 240; cg = 83; cb = 28; }
        else { cr = 24 + (150 - 24) * ease; cg = 22 + (144 - 22) * ease; cb = 15 + (128 - 15) * ease; }
        // ripple wave: a moving band lifts + brightens the dots it passes (no colour shift)
        let ra = a, rSize = size;
        if (ripples.length && ease < 0.6) {
          for (const rp of ripples) {
            const dr = Math.abs(Math.hypot(px - rp.x, py - rp.y) - rp.rad);
            if (dr < 46) {
              const band = (1 - dr / 46) * (1 - rp.rad / Math.hypot(W, H));
              if (band > 0.02) {
                ra = Math.min(0.6, a + band * 0.4);
                rSize = size + band * 2.2;
              }
            }
          }
        }
        ctx.fillStyle = `rgba(${cr | 0},${cg | 0},${cb | 0},${ra})`;
        ctx.beginPath(); ctx.arc(px, py, rSize, 0, Math.PI * 2); ctx.fill();
      }

      // ---- route arcs + city pins on top, fading in with the globe ----
      if (project && n) {
        const drawArc = (ca, cb, amt) => {
          const a = cityVec(ca), b = cityVec(cb);
          const dp = Math.max(-1, Math.min(1, a[0]*b[0]+a[1]*b[1]+a[2]*b[2]));
          const omega = Math.acos(dp) || 1e-4;
          ctx.beginPath();
          let started = false;
          const SEG = 40;
          for (let s = 0; s <= SEG; s++) {
            const tt = (s / SEG) * amt;
            const k1 = Math.sin((1 - tt) * omega) / Math.sin(omega);
            const k2 = Math.sin(tt * omega) / Math.sin(omega);
            let vx = a[0]*k1 + b[0]*k2, vy = a[1]*k1 + b[1]*k2, vz = a[2]*k1 + b[2]*k2;
            const len = Math.hypot(vx, vy, vz) || 1;
            const bulge = 1 + 0.16 * Math.sin(Math.PI * tt);
            vx = vx/len*bulge; vy = vy/len*bulge; vz = vz/len*bulge;
            const [px2, py2, zz] = project([vx, vy, vz]);
            if (zz < -0.05) { started = false; continue; }
            if (!started) { ctx.moveTo(px2, py2); started = true; } else ctx.lineTo(px2, py2);
          }
          ctx.strokeStyle = `rgba(240,83,28,${(0.98 * detail).toFixed(3)})`;
          ctx.lineWidth = 3.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.stroke();
        };
        for (let i = 0; i < index; i++) drawArc(steps[i], steps[i + 1], 1);
        if (travel > 0 && index < n - 1) drawArc(steps[index], steps[index + 1], travel);

        steps.forEach((c, i) => {
          const [sx2, sy2, z] = project(cityVec(c));
          if (z < -0.1) return;
          const isActive = (i === index && travel < 0.5) || (i === nextI && travel >= 0.5);
          const vis = Math.max(0, Math.min(1, (z + 0.1) / 0.4)) * detail;
          if (isActive) {
            ctx.globalAlpha = vis;
            ctx.strokeStyle = 'rgba(240,83,28,.5)'; ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.arc(sx2, sy2, 13, 0, Math.PI * 2); ctx.stroke();
          }
          ctx.globalAlpha = vis * (isActive ? 1 : 0.55);
          ctx.fillStyle = isActive ? '#F0531C' : '#8a8678';
          ctx.beginPath(); ctx.arc(sx2, sy2, isActive ? 5.5 : 2.6, 0, Math.PI * 2); ctx.fill();
          if (isActive && z > 0.05) {
            ctx.globalAlpha = vis;
            ctx.fillStyle = '#F0531C';
            ctx.font = '700 19px "JetBrains Mono", monospace';
            ctx.textBaseline = 'middle';
            ctx.fillText(c.city, sx2 + 16, sy2 - 14);
          }
        });
        ctx.globalAlpha = 1;
      }
    };
    loop();

    const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    const HUES = ['240,83,28', '43,111,232', '123,77,255', '46,204,113'];
    let hueI = 0;
    const onClick = (e) => {
      const r = canvas.getBoundingClientRect();
      ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, rad: 0, col: HUES[hueI++ % HUES.length] });
      if (ripples.length > 6) ripples.shift();
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('pointerdown', onClick);
    canvas.style.opacity = '1';
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', build);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('pointerdown', onClick);
    };
  }, []);
  return <canvas className="dotfield" ref={ref}></canvas>;
}
window.HeroField = HeroField;

/* clean rotating discipline word */
function HeroWord() {
  const words = window.PORT.rotatingWords;
  const [i, setI] = useStateH(0);
  useEffectH(() => {
    const t = setInterval(() => setI((v) => (v + 1) % words.length), 1900);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="hero-word">
      <span className="txt" key={i}>{words[i]}</span>
    </span>);

}

/* two buttons that shove each other on hover */
function FightingButtons() {
  const [h, setH] = useStateH(null);
  const shoveA = h === 'b' ? 'translate(-16px,-3px) rotate(-3deg)' : h === 'a' ? 'translate(6px,0)' : 'none';
  const shoveB = h === 'a' ? 'translate(16px,3px) rotate(3deg)' : h === 'b' ? 'translate(-6px,0)' : 'none';
  return (
    <div className="hero-cta">
      <span className="fighter" style={{ transform: shoveA }}
      onMouseEnter={() => setH('a')} onMouseLeave={() => setH(null)}>
        <Magnetic strength={0.4}><a className="btn btn-accent" href="#contact">Let's work <span className="arrow">→</span></a></Magnetic>
      </span>
      <span className="fighter" style={{ transform: shoveB }}
      onMouseEnter={() => setH('b')} onMouseLeave={() => setH(null)}>
        <Magnetic strength={0.3}><a className="btn btn-ghost" href="Resume.html">Résumé</a></Magnetic>
      </span>
    </div>);

}

function Hero() {
  const [typed, setTyped] = useStateH('');
  const [done, setDone] = useStateH(false);
  const full = 'Manjunatha';
  const { years } = window.PORT;

  useEffectH(() => {
    let n = 0;
    const t = setInterval(() => {
      n++;setTyped(full.slice(0, n));
      if (n >= full.length) {clearInterval(t);setTimeout(() => setDone(true), 280);}
    }, 92);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="hero" id="top">
      <div className="wrap hero-center">
        <div className="hero-stack">
          <h1 className={`hero-name ${done ? 'done' : ''}`}>
            {typed || '\u00A0'}<span className="caret" style={{ display: done ? 'none' : 'inline-block' }}></span>
          </h1>

          <div className="hero-role2 hero-up" style={{ animationDelay: '1.2s' }}>
            I'm a <HeroWord /> Designer
            <span className="hero-avail"><span className="adot"></span> Available for work</span>
          </div>

          <div className="hero-up" style={{ animationDelay: '1.4s' }}>
            <p className="hero-sub">I build <b>brands and products</b> that people enjoy using and businesses love growing with.</p>
            <FightingButtons />
          </div>
        </div>
      </div>
    </section>);

}

window.Hero = Hero;