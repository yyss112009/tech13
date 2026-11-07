/**
 * Tech Dada - Problem Submission & Dada Support Module (English Edition)
 * Handles:
 * - "Share the problem to the Dada" form submission
 * - Problem image upload with live preview
 * - Admin problem view, status update, and reply
 * - Bi-directional real-time notification dispatch
 */

const ProblemsModule = {
  selectedImageBase64: null,

  init() {
    this.setupEventListeners();
    this.renderAdminProblemsList();
  },

  // 1. Open "Share the problem to the Dada" Modal
  openProblemModal() {
    const modal = document.getElementById("shareProblemModal");
    const form = document.getElementById("shareProblemForm");
    if (form) form.reset();
    this.removeImagePreview();

    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  },

  closeProblemModal() {
    const modal = document.getElementById("shareProblemModal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  },

  // 2. Handle Problem Image Selection & Preview
  handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (PNG, JPG, or JPEG).");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      alert("Image size must be less than 4 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedImageBase64 = e.target.result;
      this.showImagePreview(e.target.result, file.name);
    };
    reader.readAsDataURL(file);
  },

  showImagePreview(src, filename) {
    const previewContainer = document.getElementById("problemImagePreviewContainer");
    const previewImg = document.getElementById("problemImagePreview");
    const nameLabel = document.getElementById("problemImageName");

    if (previewImg) previewImg.src = src;
    if (nameLabel) nameLabel.innerText = filename || "Selected problem image";
    if (previewContainer) previewContainer.classList.remove("hidden");
  },

  removeImagePreview() {
    this.selectedImageBase64 = null;
    const fileInput = document.getElementById("problemImageInput");
    if (fileInput) fileInput.value = "";
    
    const previewContainer = document.getElementById("problemImagePreviewContainer");
    if (previewContainer) previewContainer.classList.add("hidden");
  },

  // 3. User submits problem to Dada
  submitProblem(e) {
    e.preventDefault();

    const name = document.getElementById("problemStudentName").value.trim();
    const standard = document.getElementById("problemStandardSelect").value;
    const message = document.getElementById("problemMessageText").value.trim();

    if (!name || !message) {
      alert("Please enter your name and describe your problem!");
      return;
    }

    const newProblem = {
      id: `prob-${Date.now()}`,
      studentName: name,
      standard: standard,
      message: message,
      image: this.selectedImageBase64,
      timestamp: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
      status: "pending",
      reply: null,
      repliedAt: null,
      adminName: null
    };

    let problems = TechDadaData.AppStorage.get("problems", TechDadaData.INITIAL_PROBLEMS);
    problems.unshift(newProblem);
    TechDadaData.AppStorage.set("problems", problems);

    // Dispatch Notification to Admin!
    NotificationsModule.addNotification({
      targetRole: "admin",
      title: "New Student Question Received! 📩",
      message: `${name} (${standard}) sent a problem to Dada: "${message.substring(0, 45)}..."`,
      relatedProblemId: newProblem.id
    });

    this.closeProblemModal();

    NotificationsModule.showToast("Your problem has been sent to Tech Dada! You will get a notification when answered. 🚀", "success");

    this.renderAdminProblemsList();
  },

  // 4. Admin View: Render List of submitted student problems
  renderAdminProblemsList() {
    const container = document.getElementById("adminProblemsList");
    const badgeCount = document.getElementById("adminPendingProblemsBadge");
    if (!container) return;

    const problems = TechDadaData.AppStorage.get("problems", TechDadaData.INITIAL_PROBLEMS);
    const pendingCount = problems.filter(p => p.status === "pending").length;

    if (badgeCount) {
      badgeCount.innerText = `${pendingCount} Pending`;
      if (pendingCount > 0) {
        badgeCount.classList.remove("hidden");
      } else {
        badgeCount.classList.add("hidden");
      }
    }

    if (problems.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center text-slate-400">
          <i data-lucide="message-square-dashed" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
          <p class="text-sm">No student questions submitted yet.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = problems.map(prob => {
      const isReplied = prob.status === "replied";

      return `
        <div class="bg-white rounded-2xl p-5 border ${isReplied ? 'border-slate-200' : 'border-indigo-300 shadow-md shadow-indigo-100'} transition-all hover:border-indigo-400">
          <!-- Problem Header -->
          <div class="flex flex-wrap items-start justify-between gap-2 mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-tr ${isReplied ? 'from-slate-400 to-slate-600' : 'from-indigo-600 to-violet-600'} text-white font-bold text-sm flex items-center justify-center">
                ${prob.studentName.charAt(0)}
              </div>
              <div>
                <h4 class="font-bold text-slate-900 text-sm sm:text-base">${prob.studentName}</h4>
                <div class="flex items-center gap-2 text-xs text-slate-500">
                  <span class="font-semibold text-indigo-600">${prob.standard}</span>
                  <span>•</span>
                  <span>${prob.timestamp}</span>
                </div>
              </div>
            </div>

            <span class="px-3 py-1 rounded-full text-xs font-bold ${
              isReplied 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-amber-100 text-amber-800 animate-pulse'
            }">
              ${isReplied ? '✓ Answered' : '⌛ Pending Response'}
            </span>
          </div>

          <!-- Student Problem Message -->
          <div class="bg-slate-50 rounded-xl p-4 text-xs sm:text-sm text-slate-800 leading-relaxed mb-3 border border-slate-100 whitespace-pre-line">
            ${prob.message}
          </div>

          <!-- Problem Image if attached -->
          ${prob.image ? `
            <div class="mb-4">
              <p class="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                <i data-lucide="image" class="w-3.5 h-3.5 text-indigo-500"></i> Attached Problem Image:
              </p>
              <div class="relative inline-block group">
                <img src="${prob.image}" alt="Problem Image" 
                  onclick="ProblemsModule.viewFullImage('${prob.image}')"
                  class="max-h-40 max-w-xs rounded-xl border border-slate-200 shadow-sm cursor-zoom-in hover:opacity-90 transition-opacity">
                <span class="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur">Click to Zoom</span>
              </div>
            </div>
          ` : ''}

          <!-- Admin Reply if already replied -->
          ${isReplied ? `
            <div class="bg-emerald-50/80 rounded-xl p-4 border border-emerald-200 text-xs sm:text-sm text-emerald-950 mb-3">
              <div class="flex items-center justify-between font-bold text-emerald-900 mb-1">
                <span class="flex items-center gap-1.5">
                  <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i>
                  ${prob.adminName || 'Tech Dada'}'s Answer:
                </span>
                <span class="text-[11px] font-normal text-emerald-700">${prob.repliedAt || ''}</span>
              </div>
              <p class="leading-relaxed whitespace-pre-line">${prob.reply}</p>
            </div>
          ` : ''}

          <!-- Action Button -->
          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button onclick="ProblemsModule.openReplyModal('${prob.id}')"
              class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold ${
                isReplied 
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200'
              } flex items-center gap-1.5 transition-all">
              <i data-lucide="${isReplied ? 'edit-3' : 'reply'}" class="w-4 h-4"></i>
              <span>${isReplied ? 'Edit Reply' : 'Reply to Student'}</span>
            </button>
          </div>
        </div>
      `;
    }).join("");

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // 5. Open Admin Reply Modal
  openReplyModal(problemId) {
    const problems = TechDadaData.AppStorage.get("problems", TechDadaData.INITIAL_PROBLEMS);
    const prob = problems.find(p => p.id === problemId);
    if (!prob) return;

    const modal = document.getElementById("adminReplyModal");
    const targetName = document.getElementById("replyModalStudentName");
    const targetStd = document.getElementById("replyModalStudentStd");
    const targetMsg = document.getElementById("replyModalStudentMsg");
    const replyTextarea = document.getElementById("replyModalText");
    const targetIdInput = document.getElementById("replyModalProblemId");

    if (targetName) targetName.innerText = prob.studentName;
    if (targetStd) targetStd.innerText = prob.standard;
    if (targetMsg) targetMsg.innerText = prob.message;
    if (targetIdInput) targetIdInput.value = prob.id;
    if (replyTextarea) replyTextarea.value = prob.reply || "";

    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  },

  closeReplyModal() {
    const modal = document.getElementById("adminReplyModal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  },

  // 6. Admin submits Reply
  submitReply(e) {
    e.preventDefault();
    const problemId = document.getElementById("replyModalProblemId").value;
    const replyText = document.getElementById("replyModalText").value.trim();

    if (!replyText) {
      alert("Please enter a reply for the student.");
      return;
    }

    let problems = TechDadaData.AppStorage.get("problems", TechDadaData.INITIAL_PROBLEMS);
    const probIndex = problems.findIndex(p => p.id === problemId);

    if (probIndex !== -1) {
      problems[probIndex].status = "replied";
      problems[probIndex].reply = replyText;
      problems[probIndex].repliedAt = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
      problems[probIndex].adminName = "Tech Dada";

      TechDadaData.AppStorage.set("problems", problems);

      // Trigger notification for Student!
      NotificationsModule.addNotification({
        targetRole: "user",
        title: "Dada replied to your problem! 🎉",
        message: `${problems[probIndex].studentName}, Tech Dada replied: "${replyText.substring(0, 50)}..."`,
        relatedProblemId: problemId
      });

      this.closeReplyModal();
      this.renderAdminProblemsList();
      NotificationsModule.showToast("Reply sent to student successfully! 📩", "success");
    }
  },

  viewFullImage(src) {
    const viewer = document.getElementById("imageLightboxModal");
    const img = document.getElementById("lightboxImage");
    if (img) img.src = src;
    if (viewer) {
      viewer.classList.remove("hidden");
      viewer.classList.add("flex");
    }
  },

  closeLightbox() {
    const viewer = document.getElementById("imageLightboxModal");
    if (viewer) {
      viewer.classList.add("hidden");
      viewer.classList.remove("flex");
    }
  },

  setupEventListeners() {
    const form = document.getElementById("shareProblemForm");
    if (form) {
      form.addEventListener("submit", (e) => this.submitProblem(e));
    }

    const imgInput = document.getElementById("problemImageInput");
    if (imgInput) {
      imgInput.addEventListener("change", (e) => this.handleImageSelect(e));
    }

    const replyForm = document.getElementById("adminReplyForm");
    if (replyForm) {
      replyForm.addEventListener("submit", (e) => this.submitReply(e));
    }
  }
};

window.ProblemsModule = ProblemsModule;
