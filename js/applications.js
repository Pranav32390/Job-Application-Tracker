let currentFilter = "All";
let currentQuery = "";
let selectedApplicationId = null;

const statusOrder = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

const companyLogos = {
  Google: `<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M23.7 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.6c-.3 1.5-1.1 2.8-2.4 3.7v3.1h3.9c2.3-2.1 3.6-5.2 3.6-9z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.9-3.1c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5H1.2v3.2C3.2 21.3 7.3 24 12 24z"/><path fill="#FBBC05" d="M5.2 14.1c-.2-.7-.4-1.5-.4-2.1 0-.7.2-1.4.4-2.1V6.7H1.2C.4 8.3 0 10.1 0 12s.4 3.7 1.2 5.3l4-3.2z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.3 0 3.2 2.7 1.2 6.7l4 3.2c1-2.9 3.7-5.1 6.8-5.1z"/></svg>`,
  Microsoft: `<svg viewBox="0 0 24 24"><path fill="#f25022" d="M1 1h10v10H1z"/><path fill="#7fba00" d="M13 1h10v10H13z"/><path fill="#00a4ef" d="M1 13h10v10H1z"/><path fill="#ffb900" d="M13 13h10v10H13z"/></svg>`,
  Amazon: `<svg viewBox="0 0 24 24"><path fill="#FF9900" d="M13.9 14.5c-2.3 1.7-5.6 2.6-8.5 2.6-4 0-7.6-1.5-10.4-4-.2-.2 0-.5.2-.3 2.9 1.7 6.4 2.7 10.1 2.7 2.6 0 5.4-.6 8-1.8.4-.2.8.2.6.8z"/><path fill="#232F3E" d="M15.4 12.9c-.3-.4-1.9-.2-2.7-.1-.2 0-.3-.2-.1-.3 1.1-.9 2.9-.6 3.2-.2.3.4-.1 2.2-1.1 3-.2.1-.3 0-.3-.2.2-.6.7-1.8 1-2.2z"/></svg>`,
  Infosys: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#007cc3"/><text x="4" y="16" font-size="10" font-weight="bold" fill="#fff">INFY</text></svg>`,
  Deloitte: `<svg viewBox="0 0 24 24"><circle cx="7" cy="12" r="5" fill="#86BC25"/><text x="13" y="16" font-size="12" font-weight="900" fill="#000">D</text></svg>`
};

function getCompanyAvatar(company) {
  const match = Object.keys(companyLogos).find(c => c.toLowerCase() === company.trim().toLowerCase());
  if (match) return companyLogos[match];
  const initials = company.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return `<span class="avatar-text">${initials || "JOB"}</span>`;
}

