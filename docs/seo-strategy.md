# Hardenwire — SEO & Content Strategy

> **About the metrics.** No search volume or difficulty figures in this document
> come from a paid SEO tool. **Keyword difficulty (KD) is an editorial
> estimate**. It is based on who currently ranks for each kind of query: large
> vendor blogs, government sites, and major tech publications push KD up;
> forums, thin pages and older posts push it down. Check the shortlisted
> keywords in Ahrefs, Semrush, or Google Search Console (after launch) before
> committing to production volumes.
>
> KD scale: **Low** (a new site can rank with one strong page and internal
> links), **Medium** (needs topical depth and some links), **High** (dominated by
> brands, so treat as a long-term target).

---

## 1. Market research summary

### Who occupies the space

| Segment | Typical players | Strengths | Gaps a new publication can exploit |
|---|---|---|---|
| Security news outlets | Industry trade press, breach-news sites | Speed, scoops, B2B depth | Written for professionals. Little "what does this mean for me" follow-up |
| Vendor blogs (antivirus, VPN, password managers) | Security software companies | High domain authority, huge content libraries | Commercial bias: almost every article ends in "buy our product". Readers notice |
| Government & non-profit | CISA, FTC, NCSC (UK), EFF | Trust, accuracy | Thin on step-by-step detail, rarely updated per OS version, dry tone |
| Consumer tech publications | Mainstream tech sites | Reach, good how-to formats | Security is one beat among many. Guides go stale and are often affiliate-led |
| Forums & Q&A (Reddit, Stack Exchange) | Communities | Real questions, real language | Unreliable answers, no structure, rank because nothing better exists |

**Positioning:** Hardenwire is the **independent, explanatory** layer between
the government advice (trustworthy but dry) and vendor blogs (detailed but
self-interested). The editorial promise: *we explain the threat, tell you what
actually matters, and give you steps that work, with no product push.*

### Search patterns observed

- **Question-shaped queries dominate consumer security**: "is public wifi safe",
  "how do I know if my phone is hacked", "what happens if I click a phishing link".
  These have clear intent and appear in People Also Ask boxes, which makes them
  ideal for a new site.
