/* =============================================================
   HASEEB — Portfolio main script
   Vanilla JS, no dependencies.
   ============================================================= */
(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     CONFIG — lives in js/config.js (edit it there)
     --------------------------------------------------------- */
  const CONFIG = Object.assign({
    email: 'haseebahmedpak8@gmail.com',
    github: 'https://github.com/ITS-ME-HASEEB',
    linkedin: 'https://www.linkedin.com/in/haseeb-ahmed-453192324?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    instagram: 'https://www.instagram.com/haseeb._ahmed_?utm_source=qr&exln=MXZqNzdtcThpNnE5dA==',
    resume: 'resume.html'
  }, window.SITE_CONFIG || {});

  /* ---------------------------------------------------------
     PROJECT DATA — used by the modal
     --------------------------------------------------------- */
  const PROJECTS = {
    bom: {
      title: 'BOM-SOFTWARE',
      subtitle: 'BOM · production · sales & inventory · live browser demo',
      image: 'assets/img/project-bom.webp',
      tags: ['Electron', 'JavaScript', 'Offline-first', 'ExcelJS', 'PDF invoices'],
      overview:
        'The full BOM-SOFTWARE business workflow app: manage bills of materials, record production and sales, track inventory and raw-material usage, and review activity from a single dashboard. The Windows release is an offline Electron app; this portfolio demo runs the same app UI in a browser and stores its workspace locally.',
      features: [
        'Dashboard with operational summaries and date-range filters',
        'BOM system for managing products and their material requirements',
        'Production log and sales workflows with searchable records',
        'Inventory transactions and raw-material usage tracking',
        'Styled Excel exports for BOM, production, sales, inventory, dashboard and raw-material usage',
        'Invoice PDFs generated from the supplied template',
        'JSON backup and restore shared between the browser demo and Windows app',
        'Offline-first: no login or cloud account required'
      ],
      build:
        'Adapted from the BOM-SOFTWARE repository. The Windows build uses Electron with a preload bridge to keep data in a local JSON file; this static browser demo uses the app’s built-in LocalStorage fallback. Both use the same workspace format, so JSON backups can move between them. ExcelJS and pdf-lib power the workbook and invoice exports.',
      learn: [
        'Designing an offline-first app across desktop and browser environments',
        'Keeping persistence behind a small platform-specific bridge',
        'Creating portable JSON backups for cross-platform data transfer',
        'Generating formatted Excel workbooks and invoice PDFs',
        'Turning a business workflow into a connected set of tools'
      ],
      demo: 'bom-software/app/index.html',
      code: 'https://github.com/ITS-ME-HASEEB/BOM-SOFTWARE'
    },
    portfolio: {
      title: 'Portfolio Website',
      subtitle: 'Hand-coded · neon dark theme · fully responsive',
      image: 'assets/img/project-portfolio.webp',
      tags: ['HTML5', 'CSS3', 'JavaScript', 'Canvas', 'Motion'],
      overview:
        'The site you are looking at right now. It is hand-written with no frameworks, no build step and no template — every animation, gradient and pixel is in the CSS and JavaScript I wrote. It is designed to feel alive rather than static, and it works from a 360px phone up to an ultrawide monitor.',
      features: [
        'Scroll-triggered reveal animations from every direction',
        'Live particle canvas background that reacts to the pointer',
        'Magnetic buttons, glowing cursor light and 3D card tilt',
        'Theme switcher with remembered preference',
        'Case studies for the BOM-SOFTWARE app and this portfolio',
        'Scroll-spy navigation, progress bar and back-to-top',
        'Reduced-motion support and full keyboard accessibility'
      ],
      build:
        'The portfolio shell is hand-coded with plain HTML, CSS and JavaScript, with no framework or build step. Animations use IntersectionObserver and a single requestAnimationFrame loop; the BOM-SOFTWARE demo and its required libraries are bundled locally.',
      learn: [
        'CSS custom properties and theming with them',
        'IntersectionObserver versus scroll event listeners',
        'requestAnimationFrame particle systems on canvas',
        'Accessible modals, focus handling and keyboard support',
        'Performance: keeping a heavy-looking site light'
      ],
      demo: 'index.html',
      embed: false,
      code: 'https://github.com/ITS-ME-HASEEB/Portfolio-Website-'
    }
  };

  /* ---------------------------------------------------------
     APPLY CONFIG — one place to update every link on the site
     --------------------------------------------------------- */
  (function applyConfig() {
    const pretty = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const setAttr = (sel, attr, val) => $$(sel).forEach((el) => el.setAttribute(attr, val));
    const setText = (sel, val) => $$(sel).forEach((el) => { el.textContent = val; });

    setAttr('a[href^="mailto:"]', 'href', 'mailto:' + CONFIG.email);
    setAttr('a[href*="github.com"]:not([data-no-config])', 'href', CONFIG.github);
    setAttr('a[href*="linkedin.com"]', 'href', CONFIG.linkedin);
    setAttr('a[href*="instagram.com"]', 'href', CONFIG.instagram);
    setAttr('a[href$="resume.html"]', 'href', CONFIG.resume);

    setText('[data-config="email"]', CONFIG.email);
    setText('[data-config="github"]', pretty(CONFIG.github));
    setText('[data-config="linkedin"]', pretty(CONFIG.linkedin));
    setText('[data-config="instagram"]', pretty(CONFIG.instagram));
  })();

  /* ---------------------------------------------------------
     TOAST
     --------------------------------------------------------- */
  const toast = $('#toast');
  const toastMsg = $('#toastMsg');
  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    toastMsg.textContent = message;
    toast.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-show'), 3200);
  }

  /* ---------------------------------------------------------
     PRELOADER
     --------------------------------------------------------- */
  (function preloader() {
    const bar = $('#preloaderBar');
    const pct = $('#preloaderPct');
    const start = performance.now();
    const DURATION = REDUCED ? 200 : 1300;

    const hide = () => document.body.classList.remove('is-loading');

    const frame = () => {
      const p = Math.min((performance.now() - start) / DURATION, 1);
      if (bar) bar.style.width = (p * 100) + '%';
      if (pct) pct.textContent = Math.floor(p * 100);
      if (p < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);

    const finish = () => setTimeout(hide, REDUCED ? 50 : 180);
    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish);

    // hard safety net — the preloader can never trap the page
    setTimeout(hide, 3200);
  })();

  /* ---------------------------------------------------------
     THEME
     --------------------------------------------------------- */
  (function theme() {
    const btn = $('#themeToggle');
    const saved = localStorage.getItem('haseeb-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    btn && btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('haseeb-theme', next);
      showToast(next === 'dark' ? 'Dark mode on 🌙' : 'Light mode on ☀️');
    });
  })();

  /* ---------------------------------------------------------
     MOBILE NAVIGATION
     --------------------------------------------------------- */
  (function mobileNav() {
    const nav = $('#primaryNav');
    const toggle = $('#navToggle');
    const backdrop = $('#navBackdrop');
    if (!nav || !toggle) return;

    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      backdrop.hidden = !open;
      requestAnimationFrame(() => backdrop.classList.toggle('is-open', open));
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('no-scroll', open);
      document.body.classList.toggle('nav-open', open);
    };

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    backdrop.addEventListener('click', () => setOpen(false));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 980) setOpen(false); });
  })();

  /* ---------------------------------------------------------
     SMOOTH SCROLL + SCROLL SPY + PROGRESS
     --------------------------------------------------------- */
  (function scrollBehaviour() {
    const header = $('#siteHeader');
    const bar = $('#scrollBar');
    const toTop = $('#toTop');
    const navLinks = $$('.nav__link');
    const sections = navLinks
      .map((l) => document.querySelector(l.getAttribute('href')))
      .filter(Boolean);

    // smooth scroll with header offset
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = (header ? header.offsetHeight : 70) + 12;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: REDUCED ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.pageYOffset;
        if (header) header.classList.toggle('is-stuck', y > 40);
        if (toTop) toTop.classList.toggle('is-show', y > 600);

        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (bar) bar.style.width = (docHeight > 0 ? (y / docHeight) * 100 : 0) + '%';

        // scroll spy
        let current = sections[0];
        sections.forEach((sec) => {
          if (sec.getBoundingClientRect().top - 140 <= 0) current = sec;
        });
        navLinks.forEach((l) => {
          l.classList.toggle('is-active', current && l.getAttribute('href') === '#' + current.id);
        });
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ---------------------------------------------------------
     REVEAL ON SCROLL
     --------------------------------------------------------- */
  (function reveal() {
    const items = $$('[data-reveal]');
    if (!items.length) return;
    if (REDUCED || !('IntersectionObserver' in window)) {
      items.forEach((i) => i.classList.add('is-in'));
      return;
    }

    const pending = new Set(items);
    const show = (el) => {
      const delay = parseInt(el.dataset.delay || '0', 10);
      setTimeout(() => el.classList.add('is-in'), delay);
      pending.delete(el);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        show(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    items.forEach((i) => io.observe(i));

    /* Safety net — a fast flick can jump straight past an element before the
       observer gets a chance to fire, which would leave it stuck invisible.
       This rAF-throttled sweep guarantees every element is eventually shown. */
    let ticking = false;
    const sweep = () => {
      ticking = false;
      if (!pending.size) { window.removeEventListener('scroll', onScroll); return; }
      const vh = window.innerHeight;
      pending.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > -vh * 0.4) show(el);
      });
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(sweep);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    requestAnimationFrame(sweep);
  })();

  /* ---------------------------------------------------------
     HERO TERMINAL — live typing sequence
     --------------------------------------------------------- */
  (function heroTerminal() {
    const term = $('#heroTerm');
    if (!term) return;
    const rows = Array.from(term.querySelectorAll('.term__row'));
    if (!rows.length) return;

    // static fallback: show the finished transcript, no typing
    if (REDUCED) {
      rows.forEach((row) => {
        row.classList.add('is-on');
        const cmd = row.querySelector('.term__cmd');
        if (cmd) cmd.textContent = cmd.dataset.cmd || '';
      });
      return;
    }

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    const typeInto = async (el, text, speed = 62) => {
      for (let i = 1; i <= text.length; i++) {
        el.textContent = text.slice(0, i);
        await sleep(speed + (text[i - 1] === ' ' ? 26 : 0));
      }
    };

    const run = async () => {
      for (;;) {
        rows.forEach((row) => {
          row.classList.remove('is-on');
          const cmd = row.querySelector('.term__cmd');
          if (cmd) cmd.textContent = '';
        });
        await sleep(500);
        for (const row of rows) {
          row.classList.add('is-on');
          const cmd = row.querySelector('.term__cmd');
          if (cmd) {
            await typeInto(cmd, cmd.dataset.cmd || '');
            await sleep(420);
          } else {
            await sleep(560);
          }
        }
        await sleep(3200);
      }
    };

    run();
  })();

  /* ---------------------------------------------------------
     TYPING EFFECT
     --------------------------------------------------------- */
  (function typing() {
    const el = $('#typingText');
    if (!el) return;
    const phrases = JSON.parse(el.dataset.phrases || '[]');
    if (!phrases.length) return;
    if (REDUCED) { el.textContent = phrases[0]; return; }

    let p = 0, i = 0, deleting = false;
    const type = () => {
      const phrase = phrases[p];
      el.textContent = phrase.slice(0, i);
      if (!deleting && i < phrase.length) {
        i++;
        setTimeout(type, 55);
      } else if (!deleting && i === phrase.length) {
        deleting = true;
        setTimeout(type, 1900);
      } else if (deleting && i > 0) {
        i--;
        setTimeout(type, 28);
      } else {
        deleting = false;
        p = (p + 1) % phrases.length;
        setTimeout(type, 320);
      }
    };
    setTimeout(type, 900);
  })();

  /* ---------------------------------------------------------
     COUNTERS + SKILL BARS
     --------------------------------------------------------- */
  (function counters() {
    const nums = $$('.counter');
    const bars = $$('.bar i');
    if (!nums.length && !bars.length) return;

    const run = (el) => {
      const target = parseFloat(el.dataset.count || '0');
      const suffix = el.dataset.suffix || '';
      const dur = 1400;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (REDUCED || !('IntersectionObserver' in window)) {
      nums.forEach((n) => { n.textContent = (n.dataset.count || '0') + (n.dataset.suffix || ''); });
      bars.forEach((b) => { b.style.width = b.dataset.fill + '%'; });
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (entry.target.classList.contains('counter')) run(entry.target);
        else entry.target.style.width = entry.target.dataset.fill + '%';
        io.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    nums.forEach((n) => io.observe(n));
    bars.forEach((b) => io.observe(b));
  })();

  /* ---------------------------------------------------------
     PARTICLE CANVAS
     --------------------------------------------------------- */
  (function particles() {
    const canvas = $('#fxCanvas');
    if (!canvas || REDUCED) return;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let pts = [];
    let mouse = { x: -999, y: -999 };
    let raf;

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(Math.round((w * h) / 26000), 70);
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.8 + 0.7
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;

        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 26000) {
          const f = (26000 - d2) / 26000;
          p.x -= (dx / Math.sqrt(d2)) * f * 1.1;
          p.y -= (dy / Math.sqrt(d2)) * f * 1.1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(168,85,247,.55)';
        ctx.fill();
      }
      // connecting lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 132) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = 'rgba(139,92,246,' + (0.16 * (1 - dist / 132)) + ')';
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(raf); } else { draw(); }
    });
  })();

  /* ---------------------------------------------------------
     CURSOR GLOW
     --------------------------------------------------------- */
  (function cursorGlow() {
    const glow = $('#cursorGlow');
    if (!glow || REDUCED || window.matchMedia('(hover: none)').matches) return;
    let x = -300, y = -300, tx = -300, ty = -300;
    const loop = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
      document.body.classList.add('cursor-active');
    }, { passive: true });
    document.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
  })();

  /* ---------------------------------------------------------
     MAGNETIC BUTTONS
     --------------------------------------------------------- */
  (function magnetic() {
    if (REDUCED || window.matchMedia('(hover: none)').matches) return;
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.22}px, ${y * 0.3}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  })();

  /* ---------------------------------------------------------
     3D CARD TILT
     --------------------------------------------------------- */
  (function tilt() {
    if (REDUCED || window.matchMedia('(hover: none)').matches) return;
    $$('.project').forEach((card) => {
      const media = card.querySelector('.project__media img');
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${-py * 6}deg) rotateY(${px * 7}deg) translateY(-6px)`;
        if (media) media.style.transform = 'scale(1.09)';
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
        if (media) media.style.transform = '';
      });
    });
  })();

  /* ---------------------------------------------------------
     PROJECT MODAL
     --------------------------------------------------------- */
  (function projectModal() {
    const modal = $('#projectModal');
    if (!modal) return;
    const iframe = $('#modalIframe');
    const dialog = $('.modal__dialog');
    let lastFocus = null;
    let current = null;

    const els = {
      image: $('#modalImage'),
      title: $('#modalTitle'),
      subtitle: $('#modalSubtitle'),
      tags: $('#modalTags'),
      overview: $('#modalOverview'),
      features: $('#modalFeatures'),
      build: $('#modalBuild'),
      learn: $('#modalLearn'),
      code: $('#modalCode'),
      demoBtn: $('#modalDemoBtn'),
      demoLink: $('#modalDemoLink'),
      demoUrl: $('#modalDemoUrl')
    };

    function fill(list, items) {
      list.innerHTML = '';
      items.forEach((t) => {
        const li = document.createElement('li');
        li.textContent = t;
        list.appendChild(li);
      });
    }

    function fillTags(list, items) {
      list.innerHTML = '';
      items.forEach((t) => {
        const s = document.createElement('span');
        s.className = 'tag';
        s.textContent = t;
        list.appendChild(s);
      });
    }

    function selectTab(name) {
      $$('.modal__tab', modal).forEach((t) => t.classList.toggle('is-active', t.dataset.tab === name));
      $$('.modal__panel', modal).forEach((p) => p.classList.toggle('is-active', p.dataset.panel === name));
      if (name === 'demo' && current && current.demo && current.embed !== false) {
        if (!iframe.src.includes(current.demo)) iframe.src = current.demo;
      }
    }

    function open(key) {
      const data = PROJECTS[key];
      if (!data) return;
      current = data;
      lastFocus = document.activeElement;

      els.image.src = data.image;
      els.image.alt = data.title;
      els.title.textContent = data.title;
      els.subtitle.textContent = data.subtitle;
      fillTags(els.tags, data.tags);
      els.overview.textContent = data.overview;
      fill(els.features, data.features);
      els.build.textContent = data.build;
      fill(els.learn, data.learn);
      els.code.href = data.code || CONFIG.github;

      const demoUrl = new URL(data.demo, window.location.href).href;
      els.demoUrl.textContent = data.demo;
      els.demoLink.href = demoUrl;
      els.demoBtn.href = demoUrl;
      els.demoBtn.querySelector('span').textContent = data.embed === false ? 'View the live site' : 'Live demo';

      const demoPanel = $('[data-panel="demo"]', modal);
      const frame = $('.modal__demo-frame', demoPanel);
      const openBtn = els.demoLink;
      if (data.embed === false) {
        frame.style.display = 'none';
        openBtn.querySelector('span').textContent = 'Open this website in a new tab';
      } else {
        frame.style.display = '';
        openBtn.querySelector('span').textContent = 'Open demo in a new tab';
      }

      iframe.src = 'about:blank';
      selectTab('overview');

      modal.hidden = false;
      document.body.classList.add('no-scroll');
      requestAnimationFrame(() => modal.classList.add('is-open'));
      $('.modal__close', modal).focus();
    }

    function close() {
      modal.classList.remove('is-open');
      document.body.classList.remove('no-scroll');
      setTimeout(() => { modal.hidden = true; iframe.src = 'about:blank'; }, 380);
      if (lastFocus) lastFocus.focus();
    }

    $$('[data-project]').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a[data-no-card]')) return; // the real links act on their own
        open(card.dataset.project);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card.dataset.project); }
      });
    });

    $$('[data-close]', modal).forEach((el) => el.addEventListener('click', close));
    $$('.modal__tab', modal).forEach((tab) => tab.addEventListener('click', () => selectTab(tab.dataset.tab)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) close();
      if (e.key === 'Tab' && !modal.hidden) {
        const focusables = $$('a[href],button:not([disabled]),iframe', modal).filter((f) => f.offsetParent !== null);
        if (!focusables.length) return;
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  })();

  /* ---------------------------------------------------------
     CONTACT FORM — opens the visitor's mail client
     --------------------------------------------------------- */
  (function contactForm() {
    const form = $('#contactForm');
    if (!form) return;
    const note = $('#formNote');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      let valid = true;
      $$('.field', form).forEach((f) => f.classList.remove('is-error'));

      if (!data.name || !data.name.trim()) {
        const f = form.querySelector('[name="name"]').closest('.field');
        f.classList.add('is-error'); valid = false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '')) {
        const f = form.querySelector('[name="email"]').closest('.field');
        f.classList.add('is-error'); valid = false;
      }
      if (!data.message || !data.message.trim()) {
        const f = form.querySelector('[name="message"]').closest('.field');
        f.classList.add('is-error'); valid = false;
      }
      if (!valid) {
        note.textContent = 'Please fill in your name, a valid email and a message.';
        note.classList.add('is-error');
        return;
      }
      const subject = data.subject || 'Hello from your portfolio';
      const body = `${data.message}\n\n— ${data.name}\n${data.email}`;
      window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      note.classList.remove('is-error');
      note.textContent = 'Opening your mail app… send it and I’ll reply soon!';
      form.reset();
    });
  })();

  /* ---------------------------------------------------------
     COPY EMAIL
     --------------------------------------------------------- */
  $$('[data-copy]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const value = el.dataset.copy;
      const done = () => {
        showToast('Email copied: ' + value);
        window.location.href = 'mailto:' + value;
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done).catch(done);
      } else {
        done();
      }
    });
  });

  /* ---------------------------------------------------------
     MISC
     --------------------------------------------------------- */
  (function misc() {
    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();

    // duplicate marquee content so the loop is seamless
    const track = $('#marqueeTrack');
    if (track) track.innerHTML = track.innerHTML + track.innerHTML;

    // back to top
    const toTop = $('#toTop');
    toTop && toTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    });
  })();

})();
