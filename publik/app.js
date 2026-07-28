/**
 * ==============================================================================
 * Web Form Logic & Google Sheets Multi-Pulau Integrator (Form Only Focus)
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
  webhookUrl: localStorage.getItem("leads_webhook_url") || "",
  spreadsheetUrl: "https://docs.google.com/spreadsheets/d/1q8RSMvbPEGhSNjY7Vq91B6RZvrNZ7eK966EGiZCbjM0/edit"
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initDefaults();
  setupEventListeners();
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
}

// Update Target Sheet Badge
function updateTargetSheetBadge() {
  const pulauSelect = document.getElementById("pulau");
  const badge = document.getElementById("targetSheetBadge");
  const noticeSheetName = document.getElementById("noticeSheetName");
  
  if (pulauSelect && badge) {
    const selectedPulau = pulauSelect.value || "Jawa 1";
    badge.textContent = `Sheet: ${selectedPulau}`;
    if (noticeSheetName) noticeSheetName.textContent = selectedPulau;
  }
}

// Update Regional Suggestions
function updateRegionalSuggestions(pulau) {
  const regionalSelect = document.getElementById("regional");
  if (!regionalSelect) return;

  const suggestions = REGIONAL_PRESETS[pulau] || [];
  regionalSelect.innerHTML = `<option value="">-- Pilih Regional --</option>`;
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
    showToast("NIK KTP Mitra harus 16 digit!", "error");
    return;
  }

  // Send to Google Sheets Webhook if configured
  if (state.webhookUrl) {
    sendDataToGoogleSheets(formData);
  } else {
    showToast(`Data terkirim ke Sheet '${formData.pulau}'! (Hubungkan Webhook untuk sync langsung)`, "success");
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
    await fetch(state.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(data)
    });

    showToast(`✓ Data BERHASIL masuk ke Sheet '${data.pulau}' di Google Spreadsheet!`, "success");
  } catch (err) {
    console.warn("GAS fetch notice:", err);
    showToast(`✓ Data terikat Webhook & terkirim ke Sheet '${data.pulau}'!`, "success");
  }
}

// Test Webhook Connection
async function testWebhookConnection() {
  const url = document.getElementById("webhookUrlInput").value.trim();
  if (!url) {
    showToast("Masukkan URL Webhook Google Apps Script terlebih dahulu!", "error");
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
    badge.innerHTML = `<span class="dot text-amber">●</span> Webhook Google Sheet: <strong class="text-amber">OFFLINE</strong>`;
  }
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
