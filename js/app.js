const $ = id => document.getElementById(id);

function showToast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window.tTimer);
  window.tTimer = setTimeout(() => t.classList.remove("show"), 2500);
}

function openModal(id) { $(id).classList.add("open"); }
function closeModal(id) { $(id).classList.remove("open"); }

function setupNavigation() {
  const user = getCurrentUser();
  const nav = $("sideNav");

  if (user.role === "admin") {
    nav.innerHTML = `
      <a class="nav-link active" href="#admin">🛡️ <span>Admin Analytics</span></a>
      <a class="nav-link" href="#explore">🌐 <span>Live Job Board</span></a>
      <a class="nav-link" href="#settings">⚙️ <span>Settings</span></a>
    `;
    $("topbarModuleTag").textContent = "ADMINISTRATOR WORKSPACE";
    $("roleBadge").textContent = "ADMIN MODULE";
  } else {
    nav.innerHTML = `
      <a class="nav-link active" href="#dashboard">🏠 <span>Dashboard</span></a>
      <a class="nav-link" href="#explore">🌐 <span>Live Job Board</span></a>
      <a class="nav-link" href="#applications">💼 <span>My Applications</span></a>
      <a class="nav-link" href="#interviews">📅 <span>Interviews</span></a>
      <a class="nav-link" href="#saved">⭐ <span>Saved Jobs</span></a>
      <a class="nav-link" href="#settings">⚙️ <span>Settings</span></a>
    `;
    $("topbarModuleTag").textContent = "CANDIDATE WORKSPACE";
    $("roleBadge").textContent = "USER MODULE";
  }

  function handleRoute() {
    let hash = location.hash.replace("#", "");
    if (!hash) hash = user.role === "admin" ? "admin" : "dashboard";

    if (user.role !== "admin" && hash === "admin") {
      showToast("Access Denied: Admin Module only.");
      location.hash = "#dashboard";
      return;
    }
    if (user.role === "admin" && (hash === "dashboard" || hash === "applications" || hash === "interviews" || hash === "saved")) {
      location.hash = "#admin";
      return;
    }

    document.querySelectorAll(".nav-link").forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + hash));
    
    // Explicitly unhide only the current section to prevent double-page layout collisions
    document.querySelectorAll(".page-section").forEach(s => {
      if (s.id === hash) {
        s.classList.add("visible");
      } else {
        s.classList.remove("visible");
      }
    });

    $("pageTitle").textContent = hash.charAt(0).toUpperCase() + hash.slice(1);
    $("sidebar").classList.remove("open");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  window.addEventListener("hashchange", handleRoute);
  handleRoute();
}

function setupAuth() {
  const user = getCurrentUser();
  if (!user) $("authOverlay").classList.remove("hidden");
  else updateUserHeader(user);

  $("tabLoginBtn").onclick = () => {
    $("tabLoginBtn").classList.add("active");
    $("tabSignupBtn").classList.remove("active");
    $("loginForm").classList.remove("hidden");
    $("signupForm").classList.add("hidden");
  };

  $("tabSignupBtn").onclick = () => {
    $("tabSignupBtn").classList.add("active");
    $("tabLoginBtn").classList.remove("active");
    $("signupForm").classList.remove("hidden");
    $("loginForm").classList.add("hidden");
  };

  $("loginForm").onsubmit = e => {
    e.preventDefault();
    const email = $("loginEmail").value.trim();
    const pass = $("loginPassword").value.trim();
    const matched = getUsers().find(u => u.email === email && u.password === pass);
    if (matched) {
      setCurrentUser(matched);
      $("authOverlay").classList.add("hidden");
      updateUserHeader(matched);
      setupNavigation();
      showToast(`Logged in as ${matched.name}`);
      location.hash = matched.role === "admin" ? "#admin" : "#dashboard";
      renderAll();
    } else {
      showToast("Invalid credentials.");
    }
  };

  $("signupForm").onsubmit = e => {
    e.preventDefault();
    const name = $("signupName").value.trim();
    const email = $("signupEmail").value.trim();
    const pass = $("signupPassword").value.trim();
    const role = $("signupRole").value;
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      showToast("Account already exists.");
      return;
    }
    const newUser = { id: "u_" + Date.now(), name, email, password: pass, role };
    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);
    $("authOverlay").classList.add("hidden");
    updateUserHeader(newUser);
    setupNavigation();
    showToast(`Registered as ${role.toUpperCase()}`);
    location.hash = role === "admin" ? "#admin" : "#dashboard";
    renderAll();
  };

  $("logoutBtn").onclick = () => {
    clearCurrentUser();
    location.reload();
  };
}

