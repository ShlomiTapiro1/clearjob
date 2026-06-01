/* ====================================================
   ClearJob — Accessibility Widget (a11y.js)
   תקן ישראלי 5568 / WCAG 2.0 AA
   ==================================================== */
(function () {
  'use strict';

  const STORAGE_KEY = 'cj_a11y';
  const defaults = {
    fontSize: 0,      // -1 / 0 / +1 / +2
    contrast: false,
    grayscale: false,
    highlightLinks: false,
    stopAnimations: false,
    bigCursor: false,
  };

  let prefs = Object.assign({}, defaults);
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')); } catch (_) {}

  /* ---------- Apply preferences ---------- */
  function applyAll() {
    const root = document.documentElement;

    // Font size
    const sizes = [-2, 0, 2, 4, 6];
    root.style.setProperty('--a11y-font-delta', (sizes[prefs.fontSize + 1] || 0) + 'px');

    // High contrast
    root.classList.toggle('a11y-contrast', prefs.contrast);

    // Grayscale
    root.classList.toggle('a11y-grayscale', prefs.grayscale);

    // Highlight links
    root.classList.toggle('a11y-highlight-links', prefs.highlightLinks);

    // Stop animations
    root.classList.toggle('a11y-stop-animations', prefs.stopAnimations);

    // Big cursor
    root.classList.toggle('a11y-big-cursor', prefs.bigCursor);

    save();
    renderPanel();
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch (_) {}
  }

  function reset() {
    prefs = Object.assign({}, defaults);
    applyAll();
  }

  /* ---------- Inject CSS ---------- */
  function injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
      /* === A11Y CSS === */
      :root { --a11y-font-delta: 0px; }
      body  { font-size: calc(1rem + var(--a11y-font-delta)) !important; }

      .a11y-contrast {
        filter: contrast(1.6) brightness(1.1);
      }
      .a11y-grayscale {
        filter: grayscale(1);
      }
      .a11y-contrast.a11y-grayscale {
        filter: contrast(1.6) brightness(1.1) grayscale(1);
      }
      .a11y-highlight-links a {
        outline: 2px solid #f59e0b !important;
        outline-offset: 2px !important;
        background: rgba(245,158,11,.12) !important;
        border-radius: 3px !important;
      }
      .a11y-stop-animations *, .a11y-stop-animations *::before, .a11y-stop-animations *::after {
        animation: none !important;
        transition: none !important;
      }
      .a11y-big-cursor, .a11y-big-cursor * {
        cursor: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'><path fill='black' stroke='white' stroke-width='1' d='M4 0 L4 20 L8 16 L11 21 L13 20 L10 15 L15 15 Z'/></svg>") 4 4, auto !important;
      }

      /* === Skip link === */
      .skip-to-content {
        position: absolute;
        top: -100px;
        right: 16px;
        background: var(--primary-600, #2563eb);
        color: #fff;
        padding: 10px 18px;
        border-radius: 0 0 8px 8px;
        font-size: 15px;
        font-weight: 700;
        z-index: 9999;
        text-decoration: none;
        transition: top .2s;
      }
      .skip-to-content:focus { top: 0; }

      /* === Floating A11Y button === */
      #a11yTrigger {
        position: fixed;
        bottom: 80px;
        left: 16px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #1e40af;
        color: #fff;
        border: none;
        cursor: pointer;
        z-index: 9000;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(30,64,175,.45);
        transition: transform .2s, box-shadow .2s;
      }
      #a11yTrigger:hover  { transform: scale(1.1); box-shadow: 0 6px 20px rgba(30,64,175,.55); }
      #a11yTrigger:focus  { outline: 3px solid #fbbf24; outline-offset: 3px; }

      /* === A11Y Panel === */
      #a11yPanel {
        position: fixed;
        bottom: 140px;
        left: 16px;
        width: 280px;
        background: #fff;
        border: 1.5px solid #e2e8f0;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,.15);
        z-index: 9001;
        overflow: hidden;
        display: none;
        direction: rtl;
        font-family: inherit;
      }
      #a11yPanel.open { display: block; animation: a11ySlide .2s ease; }
      @keyframes a11ySlide { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }

      .a11y-panel-header {
        background: #1e40af;
        color: #fff;
        padding: 14px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .a11y-panel-title { font-size: 15px; font-weight: 700; }
      .a11y-panel-close {
        background: none; border: none; color: #fff;
        font-size: 20px; cursor: pointer; line-height: 1;
        padding: 2px 6px; border-radius: 6px;
      }
      .a11y-panel-close:hover { background: rgba(255,255,255,.2); }

      .a11y-section { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; }
      .a11y-section-title { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 8px; }

      .a11y-font-row { display: flex; align-items: center; gap: 8px; }
      .a11y-font-label { flex: 1; font-size: 14px; color: #334155; }
      .a11y-font-btns { display: flex; gap: 4px; }
      .a11y-font-btns button {
        width: 32px; height: 32px; border-radius: 8px;
        border: 1.5px solid #e2e8f0; background: #f8fafc;
        cursor: pointer; font-weight: 700; font-size: 13px;
        color: #334155; transition: all .15s;
      }
      .a11y-font-btns button:hover   { background: #e0e7ff; border-color: #6366f1; }
      .a11y-font-btns button.active  { background: #1e40af; color: #fff; border-color: #1e40af; }

      .a11y-toggle-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 8px 0; cursor: pointer;
      }
      .a11y-toggle-row + .a11y-toggle-row { border-top: 1px solid #f8fafc; }
      .a11y-toggle-label { font-size: 14px; color: #334155; user-select: none; }
      .a11y-toggle-switch {
        width: 40px; height: 22px; border-radius: 11px;
        background: #e2e8f0; position: relative; transition: background .2s; flex-shrink: 0;
      }
      .a11y-toggle-switch::after {
        content: ''; position: absolute;
        top: 3px; right: 3px;
        width: 16px; height: 16px; border-radius: 50%;
        background: #fff; transition: right .2s;
        box-shadow: 0 1px 3px rgba(0,0,0,.2);
      }
      .a11y-toggle-switch.on { background: #1e40af; }
      .a11y-toggle-switch.on::after { right: 21px; }

      .a11y-reset-row { padding: 12px 16px; }
      .a11y-reset-btn {
        width: 100%; padding: 9px; border-radius: 10px;
        border: 1.5px solid #e2e8f0; background: #f8fafc;
        cursor: pointer; font-size: 13px; color: #64748b;
        font-weight: 600; transition: all .15s;
      }
      .a11y-reset-btn:hover { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }

      .a11y-statement-link {
        display: block; text-align: center;
        padding: 10px; font-size: 12px; color: #2563eb;
        text-decoration: none; border-top: 1px solid #f1f5f9;
      }
      .a11y-statement-link:hover { text-decoration: underline; }
    `;
    document.head.appendChild(style);
  }

  /* ---------- Build Widget HTML ---------- */
  function buildWidget() {
    // Skip to content
    const skip = document.createElement('a');
    skip.href = '#main-content';
    skip.className = 'skip-to-content';
    skip.textContent = 'דלג לתוכן הראשי';
    document.body.insertBefore(skip, document.body.firstChild);

    // Mark main content if not already
    const main = document.querySelector('main, [role="main"], .page-content, .container');
    if (main && !main.id) main.id = 'main-content';
    else if (!document.getElementById('main-content') && main) main.id = 'main-content';

    // Floating trigger button
    const trigger = document.createElement('button');
    trigger.id = 'a11yTrigger';
    trigger.setAttribute('aria-label', 'פתח תפריט נגישות');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'a11yPanel');
    trigger.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8v4M12 16h.01"/>
    </svg>`;
    document.body.appendChild(trigger);

    // Panel
    const panel = document.createElement('div');
    panel.id = 'a11yPanel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'תפריט נגישות');
    panel.setAttribute('aria-modal', 'false');
    document.body.appendChild(panel);

    trigger.onclick = togglePanel;
  }

  /* ---------- Render Panel Content ---------- */
  function renderPanel() {
    const panel = document.getElementById('a11yPanel');
    if (!panel) return;

    const fontLabels = ['קטן', 'רגיל', 'גדול', 'גדול מאוד'];
    const fontBtns = fontLabels.map((l, i) => {
      const active = prefs.fontSize === i - 1;
      return `<button onclick="window._a11y.setFont(${i - 1})" class="${active ? 'active' : ''}" title="${l}" aria-label="גודל טקסט: ${l}" aria-pressed="${active}">${l === 'רגיל' ? 'A' : l === 'גדול' ? 'A+' : l === 'גדול מאוד' ? 'A++' : 'A-'}</button>`;
    }).join('');

    const toggles = [
      { key: 'contrast',       label: 'ניגודיות גבוהה',    icon: '◑' },
      { key: 'grayscale',      label: 'גווני אפור',          icon: '◐' },
      { key: 'highlightLinks', label: 'הדגשת קישורים',      icon: '🔗' },
      { key: 'stopAnimations', label: 'עצור אנימציות',       icon: '⏸' },
      { key: 'bigCursor',      label: 'סמן גדול',            icon: '↖' },
    ];

    const togglesHtml = toggles.map(t => `
      <div class="a11y-toggle-row" onclick="window._a11y.toggle('${t.key}')" role="switch" aria-checked="${!!prefs[t.key]}" tabindex="0" aria-label="${t.label}" onkeydown="if(event.key==='Enter'||event.key===' ')window._a11y.toggle('${t.key}')">
        <span class="a11y-toggle-label">${t.icon} ${t.label}</span>
        <span class="a11y-toggle-switch ${prefs[t.key] ? 'on' : ''}" aria-hidden="true"></span>
      </div>`).join('');

    panel.innerHTML = `
      <div class="a11y-panel-header">
        <span class="a11y-panel-title">♿ כלי נגישות</span>
        <button class="a11y-panel-close" onclick="window._a11y.closePanel()" aria-label="סגור תפריט נגישות">×</button>
      </div>
      <div class="a11y-section">
        <div class="a11y-section-title">גודל טקסט</div>
        <div class="a11y-font-row">
          <span class="a11y-font-label">התאם גודל</span>
          <div class="a11y-font-btns">${fontBtns}</div>
        </div>
      </div>
      <div class="a11y-section">${togglesHtml}</div>
      <div class="a11y-reset-row">
        <button class="a11y-reset-btn" onclick="window._a11y.reset()" aria-label="אפס כל הגדרות נגישות">↺ אפס הגדרות</button>
      </div>
      <a href="accessibility.html" class="a11y-statement-link">הצהרת נגישות</a>
    `;
  }

  function togglePanel() {
    const panel = document.getElementById('a11yPanel');
    const trigger = document.getElementById('a11yTrigger');
    const isOpen = panel.classList.contains('open');
    panel.classList.toggle('open', !isOpen);
    trigger.setAttribute('aria-expanded', String(!isOpen));
    if (!isOpen) {
      // focus close button
      setTimeout(() => panel.querySelector('.a11y-panel-close')?.focus(), 50);
    }
  }

  /* Close on Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const panel = document.getElementById('a11yPanel');
      if (panel?.classList.contains('open')) {
        panel.classList.remove('open');
        document.getElementById('a11yTrigger')?.focus();
      }
    }
  });

  /* Click outside to close */
  document.addEventListener('click', (e) => {
    const panel = document.getElementById('a11yPanel');
    const trigger = document.getElementById('a11yTrigger');
    if (panel?.classList.contains('open') && !panel.contains(e.target) && e.target !== trigger) {
      panel.classList.remove('open');
    }
  });

  /* ---------- Public API ---------- */
  window._a11y = {
    setFont(val) { prefs.fontSize = val; applyAll(); },
    toggle(key)  { prefs[key] = !prefs[key]; applyAll(); },
    reset()      { reset(); },
    closePanel() {
      document.getElementById('a11yPanel')?.classList.remove('open');
      document.getElementById('a11yTrigger')?.setAttribute('aria-expanded', 'false');
      document.getElementById('a11yTrigger')?.focus();
    },
  };

  /* ---------- Init ---------- */
  function init() {
    injectCSS();
    buildWidget();
    applyAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