function formatDate(dateStr) {
  if (!dateStr) return "Pending";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function renderJobCard(job, isAdmin = false) {
  const apps = getApplications();
  const alreadyApplied = apps.some(a => a.company.toLowerCase() === job.company.toLowerCase() && a.role.toLowerCase() === job.role.toLowerCase());

  let actionButtons = "";
  if (isAdmin) {
    actionButtons = `
      <span class="status-pill saved">Admin View</span>
      <button class="btn btn-danger" data-delete-job="${job.id}">Delete Vacancy</button>
    `;
  } else {
    actionButtons = `
      <a href="${job.url}" target="_blank" rel="noopener" class="btn btn-portal">Direct Portal ↗</a>
      ${alreadyApplied ? `<span class="status-pill applied">✓ Applied</span>` : `<button class="btn btn-easy" data-easy-apply="${job.id}">⚡ Easy Apply</button>`}
    `;
  }

  return `<article class="application-card">
    <div class="company-avatar">${getCompanyAvatar(job.company)}</div>
    <div class="app-main">
      <div class="app-top">
        <div><h3>${job.company}</h3><p>${job.role} <small style="color:var(--accent-green);font-weight:700;">● Active</small></p></div>
      </div>
      <div class="app-meta">
        <span>📍 ${job.location}</span>
        <span>💼 ${job.jobType || "Full-time"}</span>
        <span>💰 ${job.salary || "Competitive"}</span>
        <span>🕒 Posted: ${formatDate(job.postedDate)}</span>
      </div>
      <p style="font-size:12px;color:var(--muted);margin-top:4px;">${job.description || ""}</p>
    </div>
    <div class="app-status">${actionButtons}</div>
  </article>`;
}

function applicationCard(app) {
  return `<article class="application-card">
    <div class="company-avatar">${getCompanyAvatar(app.company)}</div>
    <div class="app-main">
      <div class="app-top">
        <div><h3>${app.company}</h3><p>${app.role}</p></div>
        <button class="star ${app.favorite ? "is-favorite" : ""}" data-favorite="${app.id}">${app.favorite ? "★" : "☆"}</button>
      </div>
      <div class="app-meta">
        <span>📍 ${app.location}</span>
        <span>🗓 Date: ${formatDate(app.date)}</span>
        <span>💰 ${app.salary || "N/A"}</span>
      </div>
    </div>
    <div class="app-status">
      <span class="status-pill ${app.status.toLowerCase()}">${app.status}</span>
      ${app.url ? `<a href="${app.url}" target="_blank" rel="noopener" class="btn btn-portal">Portal ↗</a>` : ""}
      <button class="btn btn-secondary" data-view="${app.id}">Details</button>
    </div>
  </article>`;
}

function renderAdminAnalytics() {
  const users = getUsers();
  const jobs = getLiveJobs();
  const apps = getApplications();
  const candidates = users.filter(u => u.role === "user");

  const cards = [
    { label: "Registered Candidates", val: candidates.length, icon: "🎓" },
    { label: "Active Job Listings", val: jobs.length, icon: "📢" },
    { label: "Candidate Applications Logged", val: apps.length, icon: "📈" },
    { label: "Offers Extended", val: apps.filter(a => a.status === "Offer").length, icon: "🎉" }
  ];

  const grid = document.getElementById("adminAnalyticsGrid");
  if (grid) {
    grid.innerHTML = cards.map(c => `
      <div class="stat-card">
        <div class="stat-icon">${c.icon}</div>
        <div><strong>${c.val}</strong><span>${c.label}</span></div>
      </div>
    `).join("");
  }

  const userList = document.getElementById("adminUserList");
  if (userList) {
    userList.innerHTML = users.map(u => `
      <div class="application-card">
        <div class="company-avatar"><span class="avatar-text">${u.name.slice(0, 2).toUpperCase()}</span></div>
        <div style="flex:1;">
          <h3>${u.name}</h3>
          <p style="font-size:12px;color:var(--muted);">${u.email} — Role: <b>${u.role.toUpperCase()}</b></p>
        </div>
        <span class="status-pill ${u.role === "admin" ? "offer" : "saved"}">${u.role.toUpperCase()}</span>
      </div>
    `).join("");
  }

  const jobList = document.getElementById("adminJobListings");
  if (jobList) {
    jobList.innerHTML = jobs.length ? jobs.map(j => renderJobCard(j, true)).join("") : `<div class="pipeline-empty">No active vacancies. Add one using the form above.</div>`;
  }
}

function renderUserStats() {
  const apps = getApplications();
  const counts = Object.fromEntries(statusOrder.map(s => [s, apps.filter(a => a.status === s).length]));
  const cards = [
    { label: "Applications Tracked", val: apps.length, icon: "📋" },
    { label: "Interviews Scheduled", val: counts.Interview, icon: "🎯" },
    { label: "Offers Received", val: counts.Offer, icon: "🏆" },
    { label: "Archived / Rejected", val: counts.Rejected, icon: "📁" }
  ];
  const grid = document.getElementById("statsGrid");
  if (grid) {
    grid.innerHTML = cards.map(c => `
      <div class="stat-card">
        <div class="stat-icon">${c.icon}</div>
        <div><strong>${c.val}</strong><span>${c.label}</span></div>
      </div>
    `).join("");
  }
}

function renderPipeline() {
  const apps = getApplications();
  const pipelineEl = document.getElementById("pipeline");
  if (!pipelineEl) return;
  pipelineEl.innerHTML = statusOrder.map(status => {
    const list = apps.filter(a => a.status === status);
    return `<div class="pipeline-column">
      <div class="pipeline-head"><span>${status}</span><span>${list.length}</span></div>
      ${list.slice(0, 3).map(a => `
        <div class="pipeline-card" data-view="${a.id}">
          <div class="company-avatar" style="width:22px;height:22px;">${getCompanyAvatar(a.company)}</div>
          <div><strong style="font-size:11px;">${a.company}</strong><p style="font-size:10px;color:var(--muted);">${a.role}</p></div>
        </div>`).join("")}
      ${list.length === 0 ? `<div class="pipeline-empty">No records</div>` : ""}
    </div>`;
  }).join("");
}

function renderAll() {
  const user = getCurrentUser();
  const isAdmin = user && user.role === "admin";
  const jobs = getLiveJobs();

  const exploreContainer = document.getElementById("exploreJobList");
  const dashContainer = document.getElementById("dashboardLiveBoard");
  if (exploreContainer) exploreContainer.innerHTML = jobs.length ? jobs.map(j => renderJobCard(j, isAdmin)).join("") : `<div class="pipeline-empty">No live openings posted.</div>`;
  if (dashContainer) dashContainer.innerHTML = jobs.slice(0, 3).map(j => renderJobCard(j, isAdmin)).join("");

  const list = getApplications().filter(a => {
    const text = `${a.company} ${a.role} ${a.location}`.toLowerCase();
    const matchFilter = (currentFilter === "All" || a.status === currentFilter);
    return matchFilter && text.includes(currentQuery.toLowerCase());
  });
  const allAppsEl = document.getElementById("allApplications");
  if (allAppsEl) allAppsEl.innerHTML = list.length ? list.map(applicationCard).join("") : `<div class="pipeline-empty">No applications found.</div>`;

  renderUserStats();
  renderPipeline();
  renderAdminAnalytics();
}