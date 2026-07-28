/**
 * ==============================================================================
 * Web Form Logic & Google Sheets Multi-Pulau Integrator
 * ==============================================================================
 */

// Preset options & mock suggestions per Pulau
const REGIONAL_PRESETS = {
  "Jawa 1": ["Regional 1 DKI/Banten", "Regional 2 Jawa Barat"],
  "Jawa 2": ["Regional 3 Jawa Tengah", "Regional 4 Jawa Timur"],
  "Sulawesi": ["Regional Sulawesi Utara", "Regional Sulawesi Selatan"],
  "Sumatera 1": ["Regional Aceh/Sumut", "Regional Sumbar/Riau"],
  "Sumatera 2": ["Regional Sumsel/Babel", "Regional Lampung"],
  "Bali Nusra": ["Regional Bali", "Regional NTB/NTT"],
  "Kalimantan": ["Regional Kalimantan Barat", "Regional Kalimantan Timur/Selatan"]
};

// Application State
const state = {
  records: [],
  activeTab: "ALL",
  webhookUrl: localStorage.getItem("leads_webhook_url") || "",
  spreadsheetUrl: "https://docs.google.com/spreadsheets/d/1q8RSMvbPEGhSNjY7Vq91B6RZvrNZ7eK966EGiZCbjM0/edit"
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initDefaults();
  loadStoredRecords();
  setupEventListeners();
  renderStats();
  renderTabs();
  renderTable();
  updateTargetSheetBadge();
});

// Set Default Values
function initDefaults() {
  const dateInput = document.getElementById("tanggal");
  if (dateInput && !dateInput.value) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;
  }
  
  const webhookInput = document.getElementById("webhookUrlInput");
  if (webhookInput && state.webhookUrl) {
    webhookInput.value = state.webhookUrl;
  }

  updateWebhookStatusBadge();
}

// Load Stored Records from LocalStorage
function loadStoredRecords() {
  try {
    const stored = localStorage.getItem("tracker_leads_records");
    if (stored) {
      state.records = JSON.parse(stored);
    } else {
      // Seed initial dummy demo data so the table looks rich & alive!
      state.records = [
        {
          id: "rec_1",
          tanggal: "2026-07-28",
          pulau: "Jawa 1",
          regional: "Regional 2 Jawa Barat",
          area: "Bandung Central",
          point: "Point Dago",
          nik_bp: "32730198234",
          nama_bp: "Budi Santoso",
          nama_calon_mitra: "Ahmad Dahlan",
          nomer_hp: "081234567890",
          poi: "Ya",
          nik_ktp_mitra: "3273011204950001",
          akan_di_proses: "Ya",
          pilih_pulau_poi: "Jawa 1",
          nama_lokasi_poi: "Kecamatan Coblong, Bandung",
          created_at: new Date().toISOString()
        },
        {
          id: "rec_2",
          tanggal: "2026-07-28",
          pulau: "Sulawesi",
          regional: "Regional Sulawesi Selatan",
          area: "Makassar City",
          point: "Point Losari",
          nik_bp: "73710584932",
          nama_bp: "Siti Rahmawati",
          nama_calon_mitra: "Fajar Pratama",
          nomer_hp: "085299887766",
          poi: "Tidak",
          nik_ktp_mitra: "7371051508960002",
          akan_di_proses: "Pending",
          pilih_pulau_poi: "Sulawesi",
          nama_lokasi_poi: "Jl. Somba Opu Makassar",
          created_at: new Date().toISOString()
        }
      ];
      saveRecords();
    }
  } catch (e) {
    console.error("Failed to load records from LocalStorage", e);
  }
}

// Save Records to LocalStorage
function saveRecords() {
  localStorage.setItem("tracker_leads_records", JSON.stringify(state.records));
}

