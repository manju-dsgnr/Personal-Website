const { useState: useStateJ, useEffect: useEffectJ, useRef: useRefJ } = React;

/* ---- simplified continent mask (ellipses in lng/lat space) ---- */
const LAND = [
  // North America
  [-100, 46, 30, 22], [-103, 26, 11, 12], [-85, 13, 9, 6], [-42, 72, 13, 9],
  // South America
  [-62, -6, 16, 16], [-66, -34, 9, 17],
  // Europe
  [12, 50, 22, 12], [25, 60, 18, 10],
  // Africa
  [16, 16, 20, 16], [26, -16, 14, 18], [47, -20, 4, 6],
  // Asia (India excluded here — traced as an accurate outline below instead)
  [95, 56, 48, 17], [75, 41, 22, 13], [112, 33, 18, 14],
  [103, 9, 10, 11], [47, 24, 12, 13], [135, 38, 8, 8], [120, -2, 12, 9],
  // Australia
  [134, -25, 17, 11], [172, -42, 5, 6],
];
function isLand(lng, lat) {
  if (isIndia(lng, lat)) return true;
  for (const [cl, ca, rl, ra] of LAND) {
    const dx = (lng - cl) / rl, dy = (lat - ca) / ra;
    if (dx * dx + dy * dy <= 1) return true;
  }
  return false;
}

/* ---- accurate-ish India outline (mainland + separate NE lobe past the Siliguri
   corridor), traced in lng/lat so the zoomed-in map reads as a real coastline ---- */
const INDIA_MAIN = [
  [74.5,34.8],[76.8,34.0],[78.5,33.0],[79.8,31.8],[80.2,30.5],[81.2,30.1],
  [83.0,29.5],[84.5,28.5],[86.0,27.8],[88.0,27.3],[88.3,26.5],[89.5,26.0],
  [89.6,25.2],[89.0,24.5],[89.3,23.6],[89.0,22.2],[88.2,21.6],[87.0,21.4],
  [86.5,20.3],[85.3,19.6],[84.0,18.5],[83.0,17.5],[82.0,16.8],[80.5,16.0],
  [80.3,15.0],[80.2,13.5],[80.1,12.8],[79.8,11.5],[79.5,10.5],[79.3,9.5],
  [79.0,8.9],[78.3,8.2],[77.5,8.1],[76.5,8.5],[76.0,9.5],[75.8,10.5],
  [75.5,11.5],[75.3,12.5],[74.8,13.5],[74.0,14.5],[73.5,15.5],[73.2,16.5],
  [72.8,17.5],[72.8,18.9],[72.6,20.0],[72.0,21.0],[70.5,21.0],[69.5,22.0],
  [68.5,23.5],[69.5,24.5],[70.5,25.0],[71.0,26.5],[70.0,27.5],[71.0,28.5],
  [72.5,29.5],[73.5,30.5],[74.0,31.5],[74.5,32.5],[74.5,34.8],
];
const INDIA_NE = [
  [89.7,26.8],[91.0,27.8],[93.0,28.3],[95.2,29.0],[97.0,28.7],[97.3,27.0],
  [96.0,25.0],[94.0,23.8],[93.0,22.3],[91.5,22.0],[90.0,24.0],[89.5,25.5],[89.7,26.8],
];
function pointInPoly(lng, lat, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    const hit = (yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (hit) inside = !inside;
  }
  return inside;
}
function isIndia(lng, lat) {
  return pointInPoly(lng, lat, INDIA_MAIN) || pointInPoly(lng, lat, INDIA_NE);
}

/* land-dot unit vectors — shared with the persistent dot field (HeroField),
   which morphs its scattered background dots onto exactly these positions so
   the globe is literally built from the same dots that drift down the page */
window.__globeDots = (() => {
  const arr = [];
  for (let lat = -78; lat <= 84; lat += 2) {
    const rad = (lat * Math.PI) / 180;
    const circ = Math.cos(rad);
    const count = Math.max(1, Math.round(circ * 70));
    for (let k = 0; k < count; k++) {
      const lng = -180 + (360 * k) / count;
      if (!isLand(lng, lat)) continue;
      const lr = (lng * Math.PI) / 180;
      arr.push([Math.cos(rad) * Math.sin(lr), Math.sin(rad), Math.cos(rad) * Math.cos(lr)]);
    }
  }
  return arr;
})();

