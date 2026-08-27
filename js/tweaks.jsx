const { useState: useStateT, useEffect: useEffectT, useMemo: useMemoT } = React;

const PREVIEW_MODE = new URLSearchParams(location.search).has('preview');

const DEVICES = {
  desktop: { label: 'Desktop', w: null, h: null },
  tablet:  { label: 'Tablet',  w: 834,  h: 1112 },
  mobile:  { label: 'Mobile',  w: 390,  h: 844  },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "device": "desktop",
  "maxWidth": 1200,
  "typeScale": 100
}/*EDITMODE-END*/;

/* device-frame overlay that renders the real page in an iframe so the
   site's own viewport media queries fire at the chosen device width */
function DevicePreview({ device, onClose }) {
  const d = DEVICES[device];
  const [scale, setScale] = useStateT(1);

  useEffectT(() => {
    const fit = () => {
      const availH = window.innerHeight - 132;
      const availW = window.innerWidth - 96;
      setScale(Math.min(1, availH / d.h, availW / d.w));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [device]);

  return (
    <div className="tw-preview-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="tw-preview-bar">
        <span className="tw-preview-dev">{d.label}</span>
        <span className="tw-preview-dim">{d.w} × {d.h}</span>
        <button className="tw-preview-close" onClick={onClose} aria-label="Exit preview">Exit ✕</button>
      </div>
      <div className="tw-device" style={{ width: d.w * scale, height: d.h * scale }}>
        <iframe
          title={`${d.label} preview`}
          src="Portfolio.html?preview=1"
          style={{ width: d.w, height: d.h, transform: `scale(${scale})`, transformOrigin: 'top left', border: 'none' }}
        />
      </div>
    </div>
  );
}

function PortfolioTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  /* apply responsive CSS variables to the live document (runs in the iframe too) */
  useEffectT(() => {
    document.documentElement.style.setProperty('--maxw', t.maxWidth + 'px');
    document.documentElement.style.fontSize = (16 * t.typeScale / 100) + 'px';
  }, [t.maxWidth, t.typeScale]);

  /* in the iframe we only mirror the CSS-var tweaks — no panel, no overlay */
  if (PREVIEW_MODE) return null;

  return (
    <React.Fragment>
      {t.device !== 'desktop' && (
        <DevicePreview device={t.device} onClose={() => setTweak('device', 'desktop')} />
      )}
      <TweaksPanel>
        <TweakSection label="Responsive preview" />
        <TweakRadio
          label="Viewport"
          value={t.device}
          options={['desktop', 'tablet', 'mobile']}
          onChange={(v) => setTweak('device', v)}
        />
        <TweakSection label="Layout" />
        <TweakSlider
          label="Content width" value={t.maxWidth} min={960} max={1440} step={20} unit="px"
          onChange={(v) => setTweak('maxWidth', v)}
        />
        <TweakSlider
          label="Type scale" value={t.typeScale} min={85} max={115} step={1} unit="%"
          onChange={(v) => setTweak('typeScale', v)}
        />
      </TweaksPanel>
    </React.Fragment>
  );
}

window.PortfolioTweaks = PortfolioTweaks;
window.PREVIEW_MODE = PREVIEW_MODE;
