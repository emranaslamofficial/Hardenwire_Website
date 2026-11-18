// ---------------------------------------------------------------------------
// Site-wide data: brand, categories, authors, navigation.
// In a CMS migration these become: site options, taxonomy terms, user profiles.
// ---------------------------------------------------------------------------

export const SITE = {
  name: 'Hardenwire',
  domain: 'hardenwire.com',
  url: 'https://hardenwire.com', // canonical base. Change once the domain is live
  tagline: 'Security and privacy, explained plainly.',
  description:
    'Hardenwire is an independent publication covering cybersecurity, privacy and online safety, with practical guides and plain-English explainers you can act on.',
  locale: 'en_US',
  twitter: '@hardenwire', // placeholder handle, not yet registered
  email: {
    editorial: 'editors@hardenwire.com',
    corrections: 'corrections@hardenwire.com',
    privacy: 'privacy@hardenwire.com',
    tips: 'tips@hardenwire.com',
  },
  founded: '2026',
};

// Parent hubs and sub-categories. `tone` drives the category accent colour.
export const CATEGORIES = [
  {
    slug: 'cybersecurity', name: 'Cybersecurity', parent: null, tone: 'ink',
    short: 'Accounts, devices and networks: how attacks work and the defences that stop them.',
    intro: `Most attacks on ordinary people aren't clever. They succeed because a password was reused, an update was postponed, or a router still had its factory login. This hub collects our guides to the fundamentals: protecting accounts, keeping devices clean, and locking down the network everything connects to. Start with whichever one you've been putting off.`,
    related: ['password-security', 'malware', 'network-security', 'online-safety'],
  },
  {
    slug: 'privacy', name: 'Privacy', parent: null, tone: 'plum',
    short: 'Who collects your data, what they do with it, and how to take back control.',
    intro: `Privacy is rarely lost in one dramatic moment. It leaks through app permissions you accepted years ago, cookies, data brokers, and accounts you forgot existed. Our privacy coverage explains where your information goes and gives you practical, proportionate steps to limit it. The goal isn't to vanish from the internet. It's to make sure the right people, and only the right people, can see what you share.`,
    related: ['data-privacy', 'vpn', 'identity-protection', 'browser-security'],
  },
  {
    slug: 'online-safety', name: 'Online Safety', parent: null, tone: 'amber',
    short: 'Scams, fraud and manipulation, and how to recognise them before they cost you.',
    intro: `Many online losses involve no hacking at all. The victim is persuaded to hand over a code, a password or a payment by someone convincingly posing as a bank, a delivery company or a support technician. These guides explain how the most common schemes unfold, the cues that give them away, and exactly what to do if you've already been caught.`,
    related: ['phishing', 'identity-protection', 'browser-security'],
  },
  {
    slug: 'password-security', name: 'Password Security', parent: 'cybersecurity', tone: 'ink',
    short: 'Passwords, passkeys, password managers and two-factor authentication.',
    intro: `Your accounts are only as strong as the way you sign in to them. This section covers moving from reused passwords to a password manager, choosing the strongest two-factor method each service offers, and adopting passkeys, which can't be phished in the way passwords can.`,
    related: ['identity-protection', 'phishing', 'mobile-security'],
  },
  {
    slug: 'phishing', name: 'Phishing & Scams', parent: 'online-safety', tone: 'amber',
    short: 'Fake emails, texts, calls and websites, and how to see through them.',
    intro: `Phishing is the most-reported category of internet crime because it works: it targets people, not software. Here we take apart real-world lures (urgent invoices, parcel texts, fake virus pop-ups, impostor support lines) so you can spot the pattern, plus step-by-step recovery if you clicked or called.`,
    related: ['online-safety', 'password-security', 'identity-protection'],
  },
  {
    slug: 'malware', name: 'Malware', parent: 'cybersecurity', tone: 'rust',
    short: 'Ransomware, spyware and infostealers: how infections happen and how to recover.',
    intro: `Modern malware is quiet. It steals saved passwords and session cookies, encrypts files for ransom, or watches what you type. Our malware guides explain how infections actually start, which warning signs are worth acting on, and how to recover without making things worse.`,
    related: ['mobile-security', 'browser-security', 'cybersecurity'],
  },
  {
    slug: 'vpn', name: 'VPN', parent: 'privacy', tone: 'teal',
    short: 'What VPNs really protect, what they don’t, and when you need one.',
    intro: `VPNs are sold with a lot of fear and some genuine benefit. We separate the two. These guides explain what a VPN changes about your connection, who it's useful for, the risks of free services, and the many threats a VPN does nothing about.`,
    related: ['network-security', 'privacy', 'browser-security'],
  },
  {
    slug: 'browser-security', name: 'Browser Security', parent: 'cybersecurity', tone: 'teal',
    short: 'Settings, extensions and habits for safer, more private browsing.',
    intro: `The browser is where you bank, shop, work and sign in to nearly everything, so it's also where most attacks and most tracking happen. These guides cover the settings worth changing, how to audit extensions, and how to recognise a fake site before you type into it.`,
    related: ['privacy', 'data-privacy', 'malware'],
  },
  {
    slug: 'mobile-security', name: 'Mobile Security', parent: 'cybersecurity', tone: 'ink',
    short: 'iPhone and Android security, app permissions and phone malware.',
    intro: `Your phone holds your two-factor codes, your banking apps, your photos and your location history, which makes it the most valuable device you own. Our mobile coverage explains real phone threats (and the overhyped ones), plus the settings that matter on iPhone and Android.`,
    related: ['malware', 'data-privacy', 'password-security'],
  },
  {
    slug: 'network-security', name: 'Network Security', parent: 'cybersecurity', tone: 'teal',
    short: 'Home routers, Wi-Fi, public hotspots and smart devices.',
    intro: `Every device you own trusts your home network, and most people haven't logged into their router since the day it was installed. This section covers securing that router, understanding Wi-Fi security, using public hotspots sensibly, and keeping smart-home gadgets from becoming the weak link.`,
    related: ['vpn', 'cybersecurity', 'online-safety'],
  },
  {
    slug: 'data-privacy', name: 'Data Privacy', parent: 'privacy', tone: 'plum',
    short: 'Tracking, cookies, data brokers and your digital footprint.',
    intro: `Data about you is collected by apps, websites, advertisers and brokers who sell it on. These guides show you how to see what's out there, opt out where you can, and change the defaults that leak the most, without giving up the services you rely on.`,
    related: ['privacy', 'browser-security', 'identity-protection'],
  },
  {
    slug: 'identity-protection', name: 'Identity Protection', parent: 'privacy', tone: 'rust',
    short: 'Data breaches, identity theft, credit freezes and account recovery.',
    intro: `When a company you use is breached, the damage to you depends on what you do next. These guides lay out practical responses to breaches and identity theft: which accounts to secure first, when to freeze your credit, and how to watch for misuse.`,
    related: ['password-security', 'data-privacy', 'phishing'],
  },
];

