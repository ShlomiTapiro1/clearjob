/* ====================================================
   ClearJob — Mobile Enhancements
   Auto-injected on every page. Include at end of <body>.
   ==================================================== */

(function () {
  'use strict';

  /* ---- 1. Hamburger button in navbar ---- */
  function injectHamburger() {
    const actions = document.querySelector('.navbar-actions');
    if (!actions || document.querySelector('.hamburger')) return;

    const btn = document.createElement('button');
    btn.className = 'hamburger';
    btn.setAttribute('aria-label', 'תפריט');
    btn.innerHTML = '<span></span><span></span><span></span>';
    btn.onclick = toggleDrawer;
    actions.parentElement.insertBefore(btn, actions);
  }

  /* ---- 2. Mobile nav drawer ---- */
  const NAV_LINKS = [
    { href: 'index.html',               label: 'דף בית',          icon: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>' },
    { href: 'jobs.html',                label: 'חיפוש משרות',      icon: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>' },
    { href: 'candidate-dashboard.html', label: 'אזור מועמד/ת',    icon: '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
    { href: 'employer-dashboard.html',  label: 'אזור מעסיק',      icon: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>' },
    { href: 'create-job.html',          label: 'פרסם משרה',        icon: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>' },
  ];

  function injectDrawer() {
    if (document.getElementById('mobileDrawerOverlay')) return;

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    const linksHtml = NAV_LINKS.map(l => `
      <a href="${l.href}" class="mobile-nav-link${currentPage === l.href ? ' active' : ''}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${l.icon}</svg>
        ${l.label}
      </a>`).join('');

    const overlay = document.createElement('div');
    overlay.id = 'mobileDrawerOverlay';
    overlay.className = 'mobile-nav-overlay';
    overlay.onclick = closeDrawer;

    const drawer = document.createElement('nav');
    drawer.id = 'mobileDrawer';
    drawer.className = 'mobile-nav-drawer';
    drawer.setAttribute('aria-label', 'תפריט ניווט נייד');
    drawer.innerHTML = `
      <div class="mobile-nav-header">
        <a href="index.html" class="mobile-nav-logo">ClearJob</a>
        <button class="mobile-nav-close" onclick="closeMobileDrawer()" aria-label="סגור תפריט">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="mobile-nav-links">${linksHtml}</div>
      <div class="mobile-nav-footer" id="mobileNavFooter">
        <a href="login.html" class="btn btn-primary w-full">כניסה / הרשמה</a>
      </div>`;

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    // Update footer based on auth
    updateDrawerAuth();
  }

  function updateDrawerAuth() {
    const footer = document.getElementById('mobileNavFooter');
    if (!footer) return;
    const demoUser = localStorage.getItem('cj_demo_user');
    if (demoUser) {
      try {
        const u = JSON.parse(demoUser);
        footer.innerHTML = `
          <div style="font-size:13px; font-weight:700; color:var(--gray-800); margin-bottom:8px">${u.full_name || 'משתמש'}</div>
          <div style="font-size:11px; color:var(--gray-500); margin-bottom:12px">${_roleLabel(u.role)}</div>
          <button onclick="closeMobileDrawer(); Auth && Auth.signOut().then(()=>location.href='index.html')"
            class="btn btn-ghost w-full" style="color:var(--error)">התנתקות</button>`;
      } catch {}
    }
  }

  function _roleLabel(role) {
    return { candidate: 'מועמד/ת', employer: 'מעסיק', admin: 'מנהל מערכת' }[role] || role;
  }

  /* ---- 3. Toggle / close ---- */
  function toggleDrawer() {
    const overlay = document.getElementById('mobileDrawerOverlay');
    const drawer  = document.getElementById('mobileDrawer');
    const burger  = document.querySelector('.hamburger');
    const isOpen  = drawer?.classList.contains('open');

    if (isOpen) {
      closeDrawer();
    } else {
      overlay?.classList.add('open');
      drawer?.classList.add('open');
      burger?.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    document.getElementById('mobileDrawerOverlay')?.classList.remove('open');
    document.getElementById('mobileDrawer')?.classList.remove('open');
    document.querySelector('.hamburger')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Expose globally so inline onclick works
  window.closeMobileDrawer = closeDrawer;

  /* Keyboard: Escape closes drawer */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  /* ---- 4. Touch-action: remove 300ms delay ---- */
  function addTouchAction() {
    const style = document.createElement('style');
    style.textContent = 'a, button, [role="button"], input, select, textarea { touch-action: manipulation; }';
    document.head.appendChild(style);
  }

  /* ---- 5. Back-to-top button ---- */
  function injectBackToTop() {
    if (document.getElementById('backToTop')) return;
    const btn = document.createElement('button');
    btn.id = 'backToTop';
    btn.setAttribute('aria-label', 'חזרה לראש הדף');
    btn.style.cssText = `
      position: fixed; bottom: 80px; left: 16px;
      width: 44px; height: 44px; border-radius: 50%;
      background: var(--primary-600); color: #fff;
      border: none; cursor: pointer; z-index: 200;
      display: none; align-items: center; justify-content: center;
      box-shadow: var(--shadow-md);
      transition: opacity 0.2s, transform 0.2s;
    `;
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
      <polyline points="18,15 12,9 6,15"/>
    </svg>`;
    btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
      btn.style.display = window.scrollY > 400 ? 'flex' : 'none';
    }, { passive: true });
  }

  /* ---- 6. Swipe to close drawer ---- */
  let touchStartX = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  document.addEventListener('touchend', (e) => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    const drawer = document.getElementById('mobileDrawer');
    if (drawer?.classList.contains('open') && delta < -60) closeDrawer();
  }, { passive: true });

  /* ---- 7. Dashboard sidebar mobile toggle ---- */
  function injectSidebarToggle() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    // Inject overlay for sidebar
    const overlay = document.createElement('div');
    overlay.id = 'sidebarOverlay';
    overlay.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:390';
    overlay.onclick = closeSidebar;
    document.body.appendChild(overlay);

    window.openSidebar = function() {
      sidebar.classList.add('mobile-open');
      overlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
    };
    window.closeSidebar = function() {
      sidebar.classList.remove('mobile-open');
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    };
  }

  /* ---- Init on DOMContentLoaded ---- */
  function init() {
    injectHamburger();
    injectDrawer();
    addTouchAction();
    injectBackToTop();
    injectSidebarToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