function updateUserHeader(user) {
  $("userNameText").textContent = user.name.split(" ")[0];
  $("userInitial").textContent = user.name.slice(0, 2).toUpperCase();
  $("ddName").textContent = user.name;
  $("ddEmail").textContent = user.email;
  const greet = $("heroGreeting");
  if (greet) greet.textContent = `WELCOME ${user.name.toUpperCase()}`;
}

function setupDelegatedActions() {
  document.addEventListener("click", e => {
    const user = getCurrentUser();

    // Easy Apply
    const applyBtn = e.target.closest("[data-easy-apply]");
    if (applyBtn) {
      if (user.role === "admin") {
        showToast("Admins cannot apply to jobs. Switch to Candidate role.");
        return;
      }
      const job = getLiveJobs().find(j => j.id === applyBtn.dataset.easyApply);
      if (!job) return;

      const apps = getApplications();
      if (apps.some(a => a.company.toLowerCase() === job.company.toLowerCase() && a.role.toLowerCase() === job.role.toLowerCase())) {
        showToast("Already applied to this job.");
        return;
      }

      apps.unshift({
        id: "app_" + Date.now(),
        company: job.company,
        role: job.role,
        location: job.location,
        salary: job.salary,
        date: getLiveDate(0),
        status: "Applied",
        url: job.url,
        notes: `1-Click Easy Apply synced with profile: ${user.name} (${user.email}).`,
        favorite: true,
        candidateEmail: user.email
      });

      saveApplications(apps);
      renderAll();
      showToast(`⚡ Easy Applied to ${job.company}!`);
      return;
    }

    // Delete Job (Admin)
    const delJobBtn = e.target.closest("[data-delete-job]");
    if (delJobBtn) {
      if (confirm("Delete this vacancy from the live board?")) {
        saveLiveJobs(getLiveJobs().filter(j => j.id !== delJobBtn.dataset.deleteJob));
        renderAll();
        showToast("Vacancy removed.");
      }
      return;
    }

    // View Details
    const viewBtn = e.target.closest("[data-view]");
    if (viewBtn) {
      const app = getApplications().find(a => a.id === viewBtn.dataset.view);
      if (!app) return;
      selectedApplicationId = app.id;
      $("detailContent").innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <div class="company-avatar">${getCompanyAvatar(app.company)}</div>
          <div><h3>${app.company}</h3><p style="color:var(--muted);">${app.role}</p></div>
        </div>
        <div class="form-grid" style="margin:14px 0;">
          <div><small style="color:var(--muted);">Location</small><strong>${app.location}</strong></div>
          <div><small style="color:var(--muted);">Status</small><strong class="status-pill ${app.status.toLowerCase()}">${app.status}</strong></div>
          <div><small style="color:var(--muted);">Package</small><strong>${app.salary || "N/A"}</strong></div>
          <div><small style="color:var(--muted);">Applied Date</small><strong>${formatDate(app.date)}</strong></div>
        </div>
        <div style="background:var(--surface-2);padding:10px;border-radius:8px;">
          <small style="color:var(--muted);">Notes:</small>
          <p style="margin-top:4px;">${app.notes || "No notes documented."}</p>
        </div>
      `;
      openModal("detailsModal");
      return;
    }

    // Star Toggle
    const starBtn = e.target.closest("[data-favorite]");
    if (starBtn) {
      const apps = getApplications();
      const item = apps.find(a => a.id === starBtn.dataset.favorite);
      if (item) {
        item.favorite = !item.favorite;
        saveApplications(apps);
        renderAll();
      }
      return;
    }

    if (e.target.closest(".modal") || e.target.closest(".auth-box")) return;
    if (e.target.classList.contains("modal-backdrop")) closeModal(e.target.id);
    if (!e.target.closest("#profileBtn") && !e.target.closest("#userDropdown")) $("userDropdown")?.classList.remove("open");
  });
}

function setupStaticFormListeners() {
  const adminPostForm = $("adminPostJobForm");
  if (adminPostForm) {
    adminPostForm.onsubmit = e => {
      e.preventDefault();
      const jobs = getLiveJobs();
      jobs.unshift({
        id: "job-" + Date.now(),
        company: $("postCompany").value.trim(),
        role: $("postRole").value.trim(),
        location: $("postLocation").value.trim(),
        salary: $("postSalary").value.trim() || "Competitive",
        jobType: $("postType").value,
        url: $("postUrl").value.trim(),
        description: $("postDesc").value.trim(),
        postedDate: getLiveDate(0)
      });
      saveLiveJobs(jobs);
      adminPostForm.reset();
      renderAll();
      showToast("🚀 Vacancy published live to Candidate Board!");
    };
  }

  const appForm = $("applicationForm");
  if (appForm) {
    appForm.onsubmit = e => {
      e.preventDefault();
      const apps = getApplications();
      apps.unshift({
        id: "app-" + Date.now(),
        company: $("company").value.trim(),
        role: $("role").value.trim(),
        location: $("location").value.trim(),
        salary: $("salary").value.trim(),
        date: $("applicationDate").value,
        status: $("status").value,
        url: $("jobUrl").value.trim(),
        notes: $("notes").value.trim(),
        favorite: false,
        candidateEmail: getCurrentUser().email
      });
      saveApplications(apps);
      closeModal("applicationModal");
      renderAll();
      showToast("Application logged!");
    };
  }

  $("addApplicationBtn")?.addEventListener("click", () => {
    $("applicationForm").reset();
    $("applicationDate").value = getLiveDate(0);
    openModal("applicationModal");
  });
  $("closeApplicationModal")?.addEventListener("click", () => closeModal("applicationModal"));
  $("cancelForm")?.addEventListener("click", () => closeModal("applicationModal"));
  $("closeDetailsModal")?.addEventListener("click", () => closeModal("detailsModal"));
  $("closeDetailsBtn")?.addEventListener("click", () => closeModal("detailsModal"));

  $("deleteApplication")?.addEventListener("click", () => {
    if (confirm("Delete this record?")) {
      saveApplications(getApplications().filter(a => a.id !== selectedApplicationId));
      closeModal("detailsModal");
      renderAll();
      showToast("Application deleted.");
    }
  });

  $("menuBtn")?.addEventListener("click", () => $("sidebar").classList.toggle("open"));
  $("profileBtn")?.addEventListener("click", () => $("userDropdown").classList.toggle("open"));

  $("themeToggle")?.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    $("themeToggle").classList.toggle("on", isDark);
    saveTheme(isDark ? "dark" : "light");
  });

  $("resetData")?.addEventListener("click", () => {
    if (confirm("Reset to default system state?")) {
      resetDatabase();
      renderAll();
      showToast("Database restored.");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const currentTheme = getTheme();
  document.body.classList.toggle("dark", currentTheme === "dark");
  $("themeToggle")?.classList.toggle("on", currentTheme === "dark");

  const today = new Date();
  const dLabel = $("todayDateLabel");
  if (dLabel) dLabel.textContent = today.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  $("sidebarLiveDate").textContent = today.toLocaleDateString("en-IN", { month: "short", day: "numeric" });

  setupAuth();
  setupNavigation();
  setupStaticFormListeners();
  setupDelegatedActions();
  renderAll();
});