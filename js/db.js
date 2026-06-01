/* ====================================================
   ClearJob — Supabase DB Layer
   Wraps all database operations; falls back to data.js in DEMO_MODE
   ==================================================== */

/* ---- Init ---- */
let _supabase = null;

function getClient() {
  if (_supabase) return _supabase;
  if (typeof supabase !== 'undefined' && !DEMO_MODE) {
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return _supabase;
}

/* ---- Auth ---- */
const Auth = {
  async signIn(email, password) {
    if (DEMO_MODE) return _demoSignIn(email, password);
    const { data, error } = await getClient().auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signUp(email, password, role, meta = {}) {
    if (DEMO_MODE) return _demoSignUp(email, password, role, meta);
    const { data, error } = await getClient().auth.signUp({
      email, password,
      options: { data: { role, ...meta } }
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (DEMO_MODE) { localStorage.removeItem('cj_demo_user'); return; }
    await getClient().auth.signOut();
  },

  async getSession() {
    if (DEMO_MODE) return _demoGetSession();
    const { data } = await getClient().auth.getSession();
    return data.session;
  },

  async getUser() {
    if (DEMO_MODE) return _demoGetUser();
    const { data } = await getClient().auth.getUser();
    return data.user;
  },

  onAuthStateChange(callback) {
    if (DEMO_MODE) return { data: { subscription: { unsubscribe: () => {} } } };
    return getClient().auth.onAuthStateChange(callback);
  }
};

/* ---- Profiles ---- */
const Profiles = {
  async get(userId) {
    if (DEMO_MODE) return _demoProfile(userId);
    const { data, error } = await getClient().from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
  },

  async create(userId, role, fullName) {
    if (DEMO_MODE) return { id: userId, role, full_name: fullName };
    const { data, error } = await getClient().from('profiles').upsert({
      id: userId, role, full_name: fullName, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    }, { onConflict: 'id' }).select().single();
    if (error) throw error;
    return data;
  },

  async update(userId, updates) {
    if (DEMO_MODE) return { ...updates };
    const { data, error } = await getClient().from('profiles').update(updates).eq('id', userId).select().single();
    if (error) throw error;
    return data;
  },

  async getAll() {
    if (DEMO_MODE) return _demoAllProfiles();
    const { data, error } = await getClient().from('profiles').select('*, employers(*), candidates(*)').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};

/* ---- Employers ---- */
const Employers = {
  async getByUserId(userId) {
    if (DEMO_MODE) return EMPLOYERS.find(e => e.id === 'emp1') || EMPLOYERS[0];
    const { data, error } = await getClient().from('employers').select('*').eq('user_id', userId).single();
    if (error) throw error;
    return data;
  },

  async getById(id) {
    if (DEMO_MODE) return getEmployer(id);
    const { data, error } = await getClient().from('employers').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async create(userId, companyData) {
    if (DEMO_MODE) return { id: 'emp_new', ...companyData };
    const { data, error } = await getClient().from('employers').insert({ user_id: userId, is_approved: true, ...companyData }).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    if (DEMO_MODE) return { id, ...updates };
    const { data, error } = await getClient().from('employers').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async getAll() {
    if (DEMO_MODE) return EMPLOYERS;
    const { data, error } = await getClient().from('employers').select('*, profiles(full_name, created_at)').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async approve(id, approved) {
    if (DEMO_MODE) return;
    const { error } = await getClient().from('employers').update({ is_approved: approved }).eq('id', id);
    if (error) throw error;
  }
};

/* ---- Candidates ---- */
const Candidates = {
  async getByUserId(userId) {
    if (DEMO_MODE) return CANDIDATES[0];
    const { data, error } = await getClient().from('candidates').select('*').eq('user_id', userId).single();
    if (error) throw error;
    return data;
  },

  async create(userId, profileData) {
    if (DEMO_MODE) return { id: 'c_new', ...profileData };
    const { data, error } = await getClient().from('candidates').insert({ user_id: userId, ...profileData }).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    if (DEMO_MODE) return { id, ...updates };
    const { data, error } = await getClient().from('candidates').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
};

/* ---- Jobs ---- */
const Jobs = {
  async getAll(filters = {}) {
    if (DEMO_MODE) return _demoFilterJobs(filters);
    let query = getClient().from('jobs').select(`
      *,
      employers (id, company_name, is_confidential, confidentiality_level, industry, area, employer_type, tags)
    `).eq('status', 'active');

    if (filters.category)  query = query.eq('category', filters.category);
    if (filters.workModel) query = query.eq('work_model', filters.workModel);
    if (filters.salaryMin) query = query.gte('salary_min', filters.salaryMin);
    if (filters.search)    query = query.ilike('title', `%${filters.search}%`);
    if (filters.limit)     query = query.limit(filters.limit);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    if (DEMO_MODE) return getJob(id);
    const { data, error } = await getClient().from('jobs').select(`
      *, employers (*)
    `).eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async getByEmployer(employerId) {
    if (DEMO_MODE) return JOBS.filter(j => j.employerId === employerId);
    const { data, error } = await getClient().from('jobs').select('*').eq('employer_id', employerId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(employerId, jobData) {
    if (DEMO_MODE) return { id: 'job_new', ...jobData };
    const score = _calcTransparencyScore(jobData);
    const { data, error } = await getClient().from('jobs').insert({ employer_id: employerId, transparency_score: score, ...jobData }).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    if (DEMO_MODE) return { id, ...updates };
    const { data, error } = await getClient().from('jobs').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    if (DEMO_MODE) return;
    const { error } = await getClient().from('jobs').delete().eq('id', id);
    if (error) throw error;
  },

  async getAllAdmin() {
    if (DEMO_MODE) return JOBS;
    const { data, error } = await getClient().from('jobs').select('*, employers(company_name)').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};

/* ---- Applications ---- */
const Applications = {
  async getByCandidate(candidateId) {
    if (DEMO_MODE) return MY_APPLICATIONS;
    const { data, error } = await getClient().from('applications').select(`
      *, jobs (id, title, salary_min, salary_max, location, work_model, employers (company_name, is_confidential))
    `).eq('candidate_id', candidateId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByJob(jobId) {
    if (DEMO_MODE) return JOB1_APPLICANTS;
    const { data, error } = await getClient().from('applications').select(`
      *, candidates (id, user_id, headline, location, experience_years, profiles (full_name, phone))
    `).eq('job_id', jobId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(applicationData) {
    if (DEMO_MODE) return { id: 'app_new', ...applicationData };
    const { data, error } = await getClient().from('applications').insert(applicationData).select().single();
    if (error) throw error;
    // Auto timeline event
    await Timeline.create({ application_id: data.id, event_type: 'submitted', title: 'הגשת מועמדות', description: 'המועמדות נשלחה בהצלחה' });
    return data;
  },

  async update(id, updates) {
    if (DEMO_MODE) return { id, ...updates };
    const { data, error } = await getClient().from('applications').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    if (DEMO_MODE) return;
    const { error } = await getClient().from('applications').delete().eq('id', id);
    if (error) throw error;
  },

  async updateStatus(id, status) {
    return Applications.update(id, { status, updated_at: new Date().toISOString() });
  },

  async getAll() {
    if (DEMO_MODE) return MY_APPLICATIONS;
    const { data, error } = await getClient().from('applications').select('*, jobs(title), candidates(profiles(full_name))').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};

/* ---- Timeline ---- */
const Timeline = {
  async getByApplication(applicationId) {
    if (DEMO_MODE) {
      const app = MY_APPLICATIONS.find(a => a.id === applicationId);
      return app ? app.timeline : [];
    }
    const { data, error } = await getClient().from('application_timeline').select('*').eq('application_id', applicationId).order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async create(eventData) {
    if (DEMO_MODE) return { id: 'tl_new', ...eventData };
    const { data, error } = await getClient().from('application_timeline').insert(eventData).select().single();
    if (error) throw error;
    return data;
  }
};

/* ---- Saved Jobs ---- */
const SavedJobs = {
  async getByCandidate(candidateId) {
    if (DEMO_MODE) return JOBS.filter(j => j.id === 'job3' || j.id === 'job5');
    const { data, error } = await getClient().from('saved_jobs').select('*, jobs(*)').eq('candidate_id', candidateId);
    if (error) throw error;
    return data.map(s => s.jobs);
  },

  async toggle(candidateId, jobId) {
    if (DEMO_MODE) return { saved: true };
    const { data: existing } = await getClient().from('saved_jobs').select('id').eq('candidate_id', candidateId).eq('job_id', jobId).single();
    if (existing) {
      await getClient().from('saved_jobs').delete().eq('id', existing.id);
      return { saved: false };
    } else {
      await getClient().from('saved_jobs').insert({ candidate_id: candidateId, job_id: jobId });
      return { saved: true };
    }
  },

  async isSaved(candidateId, jobId) {
    if (DEMO_MODE) return false;
    const { data } = await getClient().from('saved_jobs').select('id').eq('candidate_id', candidateId).eq('job_id', jobId).single();
    return !!data;
  }
};

/* ---- Admin Stats ---- */
const AdminStats = {
  async get() {
    if (DEMO_MODE) return {
      total_users: 47, total_jobs: 12, total_applications: 89,
      active_jobs: 10, pending_employers: 3, new_today: 8,
      jobs_by_category: { 'תוכנה': 5, 'מוצר': 3, 'רכש': 2, 'שיווק': 2 },
      registrations_by_day: [3,5,2,8,4,7,12]
    };
    const [users, jobs, apps, employers] = await Promise.all([
      getClient().from('profiles').select('id, role, created_at'),
      getClient().from('jobs').select('id, status, category, created_at'),
      getClient().from('applications').select('id, created_at, status'),
      getClient().from('employers').select('id, is_approved, created_at')
    ]);
    return {
      total_users:       users.data?.length || 0,
      total_jobs:        jobs.data?.length  || 0,
      total_applications:apps.data?.length  || 0,
      active_jobs:       jobs.data?.filter(j => j.status === 'active').length || 0,
      pending_employers: employers.data?.filter(e => !e.is_approved).length || 0
    };
  }
};

/* ============================================================
   Demo / Fallback helpers (uses data.js arrays)
   ============================================================ */

function _demoSignIn(email, password) {
  const DEMO_USERS = {
    'admin@clearjob.co.il':    { id: 'admin1', role: 'admin',     full_name: 'מנהל מערכת' },
    'employer@clearjob.co.il': { id: 'emp_u1', role: 'employer',  full_name: 'דנה לוי' },
    'candidate@clearjob.co.il':{ id: 'cand_u1',role: 'candidate', full_name: 'יעל כהן' }
  };
  const user = DEMO_USERS[email];
  if (!user || password !== 'Demo1234!') throw new Error('שם משתמש או סיסמה שגויים');
  localStorage.setItem('cj_demo_user', JSON.stringify(user));
  return { user };
}

function _demoSignUp(email, password, role, meta) {
  const user = { id: 'new_' + Date.now(), role, full_name: meta.full_name || '', email };
  localStorage.setItem('cj_demo_user', JSON.stringify(user));
  return { user };
}

function _demoGetSession() {
  const u = localStorage.getItem('cj_demo_user');
  return u ? { user: JSON.parse(u) } : null;
}

function _demoGetUser() {
  const u = localStorage.getItem('cj_demo_user');
  return u ? JSON.parse(u) : null;
}

function _demoProfile(userId) {
  const u = _demoGetUser();
  return u || { id: userId, role: 'candidate', full_name: 'Demo User' };
}

function _demoAllProfiles() {
  return [
    { id: 'admin1',  role: 'admin',    full_name: 'מנהל מערכת',     created_at: '2026-01-01' },
    { id: 'emp_u1',  role: 'employer', full_name: 'דנה לוי',        created_at: '2026-02-14' },
    { id: 'cand_u1', role: 'candidate',full_name: 'יעל כהן',        created_at: '2026-03-01' },
    { id: 'cand_u2', role: 'candidate',full_name: 'רון אברהם',      created_at: '2026-03-12' },
    { id: 'cand_u3', role: 'candidate',full_name: 'נועה ברק',       created_at: '2026-04-05' },
    { id: 'emp_u2',  role: 'employer', full_name: 'אבי שמיר',       created_at: '2026-04-18' },
    { id: 'cand_u4', role: 'candidate',full_name: 'מור דוד',        created_at: '2026-05-01' },
    { id: 'emp_u3',  role: 'employer', full_name: 'לירון כץ',       created_at: '2026-05-20' }
  ];
}

function _demoFilterJobs(filters) {
  let jobs = [...JOBS];
  if (filters.search) jobs = jobs.filter(j => j.title.includes(filters.search));
  if (filters.category) jobs = jobs.filter(j => j.category === filters.category);
  if (filters.workModel) jobs = jobs.filter(j => j.workModel === filters.workModel);
  if (filters.limit) jobs = jobs.slice(0, filters.limit);
  return jobs;
}

function _calcTransparencyScore(job) {
  let score = 0;
  if (job.salary_min && job.salary_max) score += 40;
  if (job.hiring_process && JSON.parse(job.hiring_process || '[]').length > 0) score += 25;
  if (job.review_method) score += 15;
  if (job.average_response_days && job.average_response_days <= 7) score += 10;
  if (!job.has_home_assignment) score += 10;
  return Math.min(100, score);
}