export const catBySlug = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

// Placeholder editorial profiles. Replace them with real contributors before
// launch. Never publish invented credentials (see README, "Before launch").
export const AUTHORS = [
  {
    slug: 'daniel-okafor', name: 'Daniel Okafor', role: 'Security Editor',
    beat: ['password-security', 'malware', 'identity-protection'],
    bio: 'Daniel edits Hardenwire’s account- and device-security coverage. He writes about authentication, malware and what to do in the hours after something goes wrong, and he tests every step-by-step guide on real hardware before it is published.',
    short: 'Covers authentication, malware and incident response for everyday users.',
  },
  {
    slug: 'lena-marsh', name: 'Lena Marsh', role: 'Privacy Editor',
    beat: ['privacy', 'data-privacy', 'browser-security', 'vpn'],
    bio: 'Lena leads privacy coverage, from browser tracking and data brokers to VPNs and app permissions. Her focus is proportionate privacy: the handful of changes that remove the most exposure without making technology miserable to use.',
    short: 'Writes about tracking, data brokers, browsers and VPNs.',
  },
  {
    slug: 'priya-raman', name: 'Priya Raman', role: 'Online Safety Reporter',
    beat: ['online-safety', 'phishing'],
    bio: 'Priya reports on scams and fraud: phishing, impersonation calls, fake shops and the social engineering behind them. She collects real lures sent in by readers and takes them apart so others can recognise the pattern.',
    short: 'Reports on scams, phishing and social engineering.',
  },
  {
    slug: 'tomas-vidal', name: 'Tomás Vidal', role: 'Networks & Devices Editor',
    beat: ['network-security', 'mobile-security'],
    bio: 'Tomás covers home networks, Wi-Fi, routers and phones. He writes the guides you follow with the device in one hand, which means he spends a lot of time in router admin panels and settings menus that change with every update.',
    short: 'Covers routers, Wi-Fi, home networks and phones.',
  },
];

