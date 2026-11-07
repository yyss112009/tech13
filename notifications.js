/**
 * Tech Dada - Notifications & Audio Alerts Module (English Edition)
 * Handles:
 * - Dynamic notifications for User and Admin
 * - Unread counters and badge updates
 * - Notification tray & problem response view
 * - Toast alerts & Web Audio API synthesizer chime
 */

const NotificationsModule = {
  init() {
    this.updateBadgeCounts();
    this.setupEventListeners();
  },

  // 1. Play pleasant synthesizer chime sound
  playNotificationSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  },

  // 2. Add notification
  addNotification({ targetRole, title, message, relatedProblemId = null }) {
    let notifications = TechDadaData.AppStorage.get("notifications", TechDadaData.INITIAL_NOTIFICATIONS);
    
    const newNotif = {
      id: `notif-${Date.now()}`,
      targetRole: targetRole, // "user" or "admin"
      title: title,
      message: message,
      relatedProblemId: relatedProblemId,
      timestamp: "Just now",
      read: false
    };

    notifications.unshift(newNotif);
    TechDadaData.AppStorage.set("notifications", notifications);

    this.playNotificationSound();
    this.updateBadgeCounts();

    const currentRole = AppState.isAdminMode ? "admin" : "user";
    if (currentRole === targetRole) {
      this.showToast(`${title}: ${message}`, "info");
    }
  },

  // 3. Update Badge Counts
  updateBadgeCounts() {
    const notifications = TechDadaData.AppStorage.get("notifications", TechDadaData.INITIAL_NOTIFICATIONS);
    const currentRole = AppState.isAdminMode ? "admin" : "user";

    const unread = notifications.filter(n => n.targetRole === currentRole && !n.read);

    const badges = document.querySelectorAll(".notification-badge-count");
    badges.forEach(badge => {
      badge.innerText = unread.length;
      if (unread.length > 0) {
        badge.classList.remove("hidden");
        badge.classList.add("flex");
      } else {
        badge.classList.add("hidden");
        badge.classList.remove("flex");
      }
    });

    const mobBadge = document.getElementById("mobileNotifBadge");
    if (mobBadge) {
      mobBadge.innerText = unread.length;
      if (unread.length > 0) {
        mobBadge.classList.remove("hidden");
      } else {
        mobBadge.classList.add("hidden");
      }
    }
  },

  // 4. Toggle Notification Drawer
  toggleDrawer() {
    const drawer = document.getElementById("notificationsDrawer");
    if (!drawer) return;

    if (drawer.classList.contains("translate-x-full")) {
      this.openDrawer();
    } else {
      this.closeDrawer();
    }
  },

  openDrawer() {
    const drawer = document.getElementById("notificationsDrawer");
    const overlay = document.getElementById("drawerOverlay");
    
    this.renderNotificationsList();

    if (drawer) drawer.classList.remove("translate-x-full");
    if (overlay) overlay.classList.remove("hidden");
  },

  closeDrawer() {
    const drawer = document.getElementById("notificationsDrawer");
    const overlay = document.getElementById("drawerOverlay");

    if (drawer) drawer.classList.add("translate-x-full");
    if (overlay) overlay.classList.add("hidden");
  },

  // 5. Render list in drawer
  renderNotificationsList() {
    const container = document.getElementById("notificationsListContainer");
    if (!container) return;

    const notifications = TechDadaData.AppStorage.get("notifications", TechDadaData.INITIAL_NOTIFICATIONS);
    const currentRole = AppState.isAdminMode ? "admin" : "user";

    const filtered = notifications.filter(n => n.targetRole === currentRole);

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="py-16 text-center text-slate-400">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            <i data-lucide="bell-off" class="w-8 h-8"></i>
          </div>
          <p class="font-bold text-slate-700">No Notifications</p>
          <p class="text-xs text-slate-400 mt-1">You are all caught up!</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = filtered.map(item => {
      return `
        <div class="p-4 rounded-2xl border transition-all cursor-pointer ${
          item.read 
            ? 'bg-white border-slate-200' 
            : 'bg-indigo-50/70 border-indigo-200 shadow-sm'
        }" onclick="NotificationsModule.handleClickNotification('${item.id}')">
          <div class="flex items-start justify-between gap-2 mb-1">
            <h5 class="text-sm font-bold text-slate-900 ${item.read ? '' : 'text-indigo-900'}">
              ${item.title}
            </h5>
            ${!item.read ? `
              <span class="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 mt-1 animate-ping"></span>
            ` : ''}
          </div>
          <p class="text-xs text-slate-600 leading-relaxed mb-2">
            ${item.message}
          </p>
          <div class="flex items-center justify-between text-[11px] text-slate-400">
            <span>${item.timestamp}</span>
            <span class="text-indigo-600 font-semibold hover:underline">View Details →</span>
          </div>
        </div>
      `;
    }).join("");

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // 6. Handle click on notification
  handleClickNotification(notifId) {
    let notifications = TechDadaData.AppStorage.get("notifications", TechDadaData.INITIAL_NOTIFICATIONS);
    const notif = notifications.find(n => n.id === notifId);
    if (!notif) return;

    notif.read = true;
    TechDadaData.AppStorage.set("notifications", notifications);
    this.updateBadgeCounts();
    this.renderNotificationsList();

    if (notif.relatedProblemId) {
      this.closeDrawer();
      if (AppState.isAdminMode) {
        AppState.switchToAdminTab("problems");
        ProblemsModule.openReplyModal(notif.relatedProblemId);
      } else {
        this.showProblemDetailModal(notif.relatedProblemId);
      }
    }
  },

  showProblemDetailModal(problemId) {
    const problems = TechDadaData.AppStorage.get("problems", TechDadaData.INITIAL_PROBLEMS);
    const prob = problems.find(p => p.id === problemId);
    if (!prob) return;

    const modal = document.getElementById("userProblemViewModal");
    const container = document.getElementById("userProblemViewContent");

    if (container) {
      container.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold px-3 py-1 rounded-full ${
              prob.status === 'replied' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }">
              ${prob.status === 'replied' ? '✓ Answered by Dada' : '⌛ Under Review by Dada'}
            </span>
            <span class="text-xs text-slate-400">${prob.timestamp}</span>
          </div>

          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p class="text-xs font-bold text-slate-500 mb-1">Your Question:</p>
            <p class="text-sm text-slate-800 whitespace-pre-line">${prob.message}</p>
            ${prob.image ? `
              <div class="mt-3">
                <img src="${prob.image}" alt="Attached problem" class="max-h-48 rounded-lg border">
              </div>
            ` : ''}
          </div>

          ${prob.reply ? `
            <div class="bg-indigo-50/80 p-4 rounded-xl border border-indigo-200">
              <div class="flex items-center gap-2 text-indigo-900 font-bold text-sm mb-1.5">
                <i data-lucide="check-check" class="w-4 h-4 text-indigo-600"></i>
                <span>Tech Dada's Solution:</span>
              </div>
              <p class="text-sm text-indigo-950 leading-relaxed whitespace-pre-line">${prob.reply}</p>
              <div class="mt-2 text-right text-[11px] text-indigo-500 font-medium">
                Replied at: ${prob.repliedAt || ''}
              </div>
            </div>
          ` : `
            <p class="text-xs text-slate-500 italic text-center py-2">
              Dada is currently reviewing your question. You will receive a notification as soon as it is answered!
            </p>
          `}
        </div>
      `;
    }

    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  closeUserProblemViewModal() {
    const modal = document.getElementById("userProblemViewModal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  },

  markAllAsRead() {
    let notifications = TechDadaData.AppStorage.get("notifications", TechDadaData.INITIAL_NOTIFICATIONS);
    const currentRole = AppState.isAdminMode ? "admin" : "user";

    notifications = notifications.map(n => {
      if (n.targetRole === currentRole) n.read = true;
      return n;
    });

    TechDadaData.AppStorage.set("notifications", notifications);
    this.updateBadgeCounts();
    this.renderNotificationsList();
    this.showToast("All notifications marked as read. ✅", "info");
  },

  showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    const icons = {
      success: "check-circle",
      error: "alert-circle",
      info: "bell"
    };

    const colors = {
      success: "bg-emerald-600 text-white shadow-emerald-200",
      error: "bg-rose-600 text-white shadow-rose-200",
      info: "bg-slate-900 text-white shadow-slate-300"
    };

    toast.className = `flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-xs sm:text-sm font-semibold transform transition-all duration-300 translate-y-4 opacity-0 ${colors[type] || colors.info}`;
    toast.innerHTML = `
      <i data-lucide="${icons[type] || 'info'}" class="w-5 h-5 shrink-0"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-4", "opacity-0");
    });

    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-2");
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  },

  setupEventListeners() {
    const drawerOverlay = document.getElementById("drawerOverlay");
    if (drawerOverlay) {
      drawerOverlay.addEventListener("click", () => this.closeDrawer());
    }
  }
};

window.NotificationsModule = NotificationsModule;