- **Post-incident searches** ("I clicked a phishing link what now", "what to do
  after a data breach") have high urgency and convert well to newsletter
  sign-ups, because the reader is motivated right then.
- **"Do I need X" queries** (VPN, antivirus on Mac, antivirus on iPhone) are
  mostly answered by vendors with a stake in the answer. An honest answer stands
  out.
- **Settings walkthroughs** ("iPhone privacy settings", "Chrome privacy
  settings") are evergreen but need **scheduled updates** for each OS or
  browser release. A visible "Updated" date builds trust.
- **Trending in 2025–2026:** AI voice-cloning and impersonation scams; the FBI's
  2025 IC3 report added a dedicated AI-scam section and again listed
  phishing/spoofing as the most-reported complaint type. Also passkey adoption,
  government-impersonation scams, MFA-fatigue attacks, malicious browser
  extensions, and data-broker removal.

### Content formats that win

1. **Explainers** (What is X / How X works) for definitional queries
2. **Step-by-step guides** with numbered actions, time estimates and screenshots
3. **Incident playbooks** ("If this happened, do this, in this order")
4. **Comparisons** (SMS vs authenticator vs passkey) using tables
5. **Checklists** that people can save or print. Good link magnets
6. **Myth vs reality** pieces for misinformation-heavy topics (VPNs, public Wi-Fi)

---

## 2. Site architecture & topical clusters

```
Home
├── Cybersecurity (hub)
│   ├── Password Security   (passwords, managers, 2FA, passkeys)
│   ├── Malware             (ransomware, spyware, infostealers)
│   ├── Browser Security    (settings, extensions, safe browsing)
│   ├── Mobile Security     (iPhone, Android)
│   └── Network Security    (router, Wi-Fi, home network)
├── Privacy (hub)
│   ├── Data Privacy        (data brokers, footprint, tracking, cookies)
│   ├── VPN                 (guides, myths, choosing)
│   └── Identity Protection (breaches, identity theft, credit freezes)
└── Online Safety (hub)
    └── Phishing & Scams    (email, SMS, tech support, shopping, social)
```

Each **hub** page links down to all of its sub-categories. Each sub-category
links to its **pillar** article plus supporting articles. Every article links
**up** (breadcrumb, category badge), **sideways** (2–4 related articles in the body
and a related-articles module) and **down** to tools/resources.

---

## 3. Keyword clusters

Columns: **Intent** (I = informational, C = commercial investigation,
N = navigational, P = problem-solving/urgent). **KD** = estimate.
**Priority**: P1 = launch / first 90 days, P2 = months 3–6, P3 = later.
✅ = written for launch.

### 3.1 Cybersecurity basics

| Primary keyword | Intent | KD | Type | Suggested title | Secondary keywords | Related questions | Internal links | Priority |
|---|---|---|---|---|---|---|---|---|
| cybersecurity basics for beginners | I | Med | Pillar guide | Cybersecurity Basics: The 10 Habits That Stop Most Attacks | personal cybersecurity, cyber hygiene | What is the most important security habit? | Passkeys, 2FA, router, phishing | P1 |
| what is cyber hygiene | I | Low | Explainer | What "Cyber Hygiene" Actually Means (and a Monthly Routine) | digital hygiene checklist | How often should I update devices? | Basics pillar, digital footprint | P2 |
| how do hackers get your password | I | Med | Explainer | How Passwords Really Get Stolen — and Which Defences Work | credential stuffing, password leak | Can hackers guess my password? | Passkeys, 2FA, data breach | P1 |
| what is an attack surface personal | I | Low | Explainer | Your Personal Attack Surface, Mapped | reduce attack surface | — | Footprint, router | P3 |

### 3.2 Malware & ransomware

| Primary keyword | Intent | KD | Type | Suggested title | Secondary keywords | Related questions | Internal links | Priority |
|---|---|---|---|---|---|---|---|---|
| ✅ how to tell if your phone has malware | P | Med | Diagnostic guide | Is Your Phone Infected? Signs of Malware and What to Check First | phone virus signs, spyware on phone | Can iPhones get viruses? Does factory reset remove malware? | Mobile security, location privacy | P1 |
| ✅ ransomware for home users | I | Low | Explainer + plan | Ransomware at Home: How It Gets In and the Backup Plan That Beats It | ransomware protection, 3-2-1 backup | Should I pay the ransom? | Backups, phishing, updates | P1 |
| what is an infostealer | I | Low | Explainer | Infostealers: The Quiet Malware Behind Most Account Takeovers | session cookie theft, stealer logs | Can 2FA stop an infostealer? | 2FA, passkeys, browser security | P1 |
| do I need antivirus on mac | C | Med | Decision guide | Does a Mac Need Antivirus in 2026? An Honest Answer | mac malware, XProtect | Is Gatekeeper enough? | Mac security, malware | P2 |
| do I need antivirus for windows 11 | C | Med | Decision guide | Is Microsoft Defender Enough on Windows 11? | windows security settings | — | Windows hardening | P2 |
| how to remove malware from android | P | Med | How-to | Removing Malware From an Android Phone, Step by Step | safe mode android, malicious app | — | Phone malware | P2 |

### 3.3 Phishing & scams

| Primary keyword | Intent | KD | Type | Suggested title | Secondary keywords | Related questions | Internal links | Priority |
|---|---|---|---|---|---|---|---|---|
| ✅ how to spot a phishing email | I | Med | Annotated guide | How to Spot a Phishing Email: An Annotated Walkthrough | phishing email examples, signs of phishing | What happens if I click a phishing link? | Tech support scams, 2FA, passkeys | P1 |
| ✅ tech support scam | P | Low | Playbook | Tech Support Scams: How the Call Unfolds and What to Do If You Fell for One | fake virus warning, remote access scam | Can scammers still access my computer? | Phishing, data breach, malware | P1 |
| I clicked a phishing link what now | P | Low | Incident playbook | Clicked a Phishing Link? Do These Things in This Order | entered password on fake site | — | Phishing pillar, data breach | P1 |
| ai voice cloning scam | I/P | Low–Med | Explainer | AI Voice-Clone Scams: How a Family "Safe Word" Shuts Them Down | deepfake call, grandparent scam | Can scammers clone my voice from a video? | Phishing, identity | P1 |
| smishing text examples | I | Low | Gallery guide | Scam Texts Decoded: 12 Messages and What Gives Them Away | package delivery text scam, toll text scam | — | Phishing pillar | P1 |
| how to check if a website is legit | P | Med | Checklist | Is This Website Legit? A 2-Minute Check Before You Pay | fake online store, scam website checker | — | Browser security, shopping | P2 |
| government impersonation scam | I | Low | Explainer | Scammers Pretending to Be the Government: The Scripts They Use | IRS scam call, fake police call | — | Tech support scam | P2 |

### 3.4 Password & account security

| Primary keyword | Intent | KD | Type | Suggested title | Secondary keywords | Related questions | Internal links | Priority |
|---|---|---|---|---|---|---|---|---|
| ✅ what is a passkey | I | Med | Explainer | Passkeys Explained: How They Work and Whether You Should Switch | passkey vs password, are passkeys safe | What if I lose my phone? | 2FA, password security | P1 |
| ✅ types of two factor authentication | I/C | Med | Comparison | Two-Factor Authentication Methods, Ranked From Weakest to Strongest | sms 2fa vs authenticator app, security key | Is SMS 2FA safe? | Passkeys, phishing | P1 |
| how to choose a password manager | C | High | Buyer's guide (non-affiliate) | How to Choose a Password Manager Without Getting Sold To | best password manager features | Are password managers safe? | Passkeys, 2FA | P2 |
| how long should a password be | I | Med | Short answer | How Long Should a Password Be? What NIST Guidance Says | passphrase, password length | Do I need special characters? | Password manager | P2 |
| account recovery settings | P | Low | How-to | The Account-Recovery Settings Most People Forget | recovery codes, backup email | — | 2FA, passkeys | P2 |

### 3.5 Network, Wi-Fi & router security

| Primary keyword | Intent | KD | Type | Suggested title | Secondary keywords | Related questions | Internal links | Priority |
|---|---|---|---|---|---|---|---|---|
| ✅ how to secure your home router | P | Med | Checklist guide | How to Secure Your Home Router: A 10-Step Checklist | router security settings, change router password | Should I turn off WPS? | VPN, network | P1 |
| ✅ is public wifi safe | I | Med | Myth vs reality | Is Public Wi-Fi Safe? What the Real Risks Are in 2026 | public wifi security, coffee shop wifi | Do I need a VPN on public Wi-Fi? | VPN, browser | P1 |
| wpa3 vs wpa2 | I | Low | Comparison | WPA3 vs WPA2: Should You Switch Your Wi-Fi? | wifi security type | — | Router | P2 |
| guest network for smart devices | P | Low | How-to | Put Your Smart Devices on a Guest Network (and Why) | iot security home | — | Router | P2 |

### 3.6 Browser security

| Primary keyword | Intent | KD | Type | Suggested title | Secondary keywords | Related questions | Internal links | Priority |
|---|---|---|---|---|---|---|---|---|
| ✅ browser privacy settings | P | Med | Multi-browser walkthrough | The Browser Privacy Settings Worth Changing (Chrome, Firefox, Safari, Edge) | block third party cookies, tracking protection | Does incognito hide me? | Footprint, VPN | P1 |
| are browser extensions safe | I | Low | Explainer | Browser Extensions Are Software You Forgot You Installed | malicious extension, extension permissions | — | Browser privacy, infostealers | P1 |
| what does incognito mode do | I | Med | Short explainer | What Incognito Mode Hides — and the Much Longer List It Doesn't | private browsing | — | Browser privacy | P2 |

### 3.7 Privacy, data privacy & tracking

| Primary keyword | Intent | KD | Type | Suggested title | Secondary keywords | Related questions | Internal links | Priority |
|---|---|---|---|---|---|---|---|---|
| ✅ how to reduce your digital footprint | P | Med | Weekend project | How to Reduce Your Digital Footprint: A Weekend Plan | remove personal info from internet, data brokers | Can I delete myself from the internet? | Browser privacy, data breach | P1 |
| how to remove yourself from data broker sites | P | Med | How-to | Opting Out of Data Brokers: What Works, What Doesn't | people search removal | Are removal services worth it? | Footprint | P1 |
| what are third party cookies | I | Med | Explainer | Cookies, Explained Without the Jargon | cookie consent, tracking cookies | Should I accept cookies? | Browser privacy | P2 |
| iphone location privacy settings | P | Med | Settings guide | iPhone Location Settings: What to Turn Off and What to Keep | significant locations, precise location | — | Mobile security | P2 |
| social media privacy settings | P | Med | Hub how-to | Social Media Privacy Settings, Platform by Platform | instagram privacy, facebook privacy | — | Footprint | P2 |

### 3.8 VPN

| Primary keyword | Intent | KD | Type | Suggested title | Secondary keywords | Related questions | Internal links | Priority |
|---|---|---|---|---|---|---|---|---|
| ✅ do I need a vpn | C | High (but honest angle helps) | Decision guide | Do You Actually Need a VPN? A Straight Answer | what does a vpn protect, vpn myths | Does a VPN hide me from Google? | Public Wi-Fi, browser privacy | P1 |
| are free vpns safe | C | Med | Explainer | Free VPNs: What You Pay With Instead of Money | free vpn risks | — | VPN pillar | P2 |
| what does a vpn not protect | I | Low | Explainer | Seven Things a VPN Doesn't Protect You From | vpn limitations | — | VPN pillar, phishing | P2 |

### 3.9 Identity protection

| Primary keyword | Intent | KD | Type | Suggested title | Secondary keywords | Related questions | Internal links | Priority |
|---|---|---|---|---|---|---|---|---|
| ✅ what to do after a data breach | P | Med | Incident timeline | Your Data Was in a Breach. Here's What to Do — Hour by Hour | data breach notification, was my data leaked | Should I freeze my credit? | Passkeys, 2FA, footprint | P1 |
| how to freeze your credit | P | Med | How-to | How to Freeze Your Credit (It's Free and Takes 15 Minutes) | credit freeze vs lock | Does a freeze hurt my score? | Data breach | P1 |
| signs of identity theft | P | Med | Checklist | Early Warning Signs Someone Is Using Your Identity | identity theft red flags | — | Data breach | P2 |

---

## 4. Launch content (12 articles)

| # | Article | Category | Primary keyword |
|---|---|---|---|
| 1 | How to Spot a Phishing Email | Phishing & Scams | how to spot a phishing email |
| 2 | Passkeys Explained | Password Security | what is a passkey |
| 3 | Two-Factor Authentication Methods, Ranked | Password Security | types of two factor authentication |
| 4 | How to Secure Your Home Router | Network Security | how to secure your home router |
| 5 | Is Public Wi-Fi Safe? | Online Safety | is public wifi safe |
| 6 | Do You Actually Need a VPN? | VPN | do I need a vpn |
| 7 | What to Do After a Data Breach | Identity Protection | what to do after a data breach |
| 8 | Is Your Phone Infected? | Mobile Security | how to tell if your phone has malware |
| 9 | Ransomware at Home | Malware | ransomware for home users |
| 10 | Browser Privacy Settings Worth Changing | Browser Security | browser privacy settings |
| 11 | Reduce Your Digital Footprint | Data Privacy | how to reduce your digital footprint |
| 12 | Tech Support Scams | Phishing & Scams | tech support scam |

### Internal linking map (launch)

```
Phishing email ──► 2FA ranked ──► Passkeys
      │               ▲              │
      ▼               │              ▼
Tech support ──► Data breach ◄── Digital footprint
      │                               ▲
      ▼                               │
Ransomware ◄── Phone malware     Browser privacy
                                      │
Router ──► Public Wi-Fi ──► VPN ◄─────┘
```

Every article links to at least two others in the body text, and the generator
adds three related-article cards chosen by shared category.

---

## 5. Publishing plan (first 6 months, estimates)

| Month | Output | Focus |
|---|---|---|
| 1 | 12 launch articles (done) + 4 P1 | Incident playbooks: "clicked a phishing link", credit freeze, infostealers, AI voice scams |
| 2 | 6–8 | Scam-text gallery, extensions, data brokers, password managers |
| 3 | 6–8 | Mac/Windows antivirus decision guides, WPA3, guest networks |
| 4–6 | 8/month | Platform settings guides (iOS, Android, Windows, macOS, each social network) with a quarterly update calendar |

**Refresh rule:** any settings walkthrough is reviewed on each major OS/browser
release, and the visible "Updated" date changes only when content materially
changes (see the Editorial Policy page).

## 6. On-page rules

- One H1 per page that matches search intent. Don't repeat the exact keyword
  in every heading.
- Answer the query in the first 100 words, then go deeper.
- FAQ blocks only where real People Also Ask questions exist, kept to 3–5 items.
- Cite primary sources (NIST, CISA, FTC, NCSC, vendor documentation). Never cite
  a competitor's blog as the authority.
- No affiliate links at launch. This protects the "independent" positioning,
  and affiliate content can be added later with clear disclosure.
