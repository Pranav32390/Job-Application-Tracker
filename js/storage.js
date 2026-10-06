const STORAGE_KEYS = {
  APPS: "careertrail_apps_sdc",
  LIVE_JOBS: "careertrail_live_jobs_sdc",
  USERS: "careertrail_users_sdc",
  CURRENT_USER: "careertrail_active_user_sdc",
  THEME: "careertrail_theme_sdc"
};

function getLiveDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

// Live vacancies posted by recruitment admin
const defaultLiveJobs = [
  { id: "job-101", company: "Google", role: "Software Engineer - UI", location: "Bengaluru", salary: "₹14–20 LPA", jobType: "Full-time", url: "https://careers.google.com", description: "Proficiency in JavaScript, browser rendering, DOM APIs.", postedDate: getLiveDate(-1) },
  { id: "job-102", company: "Microsoft", role: "Frontend Developer", location: "Hyderabad", salary: "₹12–18 LPA", jobType: "Full-time", url: "https://careers.microsoft.com", description: "Experience building accessible UI web components.", postedDate: getLiveDate(-2) },
  { id: "job-103", company: "Amazon", role: "Web Development Associate", location: "Hyderabad", salary: "₹11–16 LPA", jobType: "Full-time", url: "https://amazon.jobs", description: "Retail customer experience apps. Good coding foundations.", postedDate: getLiveDate(-3) },
  { id: "job-104", company: "Infosys", role: "Systems Engineer Specialist", location: "Pune", salary: "₹6–9 LPA", jobType: "Full-time", url: "https://infosys.com", description: "Engineering graduates with HTML/CSS & JS fundamentals.", postedDate: getLiveDate(-4) }
];

// Student tracked applications
const defaultApplications = [
  { id: "app-1", company: "Google", role: "Software Engineer - UI", location: "Bengaluru", salary: "₹14–20 LPA", date: getLiveDate(-1), status: "Interview", url: "https://careers.google.com", notes: "Technical round on closures & event loops.", favorite: true, candidateEmail: "alex@univ.edu" },
  { id: "app-2", company: "Microsoft", role: "Frontend Developer", location: "Hyderabad", salary: "₹12–18 LPA", date: getLiveDate(-3), status: "Applied", url: "https://careers.microsoft.com", notes: "Instant Easy Apply application submitted.", favorite: true, candidateEmail: "alex@univ.edu" },
  { id: "app-3", company: "Deloitte", role: "Analyst - UI Technologies", location: "Bengaluru", salary: "₹7–10 LPA", date: getLiveDate(-8), status: "Offer", url: "https://deloitte.com", notes: "Letter of intent received.", favorite: false, candidateEmail: "alex@univ.edu" }
];

// Users for verification
const defaultUsers = [
  { id: "u1", name: "Alex Student", email: "alex@univ.edu", password: "alex", role: "user" },
  { id: "u2", name: "Placement Officer", email: "admin@careertrail.com", password: "admin", role: "admin" }
];

function getApplications() {
  const data = localStorage.getItem(STORAGE_KEYS.APPS);
  return data ? JSON.parse(data) : structuredClone(defaultApplications);
}
function saveApplications(apps) {
  localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(apps));
}
function getLiveJobs() {
  const data = localStorage.getItem(STORAGE_KEYS.LIVE_JOBS);
  return data ? JSON.parse(data) : structuredClone(defaultLiveJobs);
}
function saveLiveJobs(jobs) {
  localStorage.setItem(STORAGE_KEYS.LIVE_JOBS, JSON.stringify(jobs));
}
function getUsers() {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : structuredClone(defaultUsers);
}
function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}
function getCurrentUser() {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : defaultUsers[0];
}
function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}
function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}
function getTheme() {
  return localStorage.getItem(STORAGE_KEYS.THEME) || "light";
}
function saveTheme(theme) {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}
function resetDatabase() {
  localStorage.removeItem(STORAGE_KEYS.APPS);
  localStorage.removeItem(STORAGE_KEYS.LIVE_JOBS);
  localStorage.removeItem(STORAGE_KEYS.USERS);
}