function Globe({ steps, posRef }) {
  const canvasRef = useRefJ(null);
  const dots = useRefJ(null);
  if (!dots.current) {
    const arr = [];
    // single uniform grid — India uses the exact same dot spacing/size as every
    // other landmass so it reads as part of the same dotted globe, not a filled blob
    for (let lat = -78; lat <= 84; lat += 2) {
      const rad = (lat * Math.PI) / 180;
      const circ = Math.cos(rad);
      const count = Math.max(1, Math.round(circ * 70));
      for (let k = 0; k < count; k++) {
        const lng = -180 + (360 * k) / count;
        if (!isLand(lng, lat)) continue;
        const lr = (lng * Math.PI) / 180;
        arr.push([Math.cos(rad) * Math.sin(lr), Math.sin(rad), Math.cos(rad) * Math.cos(lr), 0]);
      }
    }
    dots.current = arr;
  }

  // start the camera already aimed at the first city so there's no big opening
  // snap — from frame one the only motion is the slow continuous drift
  const cur = useRefJ({ yaw: (steps[0].lng * Math.PI) / 180, pitch: (steps[0].lat * Math.PI) / 180 });

  useEffectJ(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * dpr; canvas.height = r.height * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    const cityVec = (c) => [
      Math.cos(c.lat * Math.PI / 180) * Math.sin(c.lng * Math.PI / 180),
      Math.sin(c.lat * Math.PI / 180),
      Math.cos(c.lat * Math.PI / 180) * Math.cos(c.lng * Math.PI / 180),
    ];
    const n = steps.length;

    const draw = (t = performance.now()) => {
      raf = requestAnimationFrame(draw);
      // hard frame-rate cap: protects against environments where rAF fires
      // uncapped/back-to-back, so this heavy canvas never pegs the main thread
      if (t - (draw.last || 0) < 32) return;
      draw.last = t;
      const vr = canvas.getBoundingClientRect();
      if (vr.bottom < -50 || vr.top > window.innerHeight + 50) return; // pause off-screen
      const pos = posRef.current;                 // 0 .. n-1
      const index = Math.max(0, Math.min(n - 1, Math.floor(pos)));
      const frac = pos - index;
      const travel = frac < 0.3 ? 0 : (frac - 0.3) / 0.7;
      const nextI = Math.min(index + 1, n - 1);

      // interpolated target lat/lng (globe travels along route in last 30%)
      const tLng = steps[index].lng + (steps[nextI].lng - steps[index].lng) * travel;
      const tLat = steps[index].lat + (steps[nextI].lat - steps[index].lat) * travel;
      const tYaw = (tLng * Math.PI) / 180;
      const tPitch = (tLat * Math.PI) / 180;

      // entry animation: a small globe drifts on its own before the section takes
      // over the scroll, then eases into a scroll-locked zoom onto India
      const zoomRaw = Math.max(0, Math.min(1, pos / 0.55));
      const zoomT = zoomRaw * zoomRaw * (3 - 2 * zoomRaw); // smoothstep
      const autoSpin = 0.001 * (1 - zoomT) + 0.0004; // slower perpetual drift so the globe never sits fully static
      cur.current.yaw += autoSpin + (tYaw - cur.current.yaw) * (0.03 + zoomT * 0.055);
      cur.current.pitch += (tPitch - cur.current.pitch) * (0.03 + zoomT * 0.055);

      const W = canvas.width, H = canvas.height;
      const dim = Math.min(W, H);
      const RWide = dim * 0.30;    // little globe before the section locks in
      const RIndia = dim * 0.84;   // zoomed in further onto India without overflowing the frame
      const R = RWide + (RIndia - RWide) * zoomT;
      const cyWide = H * 0.64, cyIndia = H * 0.56;
      const cx = W / 2, cy = cyWide + (cyIndia - cyWide) * zoomT;
      ctx.clearRect(0, 0, W, H);

      const PITCH_VIEW = 0.20;                  // gentle tilt so the active city + route sit on the visible face
      const cosY = Math.cos(cur.current.yaw), sinY = Math.sin(cur.current.yaw);
      const cosX = Math.cos(cur.current.pitch + PITCH_VIEW), sinX = Math.sin(cur.current.pitch + PITCH_VIEW);
      const project = ([x, y, z]) => {
        let x1 = x * cosY - z * sinY;
        let z1 = x * sinY + z * cosY;
        let y2 = y * cosX - z1 * sinX;
        let z2 = y * sinX + z1 * cosX;
        return [cx + x1 * R, cy - y2 * R, z2];
      };

      // solid sphere disc (reads as a dome behind the dots) — gradient sized to the
      // canvas itself (not R) so it keeps the same soft shading at any zoom level
      // instead of washing out to a flat pale tone once R grows past the frame
      const dome = Math.min(W, H);
      const grad = ctx.createRadialGradient(cx - dome * 0.16, cy - dome * 0.18, dome * 0.06, cx, cy, dome * 0.68);
      grad.addColorStop(0, 'rgba(250,249,246,1)');
      grad.addColorStop(0.55, 'rgba(224,220,208,1)');
      grad.addColorStop(1, 'rgba(182,177,162,1)');
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.02, 0, Math.PI * 2);
      ctx.fillStyle = grad; ctx.fill();
      ctx.lineWidth = 1.5 * dpr; ctx.strokeStyle = 'rgba(24,22,15,0.28)'; ctx.stroke();

      // land dots (ink on white) — India traced points render denser/darker so the
      // coastline reads clearly once zoomed; rest-of-world dots stay as faint context
      for (const d of dots.current) {
        const [sx, sy, z] = project(d);
        if (z < 0) continue;
        const depth = (z + 1) / 2;
        const size = (1.6 + depth * 3.4) * dpr;
        ctx.globalAlpha = 0.42 + depth * 0.55;
        ctx.fillStyle = '#8f8b7d';
        ctx.beginPath(); ctx.arc(sx, sy, size, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // route arcs (slerp) for completed + current segment
      const drawArc = (ca, cb, amt, col = 'rgba(240,83,28,0.98)', lw = 3.6, glow = true) => {
        const a = cityVec(ca), b = cityVec(cb);
        const dot = Math.max(-1, Math.min(1, a[0]*b[0]+a[1]*b[1]+a[2]*b[2]));
        const omega = Math.acos(dot) || 1e-4;
        const lift = 0.16;
        ctx.beginPath();
        let started = false;
        const SEG = 40;
        for (let s = 0; s <= SEG; s++) {
          const t = (s / SEG) * amt;
          const k1 = Math.sin((1 - t) * omega) / Math.sin(omega);
          const k2 = Math.sin(t * omega) / Math.sin(omega);
          let vx = a[0]*k1 + b[0]*k2, vy = a[1]*k1 + b[1]*k2, vz = a[2]*k1 + b[2]*k2;
          const len = Math.hypot(vx, vy, vz) || 1;
          const bulge = 1 + lift * Math.sin(Math.PI * t);
          vx = vx/len*bulge; vy = vy/len*bulge; vz = vz/len*bulge;
          const [sx, sy, zz] = project([vx, vy, vz]);
          if (zz < -0.05) { started = false; continue; }
          if (!started) { ctx.moveTo(sx, sy); started = true; } else ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = col;
        ctx.lineWidth = lw * dpr;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        if (glow) { ctx.shadowColor = 'rgba(240,83,28,0.5)'; ctx.shadowBlur = 14 * dpr; }
        ctx.stroke();
        ctx.shadowBlur = 0;
      };
      // faint full route underlay so the whole path is always readable
      for (let i = 0; i < n - 1; i++) drawArc(steps[i], steps[i + 1], 1, 'rgba(240,83,28,1)', 3.6, true);
      // bright traveled portion on top
      for (let i = 0; i < index; i++) drawArc(steps[i], steps[i + 1], 1);
      if (travel > 0 && index < n - 1) drawArc(steps[index], steps[index + 1], travel);

      // city pins
      steps.forEach((c, i) => {
        const [sx, sy, z] = project(cityVec(c));
        if (z < -0.1) return;
        const isActive = (i === index && travel < 0.5) || (i === nextI && travel >= 0.5);
        const vis = Math.max(0, Math.min(1, (z + 0.1) / 0.4));
        if (isActive) {
          ctx.globalAlpha = vis;
          ctx.strokeStyle = 'rgba(240,83,28,.5)'; ctx.lineWidth = 1.6 * dpr;
          ctx.beginPath(); ctx.arc(sx, sy, 13 * dpr, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.globalAlpha = vis * (isActive ? 1 : 0.55);
        ctx.fillStyle = isActive ? '#F0531C' : '#8a8678';
        if (isActive) { ctx.shadowColor = 'rgba(240,83,28,.7)'; ctx.shadowBlur = 16 * dpr; }
        ctx.beginPath(); ctx.arc(sx, sy, (isActive ? 5.5 : 2.6) * dpr, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        if (isActive && z > 0.05) {
          ctx.globalAlpha = vis;
          ctx.fillStyle = '#F0531C';
          ctx.font = `700 ${19 * dpr}px "JetBrains Mono", monospace`;
          ctx.textBaseline = 'middle';
          ctx.fillText(c.city, sx + 16 * dpr, sy - 14 * dpr);
        }
      });
      ctx.globalAlpha = 1;
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="globe-holder">
      <div className="globe-glow"></div>
      <canvas className="globe-canvas" ref={canvasRef}></canvas>
    </div>
  );
}

function Journey() {
  const steps = window.PORT.journey;
  const n = steps.length;
  const [active, setActive] = useStateJ(0);
  const [cardOn, setCardOn] = useStateJ(true);
  const sectionRef = useRefJ(null);
  const posRef = useRefJ(0);

  useEffectJ(() => {
    let ticking = false;
    const compute = () => {
      ticking = false;
      const el = sectionRef.current; if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = Math.max(1, el.offsetHeight - window.innerHeight);
      const p = Math.max(0, Math.min(1, -rect.top / scrollable)) || 0;
      // match hero.jsx: the first FORM slice assembles the globe; travel (and the
      // detail card) only begin AFTER the globe has formed.
      const FORM = 0.16;
      const pt = Math.max(0, (p - FORM) / (1 - FORM));
      const pos = Math.min(n - 1, pt * n);
      posRef.current = pos;
      const index = Math.max(0, Math.min(n - 1, Math.floor(pos)));
      const frac = pos - index;
      const travel = frac < 0.3 ? 0 : (frac - 0.3) / 0.7;
      const shownIndex = travel >= 0.5 ? Math.min(index + 1, n - 1) : index;
      const appear = Math.min(1, frac / 0.12);
      const disappear = 1 - Math.min(1, Math.max(0, (frac - 0.3) / 0.7));
      const vis = index >= n - 1 ? 1 : Math.min(appear, disappear);
      const safe = Number.isFinite(shownIndex) ? Math.max(0, Math.min(n - 1, shownIndex)) : 0;
      setActive((cur) => (cur !== safe ? safe : cur));
      setCardOn(vis > 0.5);
    };
    // rAF-throttled: scroll can fire far more often than the browser paints;
    // this keeps the state update path to at most once per frame
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(compute);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    compute();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const s = steps[active] || steps[0];

  return (
    <section className="globe-section" id="journey" ref={sectionRef} style={{ height: `${(n + 1) * 100}vh` }}>
      <div className="globe-stage">
        <div className="globe-glow"></div>

        <div className={`globe-card ${cardOn ? 'show' : ''}`} key={active}>
          <div className="pin"><span className="pindot"></span> {s.city}</div>
          <div className="yr">{s.yr}</div>
          <div className="role">{s.role}</div>
          <div className="org">{s.org}</div>
          <div className="note">{s.note}</div>
        </div>

        <div className="globe-progress">
          {steps.map((_, i) => (
            <span key={i} className={i === active ? 'on' : ''}></span>
          ))}
        </div>
      </div>
    </section>
  );
}

window.Journey = Journey;