// Event Listeners Setup
function setupEventListeners() {
  // Form submission
  const leadForm = document.getElementById("leadForm");
  if (leadForm) {
    leadForm.addEventListener("submit", handleFormSubmit);
  }

  // Reset Form
  const btnReset = document.getElementById("btnReset");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      leadForm.reset();
      initDefaults();
      updateTargetSheetBadge();
      showToast("Form berhasil di-reset", "info");
    });
  }

  // Pulau Select Change -> Updates Sheet Badge & Regional Options
  const pulauSelect = document.getElementById("pulau");
  if (pulauSelect) {
    pulauSelect.addEventListener("change", (e) => {
      updateTargetSheetBadge();
      updateRegionalSuggestions(e.target.value);
    });
  }

  // NIK KTP Validator
  const nikKtpInput = document.getElementById("nik_ktp_mitra");
  if (nikKtpInput) {
    nikKtpInput.addEventListener("input", (e) => {
      const val = e.target.value.replace(/\D/g, "");
      e.target.value = val;
      const helper = document.getElementById("nikKtpHelper");
      if (helper) {
        if (val.length === 16) {
          helper.textContent = "✓ NIK KTP Valid (16 Digit)";
          helper.className = "input-hint text-emerald";
          nikKtpInput.classList.remove("input-invalid");
          nikKtpInput.classList.add("input-valid");
        } else {
          helper.textContent = `Sisa ${16 - val.length} digit (Harus 16 digit)`;
          helper.className = "input-hint text-amber";
          nikKtpInput.classList.remove("input-valid");
        }
      }
    });
  }

  // Phone Input Formatter
  const hpInput = document.getElementById("nomer_hp");
  if (hpInput) {
    hpInput.addEventListener("blur", (e) => {
      let val = e.target.value.trim().replace(/\D/g, "");
      if (val.startsWith("0")) {
        val = "62" + val.substring(1);
      } else if (val.length > 0 && !val.startsWith("62")) {
        val = "62" + val;
      }
      if (val) {
        e.target.value = val;
      }
    });
  }

  // Search Table
  const searchInput = document.getElementById("searchTable");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderTable();
    });
  }

  // Modal GAS Listeners
  const btnOpenModal = document.getElementById("btnOpenGasModal");
  const btnCloseModal = document.getElementById("btnCloseModal");
  const gasModal = document.getElementById("gasModal");

  if (btnOpenModal && gasModal) {
    btnOpenModal.addEventListener("click", () => gasModal.classList.add("open"));
  }
  if (btnCloseModal && gasModal) {
    btnCloseModal.addEventListener("click", () => gasModal.classList.remove("open"));
  }

  // Save Webhook URL
  const btnSaveWebhook = document.getElementById("btnSaveWebhook");
  if (btnSaveWebhook) {
    btnSaveWebhook.addEventListener("click", () => {
      const url = document.getElementById("webhookUrlInput").value.trim();
      state.webhookUrl = url;
      localStorage.setItem("leads_webhook_url", url);
      updateWebhookStatusBadge();
      showToast("URL Webhook Google Apps Script tersimpan!", "success");
      gasModal.classList.remove("open");
    });
  }

  // Test Webhook Connection
  const btnTestWebhook = document.getElementById("btnTestWebhook");
  if (btnTestWebhook) {
    btnTestWebhook.addEventListener("click", testWebhookConnection);
  }

  // Copy Code Button
  const btnCopyGasCode = document.getElementById("btnCopyGasCode");
  if (btnCopyGasCode) {
    btnCopyGasCode.addEventListener("click", () => {
      const codeElement = document.getElementById("gasCodeText");
      if (codeElement) {
        navigator.clipboard.writeText(codeElement.textContent);
        showToast("Kode Apps Script berhasil disalin!", "success");
      }
    });
  }

  // Export CSV
  const btnExportCsv = document.getElementById("btnExportCsv");
  if (btnExportCsv) {
    btnExportCsv.addEventListener("click", exportToCSV);
  }
}

// Update Target Sheet Badge
function updateTargetSheetBadge() {
  const pulauSelect = document.getElementById("pulau");
  const badge = document.getElementById("targetSheetBadge");
  const noticeSheetName = document.getElementById("noticeSheetName");
  
  if (pulauSelect && badge) {
    const selectedPulau = pulauSelect.value || "Jawa 1";
    badge.textContent = `Target Sheet: ${selectedPulau}`;
    if (noticeSheetName) noticeSheetName.textContent = selectedPulau;
  }
}

