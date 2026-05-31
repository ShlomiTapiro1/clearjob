/* ====================================================
   ClearJob — Supabase Configuration
   הזן כאן את פרטי ה-Supabase שלך מ-Project Settings > API
   ==================================================== */

const SUPABASE_URL  = 'https://bqcyeandwqkrqjzcdzyt.supabase.co';
const SUPABASE_KEY  = 'sb_publishable_KESW1vaMXheQhKJcDdWA3Q_usNyNYD1';

/* האם להשתמש בנתוני demo (data.js) כאשר אין חיבור לSupabase?
   true  = demo mode (ללא Supabase)
   false = Supabase live mode */
const DEMO_MODE = (SUPABASE_URL.includes('YOUR_PROJECT'));

/* Platform config */
const APP_CONFIG = {
  name:        'ClearJob',
  adminEmail:  'admin@clearjob.co.il',
  defaultRole: 'candidate',
  routes: {
    candidate: 'candidate-dashboard.html',
    employer:  'employer-dashboard.html',
    admin:     'admin.html',
    login:     'login.html',
    home:      'index.html'
  }
};
