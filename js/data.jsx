/* ============================ DATA ============================ */
window.PORT = {
  rotatingWords: ['Product', 'Motion', 'Visual', 'AI-Powered'],
  years: '4+',

  /* doodle annotations floating around the hero portrait —
     tied to his real credo: "Designing with curiosity, validating with data, building with purpose" */
  doodles: [
    { text: 'curiosity', sub: 'designing with', acc: true,  rot: -7,  pos: { top: '6%',  left: '-4%' },  scribble: 'underline' },
    { text: 'data',      sub: 'validating with', acc: false, rot: 5,   pos: { top: '30%', right: '-8%' }, scribble: 'arrow' },
    { text: 'purpose',   sub: 'building with',  acc: true,  rot: -4,  pos: { bottom: '20%', left: '-6%' }, scribble: 'circle' },
    { text: 'unique',    sub: null,             acc: false, rot: 8,   pos: { bottom: '7%', right: '-2%' }, scribble: 'bolt' },
  ],
  glyphs: [
    { g: 'Ps', c: '#2A6FE8', pos: { top: '4%',  right: '8%' },  float: true },
    { g: 'Ai', c: '#F0531C', pos: { top: '46%', left: '-12%' }, float: true },
    { g: 'Ae', c: '#7B4DFF', pos: { bottom: '30%', right: '-3%' }, float: true },
    { g: 'Fig', c: '#18160F', pos: { bottom: '4%', left: '12%' }, float: true },
  ],

  skills: [
    { name: 'Visual Design', icon: 'brand', quote: 'Typography, colour and layout — the craft of making a thing look inevitable.', tag: 'Type · colour · layout' },
    { name: 'Motion & Video', icon: 'story', quote: 'Stillness states a fact. Motion makes you feel it.', tag: 'After Effects · Premiere · reels' },
    { name: 'Product Design', icon: 'product', quote: "Design isn't how it looks — it's how it works.", tag: 'Flows · research · systems' },
    { name: 'Brand Identity', icon: 'trend', quote: "A brand is the gut feeling people have when you're not in the room.", tag: 'Rebrands · identity · voice' },
    { name: 'AI-Assisted Design', icon: 'system', quote: 'AI is the fastest intern I ever hired — I still make every final call.', tag: 'Prompting · generation · speed' },
    { name: 'Design Leadership', icon: 'mentor', quote: 'My best work is often helping other people do their best work.', tag: 'Reviews · mentoring · growth' },
  ],

  tools: [
    { name: 'Figma', sub: 'Interface, systems & whiteboarding', logo: 'figma.png', yrs: '6 yrs', level: 'pro', w: '96%' },
    { name: 'Adobe Creative Suite', sub: 'Photoshop, Illustrator, After Effects & Premiere', logo: 'adobe.svg', yrs: '7 yrs', level: 'pro', w: '93%' },
    { name: 'Blender · Spline', sub: '3D motion for the web', logo: 'blender.png', yrs: '3 yrs', level: 'adv', w: '72%' },
  ],

  /* AI TOOLS LAB — the everyday stack, flat list */
  aiTools: [
    { n: 'Midjourney', u: 'Image · concept', c: '#18160F', img: 'assets/tools/midjourney.png' },
    { n: 'Adobe Firefly', u: 'Image · brand-safe', c: '#EA7600', img: 'assets/tools/firefly.png' },
    { n: 'Kling AI', u: 'Video · cinematic', c: '#2A6FE8', img: 'assets/tools/kling.png' },
    { n: 'Notion AI', u: 'Docs · planning', c: '#444444', img: 'assets/tools/notion.png' },
    { n: 'Miro AI', u: 'Synthesis · maps', c: '#ffb700', img: 'assets/tools/miro.png' },
    { n: 'Figma AI', u: 'In-canvas assist', c: '#F0531C', img: 'assets/tools/figma.png' },
    { n: 'Cursor', u: 'Pair programming', c: '#2563EB', img: 'assets/tools/cursor.png' },
    { n: 'Stitch', u: 'UI · Google Labs', c: '#4285F4', img: 'assets/tools/stitch.png' },
    { n: 'ChatGPT', u: 'Ideation · copy', c: '#10A37F', img: 'assets/tools/chatgpt.png' },
    { n: 'Claude', u: 'Long-form · review', c: '#D97757', img: 'assets/tools/claude.png' },
  ],

  marquee: ['Graphic Design', 'Motion Graphics', 'Video Editing', 'Branding', 'Product Design', 'AI-Assisted', 'Figma', 'After Effects'],

  journey: [
    { yr: '2018 — 2021', city: 'Shillong', lat: 25.57, lng: 91.88, role: 'B.Des — Fashion & Lifestyle Accessories', org: 'National Institute of Fashion Technology (NIFT)', note: 'Where design became a discipline, not a hobby — foundations in craft, form and material.' },
    { yr: '2020', city: 'Indore', lat: 22.72, lng: 75.86, role: 'UX Researcher — Intern', org: 'Naaniz Seller Services', note: 'My first taste of shipping a real product — personas, journeys and prototypes from real research.' },
    { yr: '2022 — 2023', city: 'Jaipur', lat: 26.91, lng: 75.79, role: 'UI/UX Designer', org: 'GurujiAstro', note: 'Rode the platform from 200K to 2.5M+ downloads through visual and product design.' },
    { yr: '2023 — 2024', city: 'Bengaluru', lat: 12.97, lng: 77.59, role: 'Product & Brand Designer', org: 'Astro Bharat', note: 'Led the full rebrand and scaled it into a revenue-generating business in 6 months — 9K+ downloads in two.' },
    { yr: '2024 — Now', city: 'Mumbai', lat: 19.07, lng: 72.88, role: 'UI/UX & Creative Designer', org: 'Houzeo · US Real Estate', note: 'Made selling a house feel less like filing taxes — fewer steps, less friction, features people kept coming back to.' },
  ],

  projects: [
    { name: 'Houzeo', type: 'US Real Estate', tag: 'Collections · Quick Filters', link: 'Houzeo.html', img: 'assets/houzeo-logo.webp', contain: true, accent: '#2A6FE8', bg: '#ffffff' },
    { name: 'Arogana', type: 'Travel · Landing Page', tag: 'Landing Page · Booking flow', link: 'Arogana Case Study.html', img: 'assets/arogana-thumb.webp', accent: '#1C35B3', bg: '#e9e7e2' },
    { name: 'Astro Bharat', type: 'Astrology Platform', tag: 'Rebrand · 0→1 · 9K downloads', link: 'Astro Bharat Case Study.html', img: 'assets/astro-bharat-thumb.webp', accent: '#E08A2B', bg: '#B8892E' },
    { name: 'Nothing', type: 'Concept · Nothing OS', tag: 'Glyph UI · Widgets', link: 'Nothing Case Study.html', img: 'assets/nothing-phone.webp', contain: true, accent: '#D71921', bg: 'radial-gradient(120% 90% at 70% 30%, #f3f1ec, #e7e4dc 70%)', dots: true },
    { name: 'VietJet Air', type: 'Airline · UX Redesign', tag: 'Website Redesign · Booking flow', link: 'VietJet Air Case Study.html', img: 'assets/vietjet-thumb.webp', contain: true, accent: '#E12127', bg: '#E12127' },
    { name: 'New Web', type: 'Web3 · Landing Page', tag: 'Dark theme · Trust', link: 'New Web Case Study.html', img: 'assets/newweb/01.webp', contain: true, accent: '#D9A441', bg: 'radial-gradient(120% 120% at 60% 25%, #2a2620, #1a1712 65%, #0f0d0a)' },
    { name: 'Vokapp', type: 'Kids EdTech', tag: 'Mascot · Gamified UX', link: 'Vokapp Case Study.html', img: 'assets/vokapp-logo.webp', contain: true, accent: '#7c5cff', bg: '#ffffff' },
  ],

  blogs: [
    { n: '01', date: 'Apr 2025', tag: 'AI Tools', title: 'The AI tools I actually open every single day as a creative designer', teaser: 'My real stack — not the hype list.' },
    { n: '02', date: 'Feb 2025', tag: 'Opinion', title: 'Will Claude and AI design tools replace designers?', teaser: 'Spoiler: the role changes, not ends.' },
    { n: '03', date: 'Dec 2024', tag: 'Process', title: 'How I shipped a portfolio in code with Claude Design', teaser: 'Prompts, taste & guardrails.' },
  ],
};
