/* ====================================================
   ClearJob — Auth Helper
   Include after config.js and db.js on every protected page
   ==================================================== */

let _currentUser   = null;
let _currentProfile = null;

/* ---- Session Bootstrap ---- */
async function initAuth() {
  const session = await Auth.getSession();
  if (!session) return null;
  const user = DEMO_MODE ? session.user : session.user;
  _currentUser = user;
  try {
    _currentProfile = await Profiles.get(user.id);
  } catch {
    _currentProfile = { id: user.id, role: user.role || 'candidate', full_name: user.full_name || '' };
  }
  _updateNavbar();
  return _currentProfile;
}

/* ---- Guards ---- */
async function requireAuth(redirectTo = 'login.html') {
  const profile = await initAuth();
  if (!profile) { window.location.href = redirectTo; return null; }
  return profile;
}

async function requireRole(role, redirectTo = 'index.html') {
  const profile = await requireAuth();
  if (!profile) return null;
  if (profile.role !== role && profile.role !== 'admin') {
    window.location.href = redirectTo;
    return null;
  }
  return profile;
}

async function requireAdmin() {
  return requireRole('admin', 'index.html');
}

/* ---- Current user getters (sync after initAuth) ---- */
function getAuthUser()    { return _currentUser; }
function getAuthProfile() { return _currentProfile; }
function isAdmin()        { return _currentProfile?.role === 'admin'; }
function isEmployer()     { return _currentProfile?.role === 'employer'; }
function isCandidate()    { return _currentProfile?.role === 'candidate'; }

/* ---- Logout ---- */
async function logout() {
  await Auth.signOut();
  window.location.href = 'index.html';
}

/* ---- Navbar update ---- */
function _updateNavbar() {
  const profile = _currentProfile;
  if (!profile) return;

  const actionsEl = document.querySelector('.navbar-actions');
  if (!actionsEl) return;

  const name = profile.full_name || 'משתמש';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2);

  let dashLink = '';
  if (profile.role === 'admin')     dashLink = `<a href="admin.html" class="btn btn-ghost btn-sm">ניהול מערכת</a>`;
  if (profile.role === 'employer')  dashLink = `<a href="employer-dashboard.html" class="btn btn-ghost btn-sm">אזור מעסיק</a>`;
  if (profile.role === 'candidate') dashLink = `<a href="candidate-dashboard.html" class="btn btn-ghost btn-sm">האזור שלי</a>`;

  actionsEl.innerHTML = `
    ${dashLink}
    <div class="nav-avatar" onclick="toggleUserMenu()" title="${name}">
      ${initials}
      <div class="user-menu" id="userMenu">
        <div class="user-menu-name">${name}</div>
        <div class="user-menu-role">${_roleLabel(profile.role)}</div>
        <hr style="margin:8px 0; border-color:var(--gray-100)">
        <a class="user-menu-item" href="${APP_CONFIG.routes[profile.role]}">הדשבורד שלי</a>
        <button class="user-menu-item danger" onclick="logout()">התנתקות</button>
      </div>
    </div>
  `;
}

function toggleUserMenu() {
  document.getElementById('userMenu')?.classList.toggle('open');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-avatar')) {
    document.getElementById('userMenu')?.classList.remove('open');
  }
});

function _roleLabel(role) {
  return { candidate: 'מועמד/ת', employer: 'מעסיק', admin: 'מנהל מערכת' }[role] || role;
}

/* ---- Google OAuth (optional) ---- */
async function signInWithGoogle() {
  if (DEMO_MODE) { alert('Google Auth לא זמין במצב דמו'); return; }
  const { error } = await getClient().auth.signInWithOAuth({ provider: 'google' });
  if (error) throw error;
}
