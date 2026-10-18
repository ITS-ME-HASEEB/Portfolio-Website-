# 🚀 Haseeb — Portfolio Website

A hand-coded, neon-dark portfolio for **Haseeb** — BS Artificial Intelligence student at **Quest University, Karachi**.

Built with plain **HTML, CSS and JavaScript**. No frameworks, no build step, no dependencies — open `index.html` and it works.
Every button is live: the projects are **real working apps** that open inside the project popup, and the résumé is a real, printable document.

---

## ✨ What's inside

| Feature | Details |
|---|---|
| **Hero** | Script "Hello, I'm" + 3D neon **HASEEB** render, typing tagline, live stat counters, floating tech chips |
| **About** | Who I am / What I do / What I love + illustrated profile with quick facts |
| **Skills** | Tag clouds, animated proficiency bars, human-skill section |
| **Projects** | 6 cards → click any card for a **popup case study** with an **embedded live demo** you can actually use |
| **Education** | Animated timeline: BS AI → DIT → High School → short courses |
| **Experience** | Internship (store ops, Shopify, inventory, complaints, invoices) + self-taught dev work |
| **Contact** | Working contact form (opens the visitor's mail client with a pre-filled message), email, GitHub, LinkedIn, location |
| **Résumé** | `resume.html` — A4 print-ready page with a "Download / Save as PDF" button |
| **Motion** | Scroll reveals from every direction, particle canvas, magnetic buttons, 3D card tilt, cursor light, marquee, breathing glows |
| **Extras** | Dark ⇄ light theme (remembered), scroll-spy nav, scroll-progress bar, back-to-top, mobile drawer, full keyboard support, `prefers-reduced-motion` support |

### Live demo apps (all real, all working)

| App | File | What it does |
|---|---|---|
| **BOM Management System** | `bom.html` | Bill of materials: add/edit/delete parts, live low-stock alerts, stock value, category chart, search/filter/sort, CSV export, LocalStorage |
| **Task Manager (Kanban)** | `task.html` | Drag & drop board with priorities, labels, filters, progress ring, LocalStorage |
| **AI Prompt Generator** | `prompts.html` | 18 prompt templates across 6 categories, tone/depth controls, copy-to-clipboard, history |
| **Store Operations Hub** | `shop.html` | Orders pipeline, inventory, complaint log, revenue charts, printable invoices |
| **Teaching & Notes Hub** | `notes.html` | Searchable notes library + quick-reference cheat sheets, reading view |

---

## 📁 Structure

```
.
├── index.html            # the portfolio
├── resume.html           # printable résumé
├── bom.html              # live demo — Bill of Materials system
├── task.html             # live demo — Kanban task manager
├── prompts.html          # live demo — AI prompt generator
├── shop.html             # live demo — store operations hub
├── notes.html            # live demo — teaching & notes hub
├── css/
│   ├── fonts.css         # self-hosted Sora / Inter / Dancing Script
│   ├── style.css         # portfolio design system
│   └── demo.css          # shared styles for the demo apps
├── js/
│   ├── config.js         # ✏️ EDIT ME — email, GitHub, LinkedIn, résumé path
│   └── main.js           # animations, modal, canvas, theme, nav, form
└── assets/
    ├── favicon.svg
    ├── fonts/            # woff2 files (no external requests)
    └── img/              # generated hero, profile and project artwork
```

---

## ✏️ Make it yours (60 seconds)

**1. Contact links** — open `js/config.js` and change four lines:

```js
window.SITE_CONFIG = {
  email:    'hello@haseeb.dev',                          // ← your Gmail
  github:   'https://github.com/ITS-ME-HASEEB',         // ← your GitHub
  linkedin: 'https://www.linkedin.com/in/its-me-haseeb', // ← your LinkedIn
  resume:   'resume.html'
};
```

Every email, GitHub and LinkedIn link on the site, in the footer and on the résumé updates automatically.

**2. Text** — all the copy lives in `index.html` inside normal, readable HTML. Find a heading, edit the words, done.

**3. Colours** — the whole theme is CSS variables at the top of `css/style.css`:

```css
--violet:#a855f7;  --magenta:#e879f9;  --cyan:#22d3ee;  --green:#34d399;
--grad:linear-gradient(120deg,#8b5cf6 0%,#d946ef 45%,#6366f1 100%);
```

**4. Project links** — the popup content for each project lives in the `PROJECTS` object at the top of `js/main.js` (title, description, features, build notes, code link, demo link).

**5. Fonts** — `Sora`, `Inter` and `Dancing Script` are self-hosted in `assets/fonts/`, so the site works with no internet connection.

---

## ▶️ Run it locally

```bash
# any static server works
python3 -m http.server 8080
# → http://localhost:8080
```

Opening `index.html` directly from the file system also works, except the project popups embed live demos in an `iframe`, which browsers block for `file://` pages — use a local server for the full experience.

---

## 🌐 Deploy it (free, 2 minutes)

**GitHub Pages**
1. Push this repo to GitHub
2. Repo → **Settings → Pages** → Source: **Deploy from a branch** → `main` / `/ (root)`
3. Your site is live at `https://ITS-ME-HASEEB.github.io/Portfolio-Website-/`

**Netlify / Vercel / Cloudflare Pages**
- Build command: *(leave empty)* · Publish directory: `/`

---

## ♿ Accessibility & performance

- Semantic landmarks (`header`, `nav`, `main`, `section`, `footer`), labelled inputs, `aria` on the modal
- Full keyboard support: `Tab` navigation, `Enter`/`Space` on project cards, `Esc` closes the modal and drawer
- Visible focus states, `prefers-reduced-motion` respected, text contrast checked in both themes
- No frameworks, no trackers, no external requests — the whole site is a few hundred KB and loads instantly
- Animations run on `IntersectionObserver` + `requestAnimationFrame` (never on scroll handlers), so scrolling stays smooth

---

## 📄 Résumé

`resume.html` is a print-ready A4 page. **Download / Save as PDF** opens the browser print dialog where you can choose
*Save as PDF* — that produces a clean one-page PDF résumé. Opening `resume.html?print=1` prints it automatically.

---

Made with 💜 in Karachi — using HTML, CSS and JavaScript.