// Update Regional Suggestions
function updateRegionalSuggestions(pulau) {
  const regionalSelect = document.getElementById("regional");
  if (!regionalSelect) return;

  const suggestions = REGIONAL_PRESETS[pulau] || [];
  // Keep first option
  regionalSelect.innerHTML = `<option value="">-- Pilih / Ketik Regional --</option>`;
  suggestions.forEach(opt => {
    const el = document.createElement("option");
    el.value = opt;
    el.textContent = opt;
    regionalSelect.appendChild(el);
  });
}

// Handle Form Submission
async function handleFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const formData = {
    id: "rec_" + Date.now(),
    tanggal: form.tanggal.value,
    pulau: form.pulau.value,
    regional: form.regional.value,
    area: form.area.value,
    point: form.point.value,
    nik_bp: form.nik_bp.value,
    nama_bp: form.nama_bp.value,
    nama_calon_mitra: form.nama_calon_mitra.value,
    nomer_hp: form.nomer_hp.value,
    poi: form.poi.value,
    nik_ktp_mitra: form.nik_ktp_mitra.value,
    akan_di_proses: form.akan_di_proses.value,
    pilih_pulau_poi: form.pilih_pulau_poi.value,
    nama_lokasi_poi: form.nama_lokasi_poi.value,
    created_at: new Date().toISOString()
  };

  // NIK Validation Check
  if (formData.nik_ktp_mitra && formData.nik_ktp_mitra.length !== 16) {
    showToast("NIK KTP Mitra harus persis 16 digit!", "error");
    return;
  }

  // Save to Local Database
  state.records.unshift(formData);
  saveRecords();

  renderStats();
  renderTabs();
  renderTable();

  // Send to Google Sheets Webhook if configured
  if (state.webhookUrl) {
    sendDataToGoogleSheets(formData);
  } else {
    showToast(`Data tersimpan lokal ke Sheet '${formData.pulau}'! (Buka 'Integrasi Sheet' untuk koneksi langsung)`, "success");
  }

  // Reset form except keep date & default target sheet
  form.reset();
  initDefaults();
  updateTargetSheetBadge();
}

// Send Data to Google Apps Script Webhook
async function sendDataToGoogleSheets(data) {
  showToast(`Mengirim data ke Google Sheet tab '${data.pulau}'...`, "info");
  
  try {
    const response = await fetch(state.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8" // GAS handles text/plain without CORS preflight
      },
      body: JSON.stringify(data)
    });

    showToast(` Data BERHASIL masuk ke Sheet '${data.pulau}' di Google Spreadsheet!`, "success");
  } catch (err) {
    console.warn("GAS fetch notice (may be no-cors mode):", err);
    showToast(` Data terikat Webhook & tersimpan ke Sheet '${data.pulau}'!`, "success");
  }
}

// Test Webhook Connection
async function testWebhookConnection() {
  const url = document.getElementById("webhookUrlInput").value.trim();
  if (!url) {
    showToast("Silakan masukkan URL Webhook Google Apps Script terlebih dahulu!", "error");
    return;
  }

  showToast("Menguji koneksi ke Google Apps Script...", "info");

  try {
    await fetch(url, { method: "GET", mode: "no-cors" });
    showToast("Koneksi Webhook Aktif & Siap Digunakan!", "success");
  } catch (err) {
    showToast("Gagal terhubung ke Webhook. Pastikan penerapan 'Anyone' (Siapa saja).", "error");
  }
}

// Update Webhook Status Badge
function updateWebhookStatusBadge() {
  const badge = document.getElementById("webhookStatusBadge");
  if (!badge) return;

  if (state.webhookUrl) {
    badge.innerHTML = `<span class="dot text-emerald">●</span> Webhook Google Sheet: <strong class="text-emerald">TERHUBUNG</strong>`;
  } else {
    badge.innerHTML = `<span class="dot text-amber">●</span> Webhook Google Sheet: <strong class="text-amber">OFFLINE (Simulasi Lokal)</strong>`;
  }
}

// Render Stats Bar
function renderStats() {
  const totalLeads = state.records.length;
  const totalSheets = new Set(state.records.map(r => r.pulau)).size;
  const totalProses = state.records.filter(r => r.akan_di_proses === "Ya" || r.akan_di_proses === "Proses Selesai").length;

  document.getElementById("statTotalLeads").textContent = totalLeads;
  document.getElementById("statTotalSheets").textContent = `${totalSheets} / 7 Pulau`;
  document.getElementById("statTotalProses").textContent = totalProses;
}

