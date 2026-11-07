/**
 * Tech Dada - Main App Controller & State Manager (English Edition)
 * Connects User & Admin Roles, Routing, Modals, and Sub-Modules
 */

const AppState = {
  isAdminMode: false,
  currentView: "home",

  async init() {
    // 0. Auto-upgrade cache check (v3.2)
    const currentVersion = "3.2";
    if (localStorage.getItem("techdada_app_v") !== currentVersion) {
      TechDadaData.AppStorage.reset();
      localStorage.removeItem("techdada_ai_history");
      localStorage.setItem("techdada_app_v", currentVersion);
    } else {
      TechDadaData.AppStorage.init();
    }

    // Initialize IndexedDB for real PDF storage
    try {
      if (window.AppDB) {
        await AppDB.init();
      }
    } catch (e) {
      console.warn("AppDB init warning:", e);
    }

    NotesModule.init();
    ProblemsModule.init();
    NotificationsModule.init();
    AIChatModule.init();

    this.setupNavigation();
    this.updateRoleUI();
    this.renderAdminOverview();

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // 1. Role Switching (Student vs Admin)
  openRoleSwitcherModal() {
    const modal = document.getElementById("roleSwitcherModal");
    const pinInput = document.getElementById("adminPinInput");
    const pinError = document.getElementById("adminPinError");

    if (pinInput) pinInput.value = "";
    if (pinError) pinError.classList.add("hidden");

    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  },

  closeRoleSwitcherModal() {
    const modal = document.getElementById("roleSwitcherModal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  },

  switchToUserMode() {
    this.isAdminMode = false;
    this.closeRoleSwitcherModal();
    this.updateRoleUI();
    this.switchView("home");
    NotificationsModule.updateBadgeCounts();
    NotificationsModule.showToast("Student Mode activated! 🎓", "info");

    if (NotesModule.currentStandard && NotesModule.currentMedium) {
      NotesModule.renderNotesHeader();
      NotesModule.renderNotesList();
    }
  },

  switchToAdminMode() {
    const pinInput = document.getElementById("adminPinInput");
    const pinError = document.getElementById("adminPinError");
    const pin = pinInput ? pinInput.value.trim() : "";

    // Default PIN: dada123 or blank
    if (pin === "dada123" || pin === "" || pin === "admin") {
      this.isAdminMode = true;
      this.closeRoleSwitcherModal();
      this.updateRoleUI();
      NotificationsModule.updateBadgeCounts();
      NotificationsModule.showToast("Welcome Tech Dada! Admin Mode enabled. 👑", "success");

      if (NotesModule.currentStandard && NotesModule.currentMedium) {
        NotesModule.renderNotesHeader();
        NotesModule.renderNotesList();
      }
      this.renderAdminOverview();
    } else {
      if (pinError) {
        pinError.classList.remove("hidden");
        pinError.innerText = "Incorrect PIN! (Default PIN is dada123)";
      }
    }
  },

  updateRoleUI() {
    const roleBadge = document.getElementById("currentRoleBadge");
    const roleText = document.getElementById("currentRoleText");
    const adminTabBtn = document.getElementById("navAdminTabBtn");
    const mobileAdminTabBtn = document.getElementById("mobileNavAdminTabBtn");

    if (this.isAdminMode) {
      if (roleBadge) {
        roleBadge.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm ring-2 ring-amber-300/50";
      }
      if (roleText) roleText.innerText = "Admin (Tech Dada)";
      if (adminTabBtn) adminTabBtn.classList.remove("hidden");
      if (mobileAdminTabBtn) mobileAdminTabBtn.classList.remove("hidden");
    } else {
      if (roleBadge) {
        roleBadge.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200";
      }
      if (roleText) roleText.innerText = "Student Mode";
      if (adminTabBtn) adminTabBtn.classList.add("hidden");
      if (mobileAdminTabBtn) mobileAdminTabBtn.classList.add("hidden");
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // 2. Navigation View Switcher
  switchView(viewName) {
    this.currentView = viewName;

    const views = {
      "home": document.getElementById("mainHomeView"),
      "admin-panel": document.getElementById("adminDashboardView")
    };

    Object.values(views).forEach(v => {
      if (v) v.classList.add("hidden");
    });

    if (views[viewName]) {
      views[viewName].classList.remove("hidden");
    } else if (views["home"]) {
      views["home"].classList.remove("hidden");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    this.updateActiveNavLinks(viewName);

    if (viewName === "admin-panel") {
      this.renderAdminOverview();
      ProblemsModule.renderAdminProblemsList();
    }

    if (window.lucide) lucide.createIcons();
  },

  updateActiveNavLinks(viewName) {
    const navLinks = document.querySelectorAll("[data-nav-view]");
    navLinks.forEach(link => {
      const target = link.getAttribute("data-nav-view");
      if (target === viewName) {
        link.classList.add("text-indigo-600", "font-bold");
        link.classList.remove("text-slate-600");
      } else {
        link.classList.remove("text-indigo-600", "font-bold");
        link.classList.add("text-slate-600");
      }
    });
  },

  // 3. Admin Overview Dashboard Stats
  renderAdminOverview() {
    const allNotes = TechDadaData.AppStorage.get("notes", TechDadaData.INITIAL_NOTES);
    const allProblems = TechDadaData.AppStorage.get("problems", TechDadaData.INITIAL_PROBLEMS);

    const totalNotesEl = document.getElementById("adminStatTotalNotes");
    const totalDownloadsEl = document.getElementById("adminStatTotalDownloads");
    const pendingProblemsEl = document.getElementById("adminStatPendingProblems");

    const totalDownloads = allNotes.reduce((acc, n) => acc + (n.downloads || 0), 0);
    const pendingCount = allProblems.filter(p => p.status === "pending").length;

    if (totalNotesEl) totalNotesEl.innerText = allNotes.length;
    if (totalDownloadsEl) totalDownloadsEl.innerText = totalDownloads.toLocaleString();
    if (pendingProblemsEl) pendingProblemsEl.innerText = pendingCount;
  },

  switchToAdminTab(tabName) {
    this.switchView("admin-panel");
    const problemSection = document.getElementById("adminProblemsSectionWrapper");
    if (problemSection && tabName === "problems") {
      problemSection.scrollIntoView({ behavior: "smooth" });
    }
  },

  // 4. Reset All Demo Data
  resetAllData() {
    if (confirm("Reset all data to default? This will restore original sample notes and problems.")) {
      TechDadaData.AppStorage.reset();
      NotesModule.renderStandards();
      ProblemsModule.renderAdminProblemsList();
      NotificationsModule.updateBadgeCounts();
      NotificationsModule.showToast("All data reset to initial default state! 🔄", "info");
      this.switchView("home");
    }
  },

  setupNavigation() {
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileNav = document.getElementById("mobileNavDrawer");
    const mobileOverlay = document.getElementById("mobileNavOverlay");

    if (mobileMenuBtn && mobileNav) {
      mobileMenuBtn.addEventListener("click", () => {
        mobileNav.classList.remove("-translate-x-full");
        if (mobileOverlay) mobileOverlay.classList.remove("hidden");
      });
    }

    if (mobileOverlay && mobileNav) {
      mobileOverlay.addEventListener("click", () => {
        mobileNav.classList.add("-translate-x-full");
        mobileOverlay.classList.add("hidden");
      });
    }
  }
};

window.AppState = AppState;

document.addEventListener("DOMContentLoaded", () => {
  AppState.init();
});