export const authorBySlug = Object.fromEntries(AUTHORS.map((a) => [a.slug, a]));

// Primary navigation (desktop + mobile)
export const NAV = [
  { label: 'Cybersecurity', href: 'category/cybersecurity.html', slug: 'cybersecurity' },
  { label: 'Privacy', href: 'category/privacy.html', slug: 'privacy' },
  { label: 'Online Safety', href: 'category/online-safety.html', slug: 'online-safety' },
  { label: 'Guides', href: 'articles.html', slug: 'articles' },
  { label: 'Resources', href: 'resources.html', slug: 'resources' },
];

// "Briefing" items for the homepage. Short, sourced, dated advisories.
// In production these would come from a news CMS collection.
export const BRIEFINGS = [
  {
    date: '2026-04-07', label: 'Report',
    title: 'Phishing tops FBI complaint list again',
    text: 'The FBI’s 2025 Internet Crime Report logged just over one million complaints. Phishing and spoofing were again the most-reported category.',
    source: { name: 'FBI IC3', url: 'https://www.ic3.gov/' },
    link: 'how-to-spot-a-phishing-email',
  },
  {
    date: '2026-04-07', label: 'Trend',
    title: 'AI scams get their own category',
    text: 'For the first time, the IC3 report broke out complaints involving AI tools such as voice cloning. Agree a family code word for urgent calls.',
    source: { name: 'FBI IC3', url: 'https://www.ic3.gov/' },
    link: 'tech-support-scams',
  },
  {
    date: '2026-10-01', label: 'Advice',
    title: 'Passkeys are now widely supported',
    text: 'Most major platforms now let you sign in with a passkey. If an account you care about offers one, it is worth switching.',
    source: { name: 'FIDO Alliance', url: 'https://fidoalliance.org/passkeys/' },
    link: 'passkeys-explained',
  },
];

