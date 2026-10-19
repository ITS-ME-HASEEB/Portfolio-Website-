/* =============================================================
   HASEEB — Portfolio main script
   Vanilla JS, no dependencies.

   Performance notes
   ─────────────────
   • Every visual entrance waits for the preloader (boot gate), so
     reveal animations are never "used up" behind the overlay.
   • Reveals use CSS animations, not transitions: they end cleanly
     and leave the element's own hover transitions untouched.
   • All animation loops (particles, cursor, typing, terminal) pause
     when the tab is hidden or a modal / drawer covers the page.
   • Scroll work is rAF-throttled and writes are deduplicated.
   ============================================================= */
(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const mq = (q) => (window.matchMedia ? window.matchMedia(q) : { matches: false });

  const REDUCED    = mq('(prefers-reduced-motion: reduce)').matches;
  const FINE_POINTER = mq('(hover: hover) and (pointer: fine)').matches;
  const SAVE_DATA  = !!(navigator.connection && navigator.connection.saveData);
  const LOW_MEMORY = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 2;

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
     ACTIVITY — one switch for "is the page actually visible"
     Every animation loop subscribes here instead of polling.
     --------------------------------------------------------- */
  const Activity = (() => {
    let overlay = 0;
    let hidden = document.hidden;
    const subs = new Set();
    const value = () => !hidden && overlay === 0;
    const notify = () => subs.forEach((fn) => fn(value()));
    document.addEventListener('visibilitychange', () => {
      hidden = document.hidden;
      notify();
    }, { passive: true });
    return {
      get active() { return value(); },
      sub(fn) { subs.add(fn); fn(value()); },
      overlay(delta) { overlay = Math.max(0, overlay + delta); notify(); }
    };
  })();

  /* ---------------------------------------------------------
     SCROLL LOCK — html and body, reference-counted
     (html must be locked too: overflow-x:clip on <html> means
      a body-only overflow rule does not always stop the page)
     --------------------------------------------------------- */
  let scrollLocks = 0;
  function setScrollLock(on) {
    scrollLocks = Math.max(0, scrollLocks + (on ? 1 : -1));
    const locked = scrollLocks > 0;
    document.documentElement.classList.toggle('no-scroll', locked);
    document.body.classList.toggle('no-scroll', locked);
  }

  /* ---------------------------------------------------------
     BOOT GATE — the preloader is the starting pistol
     --------------------------------------------------------- */
  let booted = false;
  const bootQueue = [];
  function onBoot(fn) {
    if (booted) fn();
    else bootQueue.push(fn);
  }
  function finishBoot() {
    if (booted) return;
    booted = true;
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
    document.documentElement.classList.add('is-ready');
    bootQueue.splice(0).forEach((fn) => {
      try { fn(); } catch (err) { console.error(err); }
    });
  }

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
     Hides on DOM + fonts ready (capped), never waiting for the
     whole page forever. The boot gate fires as the overlay fades.
     --------------------------------------------------------- */
  (function preloader() {
    const el = $('#preloader');
    if (!el) { finishBoot(); return; }
    const bar = $('#preloaderBar');
    const pct = $('#preloaderPct');
    const DURATION = REDUCED ? 150 : 650;
    const start = performance.now();
    let shown = -1;
    let finished = false;
    let raf = 0;

    const setProgress = (value) => {
      const v = Math.max(0, Math.min(100, Math.round(value)));
      if (v === shown) return;
      shown = v;
      if (bar) bar.style.width = v + '%';
      if (pct) pct.textContent = v;
    };

    const frame = (now) => {
      const p = Math.min((now - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - p, 2);
      setProgress(eased * 92);
      raf = p < 1 ? requestAnimationFrame(frame) : 0;
    };
    raf = requestAnimationFrame(frame);

    const hide = () => {
      if (finished) return;
      finished = true;
      if (raf) cancelAnimationFrame(raf);
      setProgress(100);
      finishBoot();
      setTimeout(() => { if (el.parentNode) el.remove(); }, REDUCED ? 60 : 750);
    };

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const minTime = wait(DURATION);
    const fonts = document.fonts && document.fonts.ready
      ? Promise.race([document.fonts.ready, wait(1200)])
      : Promise.resolve();
    const assets = document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));

    Promise.all([minTime, fonts, Promise.race([assets, wait(1600)])])
      .then(hide)
      .catch(hide);

    // hard safety net — the preloader can never trap the page
    setTimeout(hide, 3200);
  })();

  /* ---------------------------------------------------------
     THEME (the saved theme is applied inline in <head> so the
     page never flashes the wrong colours)
     --------------------------------------------------------- */
  (function theme() {
    const btn = $('#themeToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('haseeb-theme', next); } catch (err) { /* private mode */ }
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
    if (!nav || !toggle || !backdrop) return;

    let open = false;
    let backdropTimer;

    const setOpen = (next) => {
      if (next === open) return;
      open = next;

      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('nav-open', open);
      setScrollLock(open);
      Activity.overlay(open ? 1 : -1);

      clearTimeout(backdropTimer);
      if (open) {
        backdrop.hidden = false;
        requestAnimationFrame(() => backdrop.classList.add('is-open'));
      } else {
        backdrop.classList.remove('is-open');
        backdropTimer = setTimeout(() => { if (!open) backdrop.hidden = true; }, 380);
      }
    };

    toggle.addEventListener('click', () => setOpen(!open));
    backdrop.addEventListener('click', () => setOpen(false));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) setOpen(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 980 && open) setOpen(false); }, { passive: true });
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
      .map((link) => {
        const href = link.getAttribute('href') || '';
        return href.length > 1 && href.charAt(0) === '#' ? document.querySelector(href) : null;
      })
      .filter(Boolean);

    /* smooth scroll with header offset (native smooth scrolling) */
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = (header ? header.offsetHeight : 70) + 12;
      const top = Math.max(target.getBoundingClientRect().top + window.scrollY - offset, 0);
      if (REDUCED) window.scrollTo(0, top);
      else window.scrollTo({ top, behavior: 'smooth' });
      history.replaceState(null, '', id);
    });

    /* progress: measured height cached, bar moved with a transform */
    let docHeight = 1;
    let lastProgress = -1;
    const measure = () => {
      docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };
    if ('ResizeObserver' in window) {
      new ResizeObserver(measure).observe(document.body);
    } else {
      window.addEventListener('resize', measure, { passive: true });
    }
    window.addEventListener('load', measure, { once: true });

    let ticking = false;
    let stuck = null;
    let topShown = null;
    const frame = () => {
      ticking = false;
      const y = window.scrollY;

      // hysteresis so the header never flickers around the threshold
      const isStuck = stuck ? y > 12 : y > 48;
      if (isStuck !== stuck) {
        stuck = isStuck;
        if (header) header.classList.toggle('is-stuck', stuck);
      }

      const showTop = topShown ? y > 480 : y > 620;
      if (showTop !== topShown) {
        topShown = showTop;
        if (toTop) toTop.classList.toggle('is-show', showTop);
      }

      if (bar) {
        const progress = Math.round(Math.min(y / docHeight, 1) * 1000) / 1000;
        if (progress !== lastProgress) {
          lastProgress = progress;
          bar.style.transform = 'scaleX(' + progress + ')';
        }
      }
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(frame);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* scroll spy — one IntersectionObserver instead of layout reads
       inside every scroll frame */
    if (!sections.length) return;

    let activeId = null;
    const setActive = (section) => {
      if (!section || activeId === section.id) return;
      activeId = section.id;
      navLinks.forEach((link) => {
        const on = link.getAttribute('href') === '#' + section.id;
        if (link.classList.contains('is-active') !== on) link.classList.toggle('is-active', on);
      });
    };

    if ('IntersectionObserver' in window) {
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target);
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      sections.forEach((section) => spy.observe(section));

      // beyond the band (page top / footer) fall back to first / last
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y < 60) setActive(sections[0]);
        else if (y >= docHeight - 2) setActive(sections[sections.length - 1]);
      }, { passive: true });
    }
    setActive(sections[0]);
  })();

  /* ---------------------------------------------------------
     REVEAL ON SCROLL

     CSS animations (not transitions) are used so the element's own
     hover transition is never overwritten, and so an interrupted or
     delayed reveal always finishes on its real end state.
     --------------------------------------------------------- */
  (function reveal() {
    const items = $$('[data-reveal]');
    if (!items.length) return;

    if (REDUCED || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-in'));
      return;
    }

    const pending = new Set(items);
    const show = (el) => {
      if (!pending.delete(el)) return;
      const delay = Math.max(0, Math.min(parseInt(el.dataset.delay || '0', 10) || 0, 500));
      const fire = () => {
        if (delay) el.style.animationDelay = delay + 'ms';
        el.classList.add('is-in');
      };
      onBoot(fire);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        show(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -4% 0px' });
    items.forEach((item) => io.observe(item));

    /* Safety net for fast flicks / anchors: reveal anything that is at
       or above the viewport even if the observer never saw it.
       All measurements happen first, then all writes — no forced
       layout thrash while the page is scrolling. */
    let ticking = false;
    const sweep = () => {
      ticking = false;
      if (!pending.size) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        return;
      }
      const vh = window.innerHeight;
      const due = [];
      pending.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Everything at or above the fold — including content the user has
        // already scrolled past — must be visible. Elements far below stay
        // hidden until they arrive, so their reveal is never "used up"
        // while off-screen.
        if (rect.top < vh * 0.96) due.push(el);
      });
      due.forEach(show);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(sweep);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    requestAnimationFrame(sweep);
  })();

  /* ---------------------------------------------------------
     HERO TERMINAL — live typing sequence
     Pauses entirely while off-screen or while a modal/drawer
     covers the page, then continues from where it was.
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

    let onscreen = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { onscreen = entry.isIntersecting; }, { rootMargin: '120px 0px' })
        .observe(term);
    }

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const ready = () => Activity.active && onscreen;
    const waitReady = async () => {
      while (!ready()) await sleep(400);
    };

    const typeInto = async (el, text) => {
      for (let i = 1; i <= text.length; i++) {
        await waitReady();
        el.textContent = text.slice(0, i);
        await sleep(58 + (text[i - 1] === ' ' ? 24 : 0));
      }
    };

    const run = async () => {
      await waitReady();
      for (;;) {
        rows.forEach((row) => {
          row.classList.remove('is-on');
          const cmd = row.querySelector('.term__cmd');
          if (cmd) cmd.textContent = '';
        });
        await sleep(420);
        await waitReady();
        for (const row of rows) {
          await waitReady();
          row.classList.add('is-on');
          const cmd = row.querySelector('.term__cmd');
          if (cmd) {
            await typeInto(cmd, cmd.dataset.cmd || '');
            await sleep(380);
          } else {
            await sleep(520);
          }
        }
        await sleep(3000);
      }
    };

    onBoot(run);
  })();

  /* ---------------------------------------------------------
     TYPING EFFECT
     --------------------------------------------------------- */
  (function typing() {
    const el = $('#typingText');
    if (!el) return;
    let phrases = [];
    try { phrases = JSON.parse(el.dataset.phrases || '[]'); } catch (err) { phrases = []; }
    if (!phrases.length) return;
    if (REDUCED) { el.textContent = phrases[0]; return; }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer = 0;
    let onscreen = true;

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { onscreen = entry.isIntersecting; }, { rootMargin: '100px 0px' })
        .observe(el);
    }

    const schedule = (ms) => {
      clearTimeout(timer);
      timer = setTimeout(tick, ms);
    };

    function tick() {
      // stay paused (cheaply) when the tab is hidden or the hero is away
      if (!Activity.active || !onscreen) { schedule(450); return; }

      const phrase = phrases[phraseIndex];
      el.textContent = phrase.slice(0, charIndex);

      if (!deleting && charIndex < phrase.length) {
        charIndex++;
        schedule(52);
      } else if (!deleting && charIndex === phrase.length) {
        deleting = true;
        schedule(1800);
      } else if (deleting && charIndex > 0) {
        charIndex--;
        schedule(26);
      } else {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        schedule(300);
      }
    }

    onBoot(() => schedule(650));
  })();

  /* ---------------------------------------------------------
     COUNTERS + SKILL BARS
     --------------------------------------------------------- */
  (function counters() {
    const nums = $$('.counter');
    const bars = $$('.bar i');
    if (!nums.length && !bars.length) return;

    const setCounter = (el) => {
      if (el.dataset.counted) return;
      el.dataset.counted = '1';
      const target = parseFloat(el.dataset.count || '0');
      const suffix = el.dataset.suffix || '';
      if (REDUCED) { el.textContent = target + suffix; return; }

      const start = performance.now();
      const duration = 1300;
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    // start from zero, but only after the page is actually visible
    nums.forEach((n) => { n.textContent = '0'; });

    const applyBar = (bar) => {
      const value = Math.max(0, Math.min(parseFloat(bar.dataset.fill || '0'), 100));
      bar.style.transform = 'scaleX(' + (value / 100) + ')';
    };

    if (REDUCED || !('IntersectionObserver' in window)) {
      nums.forEach(setCounter);
      bars.forEach(applyBar);
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        if (entry.target.classList.contains('counter')) onBoot(() => setCounter(entry.target));
        else applyBar(entry.target);
      });
    }, { threshold: 0.35 });

    nums.forEach((n) => io.observe(n));
    bars.forEach((b) => io.observe(b));
  })();

  /* ---------------------------------------------------------
     PARTICLE CANVAS
     Batched into two draw calls per frame (dots + lines), capped
     particle count, capped DPR, paused with the Activity gate.
     --------------------------------------------------------- */
  (function particles() {
    const canvas = $('#fxCanvas');
    if (!canvas || REDUCED) return;
    if (SAVE_DATA || LOW_MEMORY) { canvas.remove(); return; }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const TAU = Math.PI * 2;
    const LINK = 118;
    const LINK2 = LINK * LINK;
    const MOUSE_R2 = 19000;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let pts = [];
    let raf = 0;
    let mx = -9999;
    let my = -9999;
    let resizeTimer = 0;

    const targetCount = () => {
      const base = Math.round((w * h) / 30000);
      const cap = w < 760 ? 26 : 52;
      return Math.max(12, Math.min(base, cap));
    };

    const makePoint = () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.26,
      vy: (Math.random() - 0.5) * 0.26,
      r: Math.random() * 1.7 + 0.7
    });

    const rebuild = (count) => {
      pts = Array.from({ length: count }, makePoint);
    };

    const resize = () => {
      const nw = canvas.clientWidth;
      const nh = canvas.clientHeight;
      if (!nw || !nh) return;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = nw;
      h = nh;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = targetCount();
      if (!pts.length || Math.abs(pts.length - count) > 6) {
        rebuild(count);
      } else {
        pts.forEach((p) => {
          if (p.x > w) p.x = Math.random() * w;
          if (p.y > h) p.y = Math.random() * h;
        });
      }
    };

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 180);
    };

    const frame = () => {
      raf = 0;
      if (!Activity.active) return;

      ctx.clearRect(0, 0, w, h);

      // dots — one path, one fill
      ctx.beginPath();
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;

        const dx = p.x - mx;
        const dy = p.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < MOUSE_R2 && d2 > 1) {
          const inv = 1 / Math.sqrt(d2);
          const force = (1 - d2 / MOUSE_R2) * 1.1;
          p.x += dx * inv * force;
          p.y += dy * inv * force;
        }

        ctx.moveTo(p.x + p.r, p.y);
        ctx.arc(p.x, p.y, p.r, 0, TAU);
      }
      ctx.fillStyle = 'rgba(168,85,247,.5)';
      ctx.fill();

      // connecting lines — one path, one stroke
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          if (dx * dx + dy * dy < LINK2) {
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
          }
        }
      }
      ctx.strokeStyle = 'rgba(139,92,246,.13)';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (!raf && Activity.active) raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    Activity.sub((active) => { if (active) start(); else stop(); });

    resize();
    start();

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      mx = e.clientX;
      my = e.clientY;
    }, { passive: true });
    document.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });

    // the hidden tab can restore without a visibilitychange listener here:
    // Activity handles it and restarts the loop above.
  })();

  /* ---------------------------------------------------------
     CURSOR GLOW — follows with a lerp, sleeps when it arrives
     --------------------------------------------------------- */
  (function cursorGlow() {
    const glow = $('#cursorGlow');
    if (!glow || REDUCED || !FINE_POINTER || SAVE_DATA) return;

    let x = -400;
    let y = -400;
    let tx = -400;
    let ty = -400;
    let raf = 0;
    let running = false;

    const apply = () => {
      glow.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    };

    const loop = () => {
      raf = 0;
      if (!Activity.active) { running = false; return; }
      const dx = tx - x;
      const dy = ty - y;
      if (Math.abs(dx) < 0.3 && Math.abs(dy) < 0.3) {
        if (x !== tx || y !== ty) { x = tx; y = ty; apply(); }
        running = false;
        return; // settled — no frame scheduling until the pointer moves
      }
      x += dx * 0.16;
      y += dy * 0.16;
      apply();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || !Activity.active) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };

    Activity.sub((active) => {
      if (!active) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        running = false;
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      tx = e.clientX;
      ty = e.clientY;
      if (!document.body.classList.contains('cursor-active')) {
        document.body.classList.add('cursor-active');
        if (x < -100) { x = tx; y = ty; apply(); }
      }
      start();
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-active');
    });
  })();

  /* ---------------------------------------------------------
     MAGNETIC BUTTONS
     --------------------------------------------------------- */
  (function magnetic() {
    if (REDUCED || !FINE_POINTER) return;
    $$('[data-magnetic]').forEach((el) => {
      let rect = null;
      el.addEventListener('pointerenter', () => { rect = el.getBoundingClientRect(); });
      el.addEventListener('pointermove', (e) => {
        if (!rect) rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = 'translate(' + (x * 0.22) + 'px,' + (y * 0.3) + 'px)';
      });
      el.addEventListener('pointerleave', () => {
        rect = null;
        el.style.transform = '';
      });
    });
  })();

  /* ---------------------------------------------------------
     3D CARD TILT
     --------------------------------------------------------- */
  (function tilt() {
    if (REDUCED || !FINE_POINTER) return;
    $$('.project').forEach((card) => {
      const media = card.querySelector('.project__media img');
      let rect = null;
      card.addEventListener('pointerenter', () => {
        rect = card.getBoundingClientRect();
        card.classList.add('is-tilting');
      });
      card.addEventListener('pointermove', (e) => {
        if (!rect) rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = 'perspective(900px) rotateX(' + (-py * 6) + 'deg) rotateY(' + (px * 7) + 'deg) translateY(-6px)';
        if (media) media.style.transform = 'scale(1.09)';
      });
      card.addEventListener('pointerleave', () => {
        rect = null;
        card.classList.remove('is-tilting');
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
    let lastFocus = null;
    let current = null;
    let isOpen = false;
    let closeTimer = 0;

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
      items.forEach((text) => {
        const li = document.createElement('li');
        li.textContent = text;
        list.appendChild(li);
      });
    }

    function fillTags(list, items) {
      list.innerHTML = '';
      items.forEach((text) => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = text;
        list.appendChild(span);
      });
    }

    function selectTab(name) {
      $$('.modal__tab', modal).forEach((tab) => tab.classList.toggle('is-active', tab.dataset.tab === name));
      $$('.modal__panel', modal).forEach((panel) => panel.classList.toggle('is-active', panel.dataset.panel === name));
      if (name === 'demo' && current && current.demo && current.embed !== false) {
        if (!iframe.src.includes(current.demo)) iframe.src = current.demo;
      }
    }

    function open(key) {
      if (isOpen) return;
      const data = PROJECTS[key];
      if (!data) return;
      current = data;
      lastFocus = document.activeElement;
      clearTimeout(closeTimer);

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
      isOpen = true;
      setScrollLock(true);
      Activity.overlay(1);
      requestAnimationFrame(() => modal.classList.add('is-open'));
      safeFocus($('.modal__close', modal));
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      modal.classList.remove('is-open');
      setScrollLock(false);
      Activity.overlay(-1);
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        if (!isOpen) {
          modal.hidden = true;
          iframe.src = 'about:blank';
        }
      }, 380);
      safeFocus(lastFocus);
    }

    // never let focus management scroll the page under the user
    function safeFocus(el) {
      if (!el || !el.focus) return;
      try { el.focus({ preventScroll: true }); }
      catch (err) { el.focus(); }
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
      if (!isOpen) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const focusables = $$('a[href],button:not([disabled]),iframe', modal).filter((f) => f.offsetParent !== null);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
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
      $$('.field', form).forEach((field) => field.classList.remove('is-error'));

      if (!data.name || !data.name.trim()) {
        const field = form.querySelector('[name="name"]').closest('.field');
        field.classList.add('is-error');
        valid = false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '')) {
        const field = form.querySelector('[name="email"]').closest('.field');
        field.classList.add('is-error');
        valid = false;
      }
      if (!data.message || !data.message.trim()) {
        const field = form.querySelector('[name="message"]').closest('.field');
        field.classList.add('is-error');
        valid = false;
      }
      if (!valid) {
        note.textContent = 'Please fill in your name, a valid email and a message.';
        note.classList.add('is-error');
        return;
      }
      const subject = data.subject || 'Hello from your portfolio';
      const body = data.message + '\n\n— ' + data.name + '\n' + data.email;
      window.location.href = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
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
    if (track) track.insertAdjacentHTML('beforeend', track.innerHTML);

    // the back-to-top link is a normal #home anchor, handled by scrollBehaviour
  })();

  /* ---------------------------------------------------------
     IDLE PREFETCH — warm the pages people open next, only after
     the current page has finished loading so nothing competes
     with the hero for bandwidth.
     --------------------------------------------------------- */
  (function idlePrefetch() {
    const urls = [
      'bom-software/app/index.html',
      'resume.html',
      'bom-software/app/styles.css'
    ];
    const warm = () => {
      urls.forEach((url) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.as = url.endsWith('.css') ? 'style' : 'document';
        document.head.appendChild(link);
      });
    };
    const schedule = () => {
      if (SAVE_DATA) return;
      if ('requestIdleCallback' in window) {
        requestIdleCallback(warm, { timeout: 4000 });
      } else {
        setTimeout(warm, 2500);
      }
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
  })();

})();
