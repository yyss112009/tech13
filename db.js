/**
 * Tech Dada - Bulletproof Persistent Storage for Real PDF Files
 * Stores real PDFs using IndexedDB with automatic on-demand initialization,
 * in-memory cache, and LocalStorage fallback.
 */

const AppDB = {
  dbName: "TechDadaDB_v2",
  dbVersion: 1,
  db: null,
  memoryCache: {},

  // Ensure DB is initialized before any operation
  async ensureDB() {
    if (this.db) return this.db;

    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(this.dbName, this.dbVersion);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains("pdf_files")) {
            db.createObjectStore("pdf_files", { keyPath: "noteId" });
          }
        };

        request.onsuccess = (event) => {
          this.db = event.target.result;
          resolve(this.db);
        };

        request.onerror = (event) => {
          console.warn("IndexedDB open warning:", event.target.error);
          resolve(null);
        };
      } catch (err) {
        console.warn("IndexedDB catch warning:", err);
        resolve(null);
      }
    });
  },

  init() {
    return this.ensureDB();
  },

  // Save real uploaded PDF file
  async savePDFFile(noteId, fileBlob, fileName) {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = async () => {
        const dataUrl = reader.result;
        const name = fileName || "uploaded_notes.pdf";
        const type = fileBlob.type || "application/pdf";

        // 1. Save in memory cache
        this.memoryCache[noteId] = {
          noteId,
          fileName: name,
          fileType: type,
          fileData: dataUrl
        };

        // 2. Save in LocalStorage fallback if size is reasonable (< 4MB)
        try {
          if (dataUrl.length < 4 * 1024 * 1024) {
            localStorage.setItem(`techdada_pdf_${noteId}`, JSON.stringify({
              fileName: name,
              fileType: type,
              fileData: dataUrl
            }));
          }
        } catch (e) {}

        // 3. Save in IndexedDB
        try {
          const db = await this.ensureDB();
          if (db) {
            const tx = db.transaction(["pdf_files"], "readwrite");
            const store = tx.objectStore("pdf_files");
            store.put({
              noteId,
              fileName: name,
              fileType: type,
              fileData: dataUrl,
              updatedAt: new Date().toISOString()
            });

            tx.oncomplete = () => resolve(true);
            tx.onerror = () => resolve(true);
            return;
          }
        } catch (err) {
          console.warn("IndexedDB write fallback:", err);
        }

        resolve(true);
      };

      reader.onerror = () => resolve(false);
      reader.readAsDataURL(fileBlob);
    });
  },

  // Retrieve actual PDF file by noteId
  async getPDFFile(noteId) {
    // 1. Check in-memory cache first
    if (this.memoryCache[noteId]) {
      const item = this.memoryCache[noteId];
      const blob = this.dataURLToBlob(item.fileData);
      return {
        blob,
        fileName: item.fileName,
        fileType: item.fileType,
        dataUrl: item.fileData
      };
    }

    // 2. Check IndexedDB
    try {
      const db = await this.ensureDB();
      if (db) {
        const result = await new Promise((resolve) => {
          const tx = db.transaction(["pdf_files"], "readonly");
          const store = tx.objectStore("pdf_files");
          const req = store.get(noteId);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        });

        if (result && result.fileData) {
          this.memoryCache[noteId] = result;
          const blob = this.dataURLToBlob(result.fileData);
          return {
            blob,
            fileName: result.fileName,
            fileType: result.fileType,
            dataUrl: result.fileData
          };
        }
      }
    } catch (e) {
      console.warn("IndexedDB read error:", e);
    }

    // 3. Check LocalStorage fallback
    try {
      const stored = localStorage.getItem(`techdada_pdf_${noteId}`);
      if (stored) {
        const item = JSON.parse(stored);
        if (item && item.fileData) {
          this.memoryCache[noteId] = item;
          const blob = this.dataURLToBlob(item.fileData);
          return {
            blob,
            fileName: item.fileName,
            fileType: item.fileType,
            dataUrl: item.fileData
          };
        }
      }
    } catch (e) {}

    return null;
  },

  // Delete PDF file
  async deletePDFFile(noteId) {
    delete this.memoryCache[noteId];
    try {
      localStorage.removeItem(`techdada_pdf_${noteId}`);
    } catch (e) {}

    try {
      const db = await this.ensureDB();
      if (db) {
        const tx = db.transaction(["pdf_files"], "readwrite");
        tx.objectStore("pdf_files").delete(noteId);
      }
    } catch (e) {}

    return true;
  },

  // Convert Data URL to real Blob
  dataURLToBlob(dataURL) {
    if (!dataURL) return null;
    try {
      const parts = dataURL.split(";base64,");
      const contentType = parts[0].split(":")[1] || "application/pdf";
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }

      return new Blob([uInt8Array], { type: contentType });
    } catch (e) {
      console.warn("dataURLToBlob error:", e);
      return null;
    }
  }
};

window.AppDB = AppDB;
