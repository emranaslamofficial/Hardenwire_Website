// ---------------------------------------------------------------------------
// Original editorial cover illustrations, generated as lightweight SVG.
// Each article gets a motif and a category tone. Replace them with
// commissioned art or licensed photography later: only the file paths are
// referenced from the templates.
// ---------------------------------------------------------------------------

export const TONES = {
  // Neutral, cool backgrounds only: no yellow or cream. Red is the single accent.
  ink:   { bg: '#eef1f5', mid: '#d5dbe4', deep: '#14181f', soft: '#a7b0bd' },
  teal:  { bg: '#eef2f2', mid: '#d4dcdc', deep: '#14181f', soft: '#a3b0b0' },
  plum:  { bg: '#f1f0f4', mid: '#dadae3', deep: '#14181f', soft: '#aaa9b8' },
  amber: { bg: '#f3f3f4', mid: '#dcdde0', deep: '#14181f', soft: '#aeb1b7' },
  rust:  { bg: '#f6eff0', mid: '#e6d6d9', deep: '#14181f', soft: '#bba5a9' },
};
const ACCENT = '#c8102e';
const PAPER = '#ffffff';

const s = (t) => `stroke="${t.deep}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"`;

const MOTIFS = {
  envelope: (t) => `
    <rect x="650" y="190" width="400" height="270" rx="18" fill="${PAPER}" ${s(t)}/>
    <path d="M650 214 L850 350 L1050 214" fill="none" ${s(t)}/>
    <path d="M760 120 v70" ${s(t)}/>
    <path d="M760 120 c0-40 60-40 60 0" fill="none" ${s(t)}/>
    <path d="M905 520 v-60 m0 60 c0 34 -46 34 -46 4" fill="none" stroke="${ACCENT}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="1040" cy="200" r="34" fill="${ACCENT}"/>
    <path d="M1040 182 v20 M1040 214 v2" stroke="${PAPER}" stroke-width="7" stroke-linecap="round"/>`,
  key: (t) => `
    <rect x="700" y="130" width="230" height="400" rx="34" fill="${PAPER}" ${s(t)}/>
    <path d="M785 160 h60" ${s(t)}/>
    <circle cx="815" cy="300" r="62" fill="none" stroke="${t.soft}" stroke-width="5"/>
    <path d="M775 300 c0-50 80-50 80 0 v24 M795 300 c0-22 40-22 40 0 v40 M815 300 v58" fill="none" ${s(t)}/>
    <circle cx="1010" cy="380" r="46" fill="${ACCENT}"/>
    <circle cx="1010" cy="380" r="16" fill="${PAPER}"/>
    <path d="M1010 426 v110 M1010 480 h34 M1010 512 h24" stroke="${ACCENT}" stroke-width="12" stroke-linecap="round"/>`,
  layers: (t) => `
    <rect x="760" y="140" width="300" height="170" rx="16" fill="${t.mid}" ${s(t)}/>
    <rect x="710" y="230" width="300" height="170" rx="16" fill="${PAPER}" ${s(t)}/>
    <rect x="660" y="320" width="300" height="170" rx="16" fill="${PAPER}" ${s(t)}/>
    <path d="M760 405 l35 35 l70 -75" fill="none" stroke="${ACCENT}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M750 275 h120 M750 300 h80" stroke="${t.soft}" stroke-width="7" stroke-linecap="round"/>`,
  router: (t) => `
    <rect x="640" y="330" width="420" height="140" rx="22" fill="${PAPER}" ${s(t)}/>
    <path d="M720 330 l-30 -150 M980 330 l30 -150" ${s(t)}/>
    <circle cx="710" cy="400" r="10" fill="${ACCENT}"/>
    <circle cx="750" cy="400" r="10" fill="${t.deep}"/>
    <circle cx="790" cy="400" r="10" fill="${t.deep}"/>
    <path d="M880 400 h130" stroke="${t.soft}" stroke-width="7" stroke-linecap="round"/>
    <path d="M800 210 a70 70 0 0 1 100 0 M770 180 a110 110 0 0 1 160 0" fill="none" stroke="${t.soft}" stroke-width="7" stroke-linecap="round"/>
    <path d="M690 470 v40 M1010 470 v40" ${s(t)}/>`,
  wifi: (t) => `
    <path d="M700 250 a210 210 0 0 1 300 0" fill="none" ${s(t)}/>
    <path d="M745 300 a145 145 0 0 1 210 0" fill="none" ${s(t)}/>
    <path d="M790 350 a80 80 0 0 1 120 0" fill="none" ${s(t)}/>
    <circle cx="850" cy="400" r="16" fill="${t.deep}"/>
    <rect x="930" y="380" width="130" height="110" rx="14" fill="${ACCENT}"/>
    <path d="M960 380 v-30 c0-44 70-44 70 0" fill="none" stroke="${ACCENT}" stroke-width="10" stroke-linecap="round"/>
    <path d="M640 520 h180 c0 40 -30 60 -90 60 s-90 -20 -90 -60 z" fill="${PAPER}" ${s(t)}/>
    <path d="M820 535 c30 0 30 30 0 30" fill="none" ${s(t)}/>`,
  tunnel: (t) => `
    <circle cx="680" cy="340" r="60" fill="${PAPER}" ${s(t)}/>
    <circle cx="1040" cy="340" r="60" fill="${PAPER}" ${s(t)}/>
    <path d="M740 310 h240 M740 370 h240" ${s(t)}/>
    <path d="M760 340 h200" stroke="${ACCENT}" stroke-width="9" stroke-dasharray="2 22" stroke-linecap="round"/>
    <path d="M660 340 h40 M1020 340 h40" stroke="${t.soft}" stroke-width="7" stroke-linecap="round"/>
    <path d="M760 200 c0-60 80-80 110-40 c20-50 110-40 110 20 c40 0 50 60 0 60 h-210 c-50 0 -50 -50 -10 -40 z" fill="${t.mid}" stroke="none" opacity=".8"/>`,
  idcard: (t) => `
    <rect x="640" y="190" width="440" height="280" rx="22" fill="${PAPER}" ${s(t)}/>
    <circle cx="740" cy="300" r="46" fill="${t.mid}" ${s(t)}/>
    <path d="M690 400 c10-40 90-40 100 0" fill="none" ${s(t)}/>
    <path d="M840 270 h170 M840 310 h130 M840 350 h150" stroke="${t.soft}" stroke-width="8" stroke-linecap="round"/>
    <path d="M940 190 l-30 70 l40 40 l-50 60 l30 50 l-20 60" fill="none" stroke="${ACCENT}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`,
  phone: (t) => `
    <rect x="690" y="120" width="240" height="430" rx="36" fill="${PAPER}" ${s(t)}/>
    <path d="M780 150 h60" ${s(t)}/>
    <rect x="725" y="190" width="70" height="70" rx="14" fill="${t.mid}"/>
    <rect x="825" y="190" width="70" height="70" rx="14" fill="${t.mid}"/>
    <rect x="725" y="290" width="70" height="70" rx="14" fill="${ACCENT}"/>
    <rect x="825" y="290" width="70" height="70" rx="14" fill="${t.mid}"/>
    <circle cx="1000" cy="380" r="72" fill="none" ${s(t)}/>
    <path d="M1052 432 l60 60" stroke="${t.deep}" stroke-width="14" stroke-linecap="round"/>
    <path d="M985 365 l30 30 M1015 365 l-30 30" stroke="${ACCENT}" stroke-width="8" stroke-linecap="round"/>`,
  lockfile: (t) => `
    <path d="M660 140 h200 l70 70 v300 h-270 z" fill="${PAPER}" ${s(t)}/>
    <path d="M860 140 v70 h70" fill="none" ${s(t)}/>
    <path d="M700 260 h150 M700 300 h180 M700 340 h120" stroke="${t.soft}" stroke-width="8" stroke-linecap="round"/>
    <rect x="890" y="330" width="170" height="150" rx="18" fill="${ACCENT}"/>
    <path d="M925 330 v-40 c0-70 100-70 100 0 v40" fill="none" stroke="${t.deep}" stroke-width="12" stroke-linecap="round"/>
    <circle cx="975" cy="395" r="14" fill="${PAPER}"/><path d="M975 405 v30" stroke="${PAPER}" stroke-width="9" stroke-linecap="round"/>`,
  browser: (t) => `
    <rect x="620" y="150" width="480" height="340" rx="18" fill="${PAPER}" ${s(t)}/>
    <path d="M620 210 h480" ${s(t)}/>
    <circle cx="655" cy="180" r="8" fill="${ACCENT}"/><circle cx="685" cy="180" r="8" fill="${t.soft}"/><circle cx="715" cy="180" r="8" fill="${t.soft}"/>
    <rect x="760" y="168" width="300" height="24" rx="12" fill="${t.mid}"/>
    <path d="M720 350 c60-80 200-80 260 0 c-60 80 -200 80 -260 0 z" fill="none" ${s(t)}/>
    <circle cx="850" cy="350" r="34" fill="${t.deep}"/>
    <path d="M730 440 l240 -180" stroke="${ACCENT}" stroke-width="10" stroke-linecap="round"/>`,
  footprint: (t) => `
    <path d="M640 500 C 720 420, 700 300, 800 280 S 930 330, 980 220 S 1060 140, 1090 150" fill="none" stroke="${t.soft}" stroke-width="7" stroke-dasharray="4 20" stroke-linecap="round"/>
    <circle cx="640" cy="500" r="22" fill="${t.deep}"/>
    <circle cx="800" cy="280" r="22" fill="${t.deep}"/>
    <circle cx="980" cy="220" r="22" fill="${t.deep}"/>
    <circle cx="1090" cy="150" r="30" fill="${ACCENT}"/>
    <rect x="700" y="360" width="150" height="90" rx="12" fill="${PAPER}" ${s(t)}/>
    <path d="M725 390 h100 M725 420 h60" stroke="${t.soft}" stroke-width="7" stroke-linecap="round"/>
    <rect x="900" y="290" width="150" height="90" rx="12" fill="${PAPER}" ${s(t)}/>
    <path d="M925 320 h100 M925 350 h70" stroke="${t.soft}" stroke-width="7" stroke-linecap="round"/>`,
  popup: (t) => `
    <rect x="620" y="140" width="440" height="300" rx="16" fill="${PAPER}" ${s(t)}/>
    <path d="M790 440 l-20 70 h140 l-20 -70" fill="none" ${s(t)}/>
    <rect x="700" y="210" width="280" height="160" rx="12" fill="${ACCENT}"/>
    <path d="M840 245 v55 M840 330 v4" stroke="${PAPER}" stroke-width="14" stroke-linecap="round"/>
    <path d="M1040 470 c-40 0 -70 -30 -70 -70 l30 -10 l20 40 l-15 15 c10 20 20 30 40 40 l15 -15 l40 20 l-10 30 c-20 0 -30 -50 -50 -50" fill="${t.mid}" stroke="${t.deep}" stroke-width="6" stroke-linejoin="round"/>`,
  shield: (t) => `
    <path d="M850 120 l200 70 v130 c0 120 -90 190 -200 230 c-110 -40 -200 -110 -200 -230 v-130 z" fill="${PAPER}" ${s(t)}/>
    <path d="M850 180 v370" stroke="${t.soft}" stroke-width="6"/>
    <path d="M770 340 l55 55 l105 -110" fill="none" stroke="${ACCENT}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>`,
  eye: (t) => `
    <path d="M640 340 c100-150 320-150 420 0 c-100 150 -320 150 -420 0 z" fill="${PAPER}" ${s(t)}/>
    <circle cx="850" cy="340" r="70" fill="${t.mid}" ${s(t)}/>
    <circle cx="850" cy="340" r="28" fill="${t.deep}"/>
    <path d="M680 520 l340 -360" stroke="${ACCENT}" stroke-width="11" stroke-linecap="round"/>`,
  alert: (t) => `
    <path d="M850 140 l220 380 h-440 z" fill="${PAPER}" ${s(t)}/>
    <path d="M850 270 v120 M850 445 v4" stroke="${ACCENT}" stroke-width="16" stroke-linecap="round"/>`,
};

export const CATEGORY_MOTIF = {
  cybersecurity: 'shield', privacy: 'eye', 'online-safety': 'alert',
  'password-security': 'key', phishing: 'envelope', malware: 'lockfile',
  vpn: 'tunnel', 'browser-security': 'browser', 'mobile-security': 'phone',
  'network-security': 'router', 'data-privacy': 'footprint', 'identity-protection': 'idcard',
};

export function coverSVG({ motif, tone = 'ink', title = '', seed = 1 }) {
  const t = TONES[tone] || TONES.ink;
  const draw = MOTIFS[motif] || MOTIFS.shield;
  // deterministic decorative offsets so covers in a category aren't identical
  // Calm, classic cover: plain tone, one centred motif, a single ground line.
  void seed;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" role="img" aria-label="${title.replace(/"/g, '&quot;')}">
  <rect width="1200" height="675" fill="${t.bg}"/>
  <path d="M120 590 H1080" stroke="${t.mid}" stroke-width="2"/>
  <g transform="translate(600 345) scale(.82) translate(-850 -340)">${draw(t)}</g>
</svg>`;
}
