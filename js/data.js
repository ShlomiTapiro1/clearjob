/* ====================================================
   ClearJob — Mock Data Layer
   Separated by entity type; mirrors production schema
   ==================================================== */

// ---- Employers ----
const EMPLOYERS = [];

// ---- Jobs ----
const JOBS = [];

// ---- Candidates ----
const CANDIDATES = [];

// ---- Applications ----
const MY_APPLICATIONS = [];

// ---- Employer's Applicants ----
const JOB1_APPLICANTS = [];

// ---- Employer Dashboard Stats ----
const EMPLOYER_STATS = {
  activeJobs: 0,
  totalApplicants: 0,
  newApplicants: 0,
  unseenApplicants: 0,
  waitingOver7Days: 0,
  upcomingInterviews: 0,
  avgResponseTime: 0,
  responseRate: 0,
  performanceScore: 0
};

// ---- Helpers ----
const STATUS_LABELS = {
  submitted: 'נשלחה',
  received: 'התקבלה',
  resumeOpened: 'קורות חיים נפתחו',
  atsReviewed: 'עבר סינון ATS',
  recruiterReviewed: 'בבדיקת מגייס',
  sentToHiringManager: 'הועבר למנהל',
  interviewInvited: 'הוזמן לראיון',
  interviewCompleted: 'ראיון בוצע',
  waitingDecision: 'ממתין להחלטה',
  advanced: 'התקדם',
  offer: 'קיבל הצעה',
  rejected: 'לא התקדם',
  jobClosed: 'משרה נסגרה',
  withdrawn: 'משך מועמדות'
};

const STATUS_COLORS = {
  submitted: 'gray',
  received: 'gray',
  resumeOpened: 'primary',
  atsReviewed: 'primary',
  recruiterReviewed: 'primary',
  sentToHiringManager: 'primary',
  interviewInvited: 'teal',
  interviewCompleted: 'teal',
  waitingDecision: 'warning',
  advanced: 'success',
  offer: 'success',
  rejected: 'error',
  jobClosed: 'gray',
  withdrawn: 'gray'
};

const REJECTION_REASONS = {
  missingExperience: 'חסר ניסיון רלוונטי',
  missingRequiredSkill: 'חסרה מיומנות חובה',
  salaryMismatch: 'ציפיות שכר לא תואמות',
  availabilityMismatch: 'זמינות לא מתאימה',
  locationMismatch: 'מיקום לא מתאים',
  jobClosed: 'המשרה נסגרה',
  roleFrozen: 'התפקיד הוקפא',
  anotherCandidateAdvanced: 'מועמד אחר התקדם',
  notFitForCurrentStage: 'חוסר התאמה לשלב הנוכחי',
  resumeNotClear: 'קורות החיים לא היו מספיק ברורים',
  other: 'אחר'
};

const WORK_MODEL_LABELS = { office: 'משרד מלא', hybrid: 'היברידי', remote: 'מרחוק' };
const EMPLOYMENT_TYPE_LABELS = { fullTime: 'משרה מלאה', partTime: 'משרה חלקית', freelance: 'פרילנס', temporary: 'זמנית' };
const EXPERIENCE_LABELS = { junior: 'ג\'וניור', mid: 'ניסיון בינוני', senior: 'בכיר', manager: 'מנהל' };

function formatSalary(min, max, type) {
  const t = type === 'monthly' ? '/חודש' : type === 'hourly' ? '/שעה' : '';
  if (min && max) return `₪${min.toLocaleString('he-IL')}–${max.toLocaleString('he-IL')}${t}`;
  if (min) return `מ-₪${min.toLocaleString('he-IL')}${t}`;
  return '—';
}

function getEmployer(id) { return EMPLOYERS.find(e => e.id === id); }
function getJob(id) { return JOBS.find(j => j.id === id); }
function daysSince(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - d) / 86400000);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}