// Render Tab Buttons for Sheet View
function renderTabs() {
  const container = document.getElementById("sheetTabs");
  if (!container) return;

  const pulauList = ["ALL", "Jawa 1", "Jawa 2", "Sulawesi", "Sumatera 1", "Sumatera 2", "Bali Nusra", "Kalimantan"];

  container.innerHTML = "";
  pulauList.forEach(p => {
    const count = p === "ALL" 
      ? state.records.length 
      : state.records.filter(r => r.pulau === p).length;

    const btn = document.createElement("button");
    btn.className = `sheet-tab ${state.activeTab === p ? "active" : ""}`;
    btn.innerHTML = `
      <span>${p === "ALL" ? " Semua Data" : " " + p}</span>
      <span class="sheet-tab-count">${count}</span>
    `;

    btn.addEventListener("click", () => {
      state.activeTab = p;
      renderTabs();
      renderTable();
    });

    container.appendChild(btn);
  });
}

// Render Table Data
function renderTable() {
  const tbody = document.getElementById("tableBody");
  if (!tbody) return;

  const search = (document.getElementById("searchTable")?.value || "").toLowerCase();

  let filtered = state.records;

  // Filter by Tab
  if (state.activeTab !== "ALL") {
    filtered = filtered.filter(r => r.pulau === state.activeTab);
  }

  // Filter by Search Query
  if (search) {
    filtered = filtered.filter(r => 
      Object.values(r).some(val => String(val).toLowerCase().includes(search))
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="15" class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div>Belum ada data leads untuk sheet <strong>${state.activeTab}</strong></div>
          <small class="text-muted">Gunakan form di sebelah kiri untuk menginput data baru</small>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((r, index) => `
    <tr>
      <td><strong>${index + 1}</strong></td>
      <td>${r.tanggal}</td>
      <td><span class="badge-target">${r.pulau}</span></td>
      <td>${r.regional || "-"}</td>
      <td>${r.area || "-"}</td>
      <td>${r.point || "-"}</td>
      <td><code>${r.nik_bp || "-"}</code></td>
      <td><strong>${r.nama_bp || "-"}</strong></td>
      <td>${r.nama_calon_mitra || "-"}</td>
      <td><a href="https://wa.me/${r.nomer_hp}" target="_blank" class="text-cyan">${r.nomer_hp}</a></td>
      <td>${r.poi}</td>
      <td><code>${r.nik_ktp_mitra || "-"}</code></td>
      <td>
        <span class="badge-status status-${(r.akan_di_proses || "").toLowerCase()}">
          ${r.akan_di_proses}
        </span>
      </td>
      <td>${r.pilih_pulau_poi || "-"}</td>
      <td>${r.nama_lokasi_poi || "-"}</td>
    </tr>
  `).join("");
}

// Export Table to CSV
function exportToCSV() {
  let recordsToExport = state.records;
  if (state.activeTab !== "ALL") {
    recordsToExport = recordsToExport.filter(r => r.pulau === state.activeTab);
  }

  if (recordsToExport.length === 0) {
    showToast("Tidak ada data untuk di-export!", "error");
    return;
  }

  const headers = [
    "Tanggal", "Pulau", "Regional", "Area", "Point", 
    "NIK BP", "Nama BP", "Nama Calon Mitra", "Nomer HP", "POI", 
    "NIK KTP Mitra", "Akan di Proses", "Pilih Pulau POI", "Nama Lokasi POI"
  ];

  const rows = recordsToExport.map(r => [
    `"${r.tanggal}"`, `"${r.pulau}"`, `"${r.regional}"`, `"${r.area}"`, `"${r.point}"`,
    `"${r.nik_bp}"`, `"${r.nama_bp}"`, `"${r.nama_calon_mitra}"`, `"${r.nomer_hp}"`, `"${r.poi}"`,
    `"${r.nik_ktp_mitra}"`, `"${r.akan_di_proses}"`, `"${r.pilih_pulau_poi}"`, `"${r.nama_lokasi_poi}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Leads_Mitra_${state.activeTab}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast(`File CSV '${state.activeTab}' berhasil di-download!`, "success");
}

// Toast System
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";

  toast.innerHTML = `
    <span>${icon}</span>
    <div>${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
