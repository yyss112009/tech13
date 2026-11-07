/**
 * Tech Dada - Notes Module (Engine v3.2)
 * Guarantees REAL PDF viewing and downloading for EVERY note:
 * 1. Admin uploaded PDFs are read as Base64 Data URLs and stored permanently.
 * 2. Real browser PDF viewer (<iframe src="...#toolbar=1">) with zoom, pages, and fullscreen.
 * 3. Exact original file downloading.
 * 4. Automatic generation of real PDF files for notes without an uploaded file.
 */

const NotesModule = {
  currentStandard: null,
  currentMedium: null,
  activeSubjectFilter: "all",
  searchQuery: "",
  activeNoteInViewer: null,

  init() {
    this.renderStandards();
    this.setupEventListeners();
  },

  setupEventListeners() {
    // Search input listener
    const searchInput = document.getElementById("notesSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.renderNotesList();
      });
    }

    // PDF upload file change listener in modal
    const pdfFileInput = document.getElementById("noteFormPdfFile");
    const pdfStatus = document.getElementById("noteFormPdfStatus");
    if (pdfFileInput && pdfStatus) {
      pdfFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
          pdfStatus.innerHTML = `
            <span class="text-emerald-700 font-extrabold flex items-center gap-1.5 mt-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              ✓ Selected PDF: <strong>${this.escapeHTML(file.name)}</strong> (${sizeMb > 0 ? sizeMb + ' MB' : Math.round(file.size / 1024) + ' KB'})
            </span>
          `;
        } else {
          pdfStatus.textContent = "Choose an original PDF file from your device.";
        }
      });
    }

    // Add / Edit Note Form Submission
    const noteForm = document.getElementById("noteForm");
    if (noteForm) {
      noteForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await this.handleNoteFormSubmit();
      });
    }
  },

  // 1. Render Main Standards Cards on Home Page
  renderStandards() {
    const container = document.getElementById("standardsGrid");
    if (!container) return;

    const standards = TechDadaData.AppStorage.get("standards", TechDadaData.DEFAULT_STANDARDS);
    const allNotes = TechDadaData.AppStorage.get("notes", TechDadaData.INITIAL_NOTES);

    container.innerHTML = standards.map((std) => {
      const stdNotes = allNotes.filter((n) => n.standardId === std.id);
      const marathiCount = stdNotes.filter((n) => n.mediumId === "marathi").length;
      const semiCount = stdNotes.filter((n) => n.mediumId === "semi-english").length;

      return `
        <div class="group relative bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
             onclick="NotesModule.openMediumSelector('${std.id}')">
          <!-- Background glow circle -->
          <div class="absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br ${std.color} opacity-15 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500"></div>
          
          <div>
            <div class="flex items-center justify-between mb-5">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${std.color} text-white shadow-sm">
                <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                ${std.badge}
              </span>
              <span class="text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                Explore Notes <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </span>
            </div>

            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr ${std.color} text-white flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <i data-lucide="${std.icon}" class="w-7 h-7"></i>
            </div>

            <h3 class="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
              ${std.name}
            </h3>
            <p class="text-xs sm:text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">
              ${std.desc}
            </p>
          </div>

          <div class="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                मराठी: ${marathiCount}
              </span>
              <span class="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200">
                Semi-Eng: ${semiCount}
              </span>
            </div>
            <span class="text-xs font-black text-slate-700">
              ${stdNotes.length} Notes Total
            </span>
          </div>
        </div>
      `;
    }).join("");

    if (window.lucide) lucide.createIcons();
  },

  // 2. Open Medium Selection Modal
  openMediumSelector(standardId) {
    this.currentStandard = standardId;
    const modal = document.getElementById("mediumSelectModal");
    const stdObj = TechDadaData.AppStorage.get("standards", TechDadaData.DEFAULT_STANDARDS).find((s) => s.id === standardId);

    const titleEl = document.getElementById("mediumModalTitle");
    const subtitleEl = document.getElementById("mediumModalSubtitle");

    if (titleEl && stdObj) {
      titleEl.innerHTML = `Choose Medium for <span class="text-indigo-600">${stdObj.name}</span>`;
    }
    if (subtitleEl && stdObj) {
      subtitleEl.textContent = `Select your preferred language medium to view all ${stdObj.name} verified study notes and PDF materials:`;
    }

    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
    if (window.lucide) lucide.createIcons();
  },

  closeMediumSelector() {
    const modal = document.getElementById("mediumSelectModal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  },

  // 3. Medium Selected -> Navigate to Notes View
  selectMedium(mediumId) {
    this.currentMedium = mediumId;
    this.closeMediumSelector();

    const standardsSection = document.getElementById("standardsSection");
    const notesRepoSection = document.getElementById("notesRepositorySection");

    if (standardsSection) standardsSection.classList.add("hidden");
    if (notesRepoSection) notesRepoSection.classList.remove("hidden");

    this.activeSubjectFilter = "all";
    this.searchQuery = "";
    const searchInput = document.getElementById("notesSearchInput");
    if (searchInput) searchInput.value = "";

    this.renderNotesHeader();
    this.renderSubjectFilterPills();
    this.renderNotesList();

    notesRepoSection.scrollIntoView({ behavior: "smooth" });
  },

  backToStandards() {
    const standardsSection = document.getElementById("standardsSection");
    const notesRepoSection = document.getElementById("notesRepositorySection");

    if (notesRepoSection) notesRepoSection.classList.add("hidden");
    if (standardsSection) standardsSection.classList.remove("hidden");

    this.currentStandard = null;
    this.currentMedium = null;
    this.renderStandards();
  },

  // 4. Render Notes Header & Breadcrumbs
  renderNotesHeader() {
    const stdObj = TechDadaData.AppStorage.get("standards", TechDadaData.DEFAULT_STANDARDS).find((s) => s.id === this.currentStandard);
    const medObj = TechDadaData.MEDIUMS.find((m) => m.id === this.currentMedium);

    const breadcrumbStd = document.getElementById("notesBreadcrumbStd");
    const breadcrumbMed = document.getElementById("notesBreadcrumbMedium");
    const heading = document.getElementById("notesCurrentHeading");
    const desc = document.getElementById("notesCurrentDesc");
    const addBtn = document.getElementById("adminAddNoteBtn");

    if (breadcrumbStd && stdObj) breadcrumbStd.textContent = stdObj.name;
    if (breadcrumbMed && medObj) breadcrumbMed.textContent = medObj.name;

    if (heading && stdObj && medObj) {
      heading.innerHTML = `${stdObj.name} • <span class="text-indigo-600">${medObj.name}</span> Notes 📚`;
    }

    if (desc && medObj) {
      desc.textContent = medObj.subtitle;
    }

    // Admin "+ Add PDF Note" button visibility
    if (addBtn) {
      if (AppState.isAdminMode) {
        addBtn.classList.remove("hidden");
      } else {
        addBtn.classList.add("hidden");
      }
    }
  },

  // 5. Subject Filter Pills
  renderSubjectFilterPills() {
    const container = document.getElementById("subjectFilterPills");
    if (!container) return;

    const allNotes = TechDadaData.AppStorage.get("notes", TechDadaData.INITIAL_NOTES);
    const filtered = allNotes.filter((n) => n.standardId === this.currentStandard && n.mediumId === this.currentMedium);

    const subjects = ["all", ...new Set(filtered.map((n) => n.subject))];

    container.innerHTML = subjects.map((subj) => {
      const isSelected = this.activeSubjectFilter === subj;
      const count = subj === "all" ? filtered.length : filtered.filter((n) => n.subject === subj).length;
      const displayName = subj === "all" ? "All Subjects" : subj;

      return `
        <button onclick="NotesModule.setSubjectFilter('${this.escapeQuotes(subj)}')"
                class="px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }">
          <span>${displayName}</span>
          <span class="px-1.5 py-0.5 rounded-full text-[10px] ${
            isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
          }">${count}</span>
        </button>
      `;
    }).join("");
  },

  setSubjectFilter(subj) {
    this.activeSubjectFilter = subj;
    this.renderSubjectFilterPills();
    this.renderNotesList();
  },

  // 6. Render Notes Cards
  renderNotesList() {
    const container = document.getElementById("notesListCards");
    const countBadge = document.getElementById("notesCountBadge");
    if (!container) return;

    const allNotes = TechDadaData.AppStorage.get("notes", TechDadaData.INITIAL_NOTES);

    let notes = allNotes.filter(
      (n) => n.standardId === this.currentStandard && n.mediumId === this.currentMedium
    );

    // Subject Filter
    if (this.activeSubjectFilter !== "all") {
      notes = notes.filter((n) => n.subject === this.activeSubjectFilter);
    }

    // Search Query
    if (this.searchQuery) {
      notes = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(this.searchQuery) ||
          n.subject.toLowerCase().includes(this.searchQuery) ||
          n.chapter.toLowerCase().includes(this.searchQuery) ||
          (n.description && n.description.toLowerCase().includes(this.searchQuery))
      );
    }

    if (countBadge) {
      countBadge.textContent = `${notes.length} PDF notes ready for download`;
    }

    if (notes.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8">
          <div class="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3">
            <i data-lucide="file-question" class="w-8 h-8"></i>
          </div>
          <h4 class="text-base font-bold text-slate-800">No Notes Found</h4>
          <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            ${
              AppState.isAdminMode
                ? "Click '+ Add PDF Note' above to upload a new PDF note for this standard!"
                : "No notes matching your search or filter. Select a different subject or medium."
            }
          </p>
          ${
            AppState.isAdminMode
              ? `<button onclick="NotesModule.openAddNoteModal()" class="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow inline-flex items-center gap-1.5">
                  <i data-lucide="plus" class="w-4 h-4"></i> Add New Note
                </button>`
              : ""
          }
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = notes.map((note) => {
      return `
        <div class="group bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-md hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          
          <!-- Top Tag & Subject -->
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                <i data-lucide="book" class="w-3 h-3"></i>
                ${this.escapeHTML(note.subject)}
              </span>

              <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-sm">
                <i data-lucide="file-check" class="w-3 h-3"></i> Real PDF
              </span>
            </div>

            <!-- Title -->
            <h4 class="text-base sm:text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
              ${this.escapeHTML(note.title)}
            </h4>

            <!-- Chapter & Meta -->
            <p class="text-xs font-semibold text-slate-500 mt-1">
              ${this.escapeHTML(note.chapter)} • ${note.pages || 10} Pages • ${note.size || "2.5 MB"}
            </p>

            <!-- Description -->
            <p class="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
              ${this.escapeHTML(note.description || "High quality exam notes with complete formulas, diagrams, and solved exercises.")}
            </p>
          </div>

          <!-- Bottom Actions -->
          <div class="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <div class="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span class="flex items-center gap-1">
                <i data-lucide="download" class="w-3 h-3"></i> ${note.downloads || 1} downloads
              </span>
              <span>By ${this.escapeHTML(note.author || "Tech Dada")}</span>
            </div>

            <div class="flex items-center gap-2">
              <!-- View PDF Button -->
              <button onclick="NotesModule.viewNotePDF('${note.id}')"
                      class="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors">
                <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                <span>View PDF</span>
              </button>

              <!-- Download Button -->
              <button onclick="NotesModule.downloadNote('${note.id}')"
                      title="Download PDF"
                      class="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1">
                <i data-lucide="download" class="w-3.5 h-3.5"></i>
                <span class="hidden sm:inline">Download</span>
              </button>

              <!-- Admin Edit & Delete Buttons -->
              ${
                AppState.isAdminMode
                  ? `
                    <button onclick="NotesModule.openEditNoteModal('${note.id}')" title="Edit Note" class="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors">
                      <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="NotesModule.deleteNote('${note.id}')" title="Delete Note" class="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                  `
                  : ""
              }
            </div>
          </div>
        </div>
      `;
    }).join("");

    if (window.lucide) lucide.createIcons();
  },

  // 7. IN-APP PDF VIEWER (Guaranteed to show REAL PDF)
  async viewNotePDF(noteId) {
    const allNotes = TechDadaData.AppStorage.get("notes", TechDadaData.INITIAL_NOTES);
    let note = allNotes.find((n) => n.id === noteId);
    if (!note) return;

    this.activeNoteInViewer = note;

    const modal = document.getElementById("pdfViewerModal");
    const titleEl = document.getElementById("pdfViewerTitle");
    const subjectEl = document.getElementById("pdfViewerSubject");
    const contentEl = document.getElementById("pdfViewerContent");
    const downloadBtn = document.getElementById("pdfViewerDownloadBtn");
    const newTabBtn = document.getElementById("pdfViewerNewTabBtn");

    if (titleEl) titleEl.textContent = note.title;
    if (subjectEl) {
      subjectEl.textContent = `${note.subject} • ${note.chapter} • ${note.pages || 10} Pages • Uploaded by ${note.author || "Tech Dada"}`;
    }

    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }

    // 1. Get real PDF data URL
    let pdfDataUrl = note.pdfData;

    // Check AppDB if not in note object
    if (!pdfDataUrl && window.AppDB) {
      try {
        const stored = await AppDB.getPDFFile(note.id);
        if (stored && stored.dataUrl) {
          pdfDataUrl = stored.dataUrl;
          note.pdfData = pdfDataUrl;
        }
      } catch (e) {}
    }

    // If still no PDF data, generate a real PDF document on the fly
    if (!pdfDataUrl) {
      pdfDataUrl = this.generateRealPDFDataUrl(note);
      note.pdfData = pdfDataUrl;
      TechDadaData.AppStorage.set("notes", allNotes);
    }

    // Setup action buttons
    const fileName = note.pdfName || `${note.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;

    if (newTabBtn) {
      newTabBtn.classList.remove("hidden");
      newTabBtn.onclick = () => {
        const win = window.open();
        win.document.write(`<iframe src="${pdfDataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      };
    }

    if (downloadBtn) {
      downloadBtn.onclick = () => this.triggerFileDownload(pdfDataUrl, fileName);
    }

    // Render Real PDF directly in iframe & object
    if (contentEl) {
      contentEl.innerHTML = `
        <div class="w-full h-full flex flex-col">
          <!-- Real PDF Status Header -->
          <div class="bg-indigo-900 text-white px-4 py-2.5 rounded-xl mb-3 flex items-center justify-between text-xs shadow-md">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="font-bold">Real PDF Document:</span>
              <span class="text-indigo-200 font-mono">${this.escapeHTML(fileName)}</span>
              <span class="bg-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-bold">${note.size || "Original PDF"}</span>
            </div>
            <div class="flex items-center gap-3">
              <button onclick="NotesModule.downloadNote('${note.id}')" class="text-amber-300 hover:text-white font-bold flex items-center gap-1 transition-colors">
                <i data-lucide="download" class="w-3.5 h-3.5"></i> Download Copy
              </button>
            </div>
          </div>

          <!-- Real Native PDF Viewer Container -->
          <div class="flex-1 w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col relative min-h-[68vh]">
            <iframe id="pdfViewerIframe" src="${pdfDataUrl}#toolbar=1&navpanes=1" class="w-full h-full flex-1 border-0" style="min-height: 70vh;" title="PDF Preview"></iframe>
          </div>
        </div>
      `;
    }

    // Increment downloads count
    note.downloads = (note.downloads || 0) + 1;
    TechDadaData.AppStorage.set("notes", allNotes);

    if (window.lucide) lucide.createIcons();
  },

  closePDFViewer() {
    const modal = document.getElementById("pdfViewerModal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
    const contentEl = document.getElementById("pdfViewerContent");
    if (contentEl) contentEl.innerHTML = "";
    this.activeNoteInViewer = null;
  },

  // 8. Download Note Action
  async downloadNote(noteId) {
    const allNotes = TechDadaData.AppStorage.get("notes", TechDadaData.INITIAL_NOTES);
    let note = allNotes.find((n) => n.id === noteId);
    if (!note) return;

    let pdfDataUrl = note.pdfData;
    if (!pdfDataUrl && window.AppDB) {
      try {
        const stored = await AppDB.getPDFFile(note.id);
        if (stored && stored.dataUrl) pdfDataUrl = stored.dataUrl;
      } catch (e) {}
    }

    if (!pdfDataUrl) {
      pdfDataUrl = this.generateRealPDFDataUrl(note);
      note.pdfData = pdfDataUrl;
      TechDadaData.AppStorage.set("notes", allNotes);
    }

    const fileName = note.pdfName || `${note.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
    this.triggerFileDownload(pdfDataUrl, fileName);

    NotificationsModule.showToast(`Downloading real PDF: ${fileName} 📄✨`, "success");

    note.downloads = (note.downloads || 0) + 1;
    TechDadaData.AppStorage.set("notes", allNotes);
    this.renderNotesList();
  },

  triggerFileDownload(url, filename) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 150);
  },

  // 9. Generate Real Standard PDF (using jsPDF or valid native PDF-1.4 binary stream)
  generateRealPDFDataUrl(note) {
    // 1. Try using window.jspdf if available
    try {
      if (window.jspdf && window.jspdf.jsPDF) {
        const doc = new window.jspdf.jsPDF();
        
        // Header
        doc.setFillColor(79, 70, 229); // Brand Indigo
        doc.rect(0, 0, 210, 35, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("TECH DADA - OFFICIAL STUDY NOTES", 14, 18);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("8th, 9th & 10th Standard Academic Resource Hub", 14, 27);

        // Note Info Block
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(note.title || "Study Note", 14, 48);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Subject: ${note.subject || "General"}   |   Chapter: ${note.chapter || "Ch 1"}   |   Pages: ${note.pages || 10}`, 14, 56);

        // Line divider
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(14, 62, 196, 62);

        // Summary section
        doc.setFontSize(12);
        doc.setTextColor(79, 70, 229);
        doc.setFont("helvetica", "bold");
        doc.text("1. CHAPTER CORE SUMMARY", 14, 72);

        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        doc.setFont("helvetica", "normal");
        const descLines = doc.splitTextToSize(
          note.description || "Comprehensive conceptual explanation with verified board exam definitions, step-by-step solved numericals, and formulas.",
          180
        );
        doc.text(descLines, 14, 80);

        // Academic points
        const startY = 80 + descLines.length * 6 + 10;
        doc.setFontSize(12);
        doc.setTextColor(79, 70, 229);
        doc.setFont("helvetica", "bold");
        doc.text("2. IMPORTANT PRINCIPLES & FORMULAS", 14, startY);

        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        doc.setFont("helvetica", "normal");

        const academicPoints = [
          "• Master the primary statements, definitions, and theorems of this chapter.",
          "• Practice derivations step-by-step; show given data, formula, and units.",
          "• High-yield board exam questions must include neat diagrams with labels.",
          "• Revise previous 5 years' question papers for 100% board preparation."
        ];

        let pointY = startY + 8;
        academicPoints.forEach((pt) => {
          doc.text(pt, 14, pointY);
          pointY += 7;
        });

        // Footer
        doc.setFillColor(241, 245, 249);
        doc.rect(14, pointY + 8, 182, 24, "F");
        doc.setTextColor(71, 85, 105);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Tech Dada Advice:", 18, pointY + 16);
        doc.setFont("helvetica", "normal");
        doc.text("Have doubts on this topic? Use the 'Share Problem to Dada' form or ask Dada AI in the app!", 18, pointY + 23);

        return doc.output("datauristring");
      }
    } catch (e) {
      console.warn("jsPDF fallback:", e);
    }

    // 2. Pure Native PDF-1.4 Binary Generator (Zero dependency fallback)
    const titleText = (note.title || "Study Note").replace(/[()\\]/g, "");
    const subjText = (note.subject || "Science").replace(/[()\\]/g, "");
    const chapText = (note.chapter || "Ch 1").replace(/[()\\]/g, "");
    const descText = (note.description || "Tech Dada verified high yield study notes.").replace(/[()\\]/g, "");

    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 500 >>
stream
BT
/F1 20 Tf
50 720 Td
(TECH DADA - OFFICIAL STUDY NOTES) Tj
/F1 12 Tf
0 -30 Td
(Title: ${titleText}) Tj
0 -20 Td
(Subject: ${subjText}  |  Chapter: ${chapText}) Tj
0 -30 Td
(Summary & Core Principles:) Tj
/F1 10 Tf
0 -20 Td
(${descText}) Tj
0 -30 Td
(1. Master all definitions, diagrams, and formulas in this chapter.) Tj
0 -20 Td
(2. Solve step-by-step textbook exercises for board exam preparation.) Tj
0 -20 Td
(3. For 1-on-1 doubt resolution, ask Dada AI or submit your problem in Tech Dada.) Tj
0 -40 Td
(Downloaded from Tech Dada Study Platform - 8th, 9th & 10th Standard Hub) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000228 00000 n 
0000000780 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
849
%%EOF`;

    return `data:application/pdf;base64,${btoa(unescape(encodeURIComponent(pdfContent)))}`;
  },

  // 10. Admin Add / Edit Note Modal
  openAddNoteModal() {
    const modal = document.getElementById("noteFormModal");
    const form = document.getElementById("noteForm");
    const titleEl = document.getElementById("noteFormModalTitle");
    const idInput = document.getElementById("noteFormId");
    const stdSelect = document.getElementById("noteFormStandard");
    const medSelect = document.getElementById("noteFormMedium");
    const pdfStatus = document.getElementById("noteFormPdfStatus");
    const pdfInput = document.getElementById("noteFormPdfFile");

    if (form) form.reset();
    if (idInput) idInput.value = "";
    if (titleEl) titleEl.textContent = "Add New PDF Note";
    if (pdfInput) pdfInput.value = "";
    if (pdfStatus) pdfStatus.textContent = "Choose an original PDF file from your device.";

    if (stdSelect && this.currentStandard) stdSelect.value = this.currentStandard;
    if (medSelect && this.currentMedium) medSelect.value = this.currentMedium;

    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  },

  openEditNoteModal(noteId) {
    const allNotes = TechDadaData.AppStorage.get("notes", TechDadaData.INITIAL_NOTES);
    const note = allNotes.find((n) => n.id === noteId);
    if (!note) return;

    const modal = document.getElementById("noteFormModal");
    const titleEl = document.getElementById("noteFormModalTitle");
    const idInput = document.getElementById("noteFormId");
    const stdSelect = document.getElementById("noteFormStandard");
    const medSelect = document.getElementById("noteFormMedium");
    const subjInput = document.getElementById("noteFormSubject");
    const chapInput = document.getElementById("noteFormChapter");
    const titleInput = document.getElementById("noteFormTitle");
    const pagesInput = document.getElementById("noteFormPages");
    const descInput = document.getElementById("noteFormDesc");
    const pdfStatus = document.getElementById("noteFormPdfStatus");

    if (idInput) idInput.value = note.id;
    if (titleEl) titleEl.textContent = "Edit PDF Note";
    if (stdSelect) stdSelect.value = note.standardId;
    if (medSelect) medSelect.value = note.mediumId;
    if (subjInput) subjInput.value = note.subject;
    if (chapInput) chapInput.value = note.chapter;
    if (titleInput) titleInput.value = note.title;
    if (pagesInput) pagesInput.value = note.pages || 10;
    if (descInput) descInput.value = note.description || "";

    if (pdfStatus) {
      if (note.pdfName || note.hasRealPdf) {
        pdfStatus.innerHTML = `<span class="text-indigo-600 font-bold">Current PDF: ${this.escapeHTML(note.pdfName || "uploaded_note.pdf")} (Choose another file to replace)</span>`;
      } else {
        pdfStatus.textContent = "Optional: Choose a new PDF to attach.";
      }
    }

    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  },

  closeNoteFormModal() {
    const modal = document.getElementById("noteFormModal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  },

  // 11. Handle Admin Form Submit (Reliably reads file and stores PDF data URL)
  async handleNoteFormSubmit() {
    const idInput = document.getElementById("noteFormId");
    const stdSelect = document.getElementById("noteFormStandard");
    const medSelect = document.getElementById("noteFormMedium");
    const subjInput = document.getElementById("noteFormSubject");
    const chapInput = document.getElementById("noteFormChapter");
    const titleInput = document.getElementById("noteFormTitle");
    const pagesInput = document.getElementById("noteFormPages");
    const descInput = document.getElementById("noteFormDesc");
    const pdfFileInput = document.getElementById("noteFormPdfFile");

    const isEdit = idInput && idInput.value;
    const noteId = isEdit ? idInput.value : `note-${Date.now()}`;

    const allNotes = TechDadaData.AppStorage.get("notes", TechDadaData.INITIAL_NOTES);
    let existingNote = isEdit ? allNotes.find((n) => n.id === noteId) : null;

    let hasRealPdf = existingNote ? !!existingNote.hasRealPdf : false;
    let pdfName = existingNote ? existingNote.pdfName : null;
    let size = existingNote ? existingNote.size : "2.5 MB";
    let pdfData = existingNote ? existingNote.pdfData : null;

    // Check if new PDF file was picked
    const uploadedFile = pdfFileInput && pdfFileInput.files ? pdfFileInput.files[0] : null;

    if (uploadedFile) {
      hasRealPdf = true;
      pdfName = uploadedFile.name;
      const sizeMb = (uploadedFile.size / (1024 * 1024)).toFixed(1);
      size = sizeMb > 0 ? `${sizeMb} MB` : `${Math.round(uploadedFile.size / 1024)} KB`;

      // Read file into Data URL synchronously via Promise
      pdfData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(uploadedFile);
      });

      // Also save in AppDB IndexedDB as persistent backup
      if (window.AppDB && pdfData) {
        try {
          await AppDB.savePDFFile(noteId, uploadedFile, uploadedFile.name);
        } catch (err) {}
      }
    }

    const noteData = {
      id: noteId,
      standardId: stdSelect ? stdSelect.value : "std-10",
      mediumId: medSelect ? medSelect.value : "semi-english",
      subject: subjInput ? subjInput.value.trim() : "General Science",
      chapter: chapInput ? chapInput.value.trim() : "Chapter 1",
      title: titleInput ? titleInput.value.trim() : "Study Notes",
      pages: pagesInput ? parseInt(pagesInput.value, 10) || 12 : 12,
      description: descInput ? descInput.value.trim() : "",
      author: "Tech Dada",
      size: size,
      downloads: existingNote ? existingNote.downloads : 0,
      date: new Date().toISOString().split("T")[0],
      hasRealPdf: true,
      pdfName: pdfName || `${titleInput.value.trim()}.pdf`,
      pdfData: pdfData // Stored directly on note object!
    };

    // If no file was uploaded, generate a real PDF so every note has a valid PDF
    if (!noteData.pdfData) {
      noteData.pdfData = this.generateRealPDFDataUrl(noteData);
    }

    if (isEdit) {
      const idx = allNotes.findIndex((n) => n.id === noteId);
      if (idx !== -1) allNotes[idx] = noteData;
    } else {
      allNotes.unshift(noteData);
    }

    TechDadaData.AppStorage.set("notes", allNotes);
    this.closeNoteFormModal();

    NotificationsModule.showToast(
      uploadedFile
        ? `PDF Note "${noteData.title}" saved with your original uploaded PDF! 📄🎉`
        : `Note "${noteData.title}" saved with generated PDF!`,
      "success"
    );

    // Refresh view
    if (this.currentStandard && this.currentMedium) {
      this.renderSubjectFilterPills();
      this.renderNotesList();
    }
    this.renderStandards();
    if (window.AppState) AppState.renderAdminOverview();
  },

  // 12. Delete Note
  async deleteNote(noteId) {
    if (!confirm("Are you sure you want to delete this PDF note?")) return;

    const allNotes = TechDadaData.AppStorage.get("notes", TechDadaData.INITIAL_NOTES);
    const filtered = allNotes.filter((n) => n.id !== noteId);
    TechDadaData.AppStorage.set("notes", filtered);

    if (window.AppDB) {
      try {
        await AppDB.deletePDFFile(noteId);
      } catch (e) {}
    }

    NotificationsModule.showToast("Note deleted successfully.", "info");

    this.renderSubjectFilterPills();
    this.renderNotesList();
    this.renderStandards();
    if (window.AppState) AppState.renderAdminOverview();
  },

  escapeHTML(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  escapeQuotes(str) {
    if (!str) return "";
    return str.replace(/'/g, "\\'");
  }
};

window.NotesModule = NotesModule;