// Resources page data (external, reputable, non-affiliate)
export const RESOURCES = [
  {
    group: 'Check & report',
    items: [
      { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com/', desc: 'Free breach-notification service. Check whether an email address appears in known data breaches, and sign up for alerts.' },
      { name: 'ReportFraud.ftc.gov', url: 'https://reportfraud.ftc.gov/', desc: 'The U.S. Federal Trade Commission’s portal for reporting scams, fraud and bad business practices.' },
      { name: 'IdentityTheft.gov', url: 'https://www.identitytheft.gov/', desc: 'FTC recovery planner for U.S. residents, which builds a personalised checklist after identity theft.' },
      { name: 'FBI IC3', url: 'https://www.ic3.gov/', desc: 'The FBI’s Internet Crime Complaint Center, for reporting cyber-enabled crime in the U.S.' },
      { name: 'NCSC — Report a scam', url: 'https://www.ncsc.gov.uk/collection/phishing-scams', desc: 'UK National Cyber Security Centre guidance, including how to forward suspicious emails and texts.' },
    ],
  },
  {
    group: 'Official guidance',
    items: [
      { name: 'CISA — Secure Our World', url: 'https://www.cisa.gov/secure-our-world', desc: 'The U.S. Cybersecurity and Infrastructure Security Agency’s plain-language basics for individuals and families.' },
      { name: 'NCSC — Cyber Aware', url: 'https://www.ncsc.gov.uk/cyberaware/home', desc: 'Six practical actions from the UK’s NCSC to improve personal security.' },
      { name: 'NIST SP 800-63B', url: 'https://pages.nist.gov/800-63-4/sp800-63b.html', desc: 'The U.S. standard for digital authentication. The source of modern password-length and MFA guidance.' },
      { name: 'EFF Surveillance Self-Defense', url: 'https://ssd.eff.org/', desc: 'Electronic Frontier Foundation guides to privacy tools and threat modelling.' },
    ],
  },
  {
    group: 'Privacy tools',
    items: [
      { name: 'Privacy Badger', url: 'https://privacybadger.org/', desc: 'Free browser extension from the EFF that learns to block invisible trackers.' },
      { name: 'uBlock Origin', url: 'https://github.com/gorhill/uBlock', desc: 'Open-source content blocker that blocks ads and trackers, with low resource use.' },
      { name: 'Firefox', url: 'https://www.mozilla.org/firefox/', desc: 'Browser from the non-profit Mozilla Foundation, with Enhanced Tracking Protection on by default.' },
      { name: 'Signal', url: 'https://signal.org/', desc: 'End-to-end encrypted messaging and calls from a non-profit foundation.' },
    ],
  },
  {
    group: 'Accounts & authentication',
    items: [
      { name: 'passkeys.directory', url: 'https://passkeys.directory/', desc: 'Community-maintained list of websites and apps that support passkeys.' },
      { name: '2FA Directory', url: 'https://2fa.directory/', desc: 'Searchable list of which services support which two-factor methods.' },
      { name: 'Bitwarden', url: 'https://bitwarden.com/', desc: 'Open-source password manager with a free tier.' },
      { name: 'FIDO Alliance — Passkeys', url: 'https://fidoalliance.org/passkeys/', desc: 'The industry body behind the passkey standard, with explanations and adoption news.' },
    ],
  },
];

// Font presets the admin panel can switch between (Settings → Typography).
// display = headlines, serif = article text, sans = interface.
export const FONT_PRESETS = {
  editorial: {
    label: 'Editorial (Playfair Display + Lora + Inter)',
    display: "'Playfair Display', Georgia, serif", serif: "'Lora', Georgia, serif", sans: "'Inter', system-ui, Arial, sans-serif",
    google: 'family=Playfair+Display:wght@500..800&family=Lora:wght@400..700&family=Inter:wght@400..700',
  },
  classic: {
    label: 'Classic (Lora + DM Sans)',
    display: "'Lora', Georgia, serif", serif: "'Lora', Georgia, serif", sans: "'DM Sans', system-ui, Arial, sans-serif",
    google: 'family=Lora:wght@400..700&family=DM+Sans:opsz,wght@9..40,400..700',
  },
  bookish: {
    label: 'Bookish (Libre Baskerville + Source Serif + Source Sans)',
    display: "'Libre Baskerville', Georgia, serif", serif: "'Source Serif 4', Georgia, serif", sans: "'Source Sans 3', system-ui, Arial, sans-serif",
    google: 'family=Libre+Baskerville:wght@400;700&family=Source+Serif+4:opsz,wght@8..60,400..700&family=Source+Sans+3:wght@400..700',
  },
  modern: {
    label: 'Modern (Inter throughout)',
    display: "'Inter', system-ui, Arial, sans-serif", serif: "'Inter', system-ui, Arial, sans-serif", sans: "'Inter', system-ui, Arial, sans-serif",
    google: 'family=Inter:wght@400..800',
  },
};
