/* ====================================================
   ClearJob — Supabase Configuration
   הזן כאן את פרטי ה-Supabase שלך מ-Project Settings > API
   ==================================================== */

const SUPABASE_URL  = 'https://bqcyeandwqkrqjzcdzyt.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxY3llYW5kd3FrcnFqemNkenl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMzYzODgsImV4cCI6MjA5NTgxMjM4OH0.pZy_ybrpxB2UqtS8MMoPfj7zu8Sfs6XJT134XL0SG4c';

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
