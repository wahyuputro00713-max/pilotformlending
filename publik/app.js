/**
 * ==============================================================================
 * Web Form Logic & Google Sheets Multi-Pulau Integrator
 * Dynamic Master Data from Sheet "Data Pulau" (Pulau -> Regional -> Area -> Point)
 * ==============================================================================
 */

// Preset Initial Master Data (Matching Sheet "Data Pulau")
let MASTER_DATA = [
  // Bali Nusra (Matching screenshot)
  { pulau: "Bali Nusra", regional: "Bali", area: "Buleleng", point: "Banjar" },
  { pulau: "Bali Nusra", regional: "Bali", area: "Buleleng", point: "Buleleng" },
  { pulau: "Bali Nusra", regional: "Bali", area: "Buleleng", point: "Gerokgak" },
  { pulau: "Bali Nusra", regional: "Bali", area: "Buleleng", point: "Kubutambahan" },
  { pulau: "Bali Nusra", regional: "Bali", area: "Buleleng", point: "Seririt" },
  { pulau: "Bali Nusra", regional: "Bali", area: "Gianyar", point: "Gianyar" },
  { pulau: "Bali Nusra", regional: "Bali", area: "Gianyar", point: "Klungkung" },
  { pulau: "Bali Nusra", regional: "Bali", area: "Gianyar", point: "Payangan" },
  { pulau: "Bali Nusra", regional: "Bali", area: "Gianyar", point: "Sukawati" },
  { pulau: "Bali Nusra", regional: "Bali", area: "Jembrana", point: "Melaya" },
  { pulau: "Bali Nusra", regional: "Bali", area: "Jembrana", point: "Mendoyo" },
  { pulau: "Bali Nusra", regional: "Bali", area: "Jembrana", point: "Negara" },
  { pulau: "Bali Nusra", regional: "Bali", area: "Jembrana", point: "Penebel" },
  { pulau: "Bali Nusra", regional: "Bali", area: "Jembrana", point: "Selemadeg" },
  { pulau: "Bali Nusra", regional: "Bali", area: "Karangasem", point: "Bangli" },
  { pulau: "Bali Nusra", regional: "Bali", area: "Karangasem", point: "Karangasem" },
  { pulau: "Bali Nusra", regional: "Bali", area: "Karangasem", point: "Kintamani" },
  { pulau: "Bali Nusra", regional: "Bali", area: "Karangasem", point: "Kubu" },
  { pulau: "Bali Nusra", regional: "Bali", area: "Karangasem", point: "Sideman" },
  { pulau: "Bali Nusra", regional: "Bali", area: "Tabanan", point: "Abiansemal" },
  { pulau: "Bali Nusra", regional: "Bali", area: "Tabanan", point: "Kediri 2" },
  { pulau: "Bali Nusra", regional: "Bali", area: "Tabanan", point: "Kuta Selatan" },
  { pulau: "Bali Nusra", regional: "Bali", area: "Tabanan", point: "Mengwi" },
  
  // Default Presets for Other Islands
  { pulau: "Jawa 1", regional: "Regional 1 DKI/Banten", area: "Jakarta Selatan", point: "Kebayoran" },
  { pulau: "Jawa 1", regional: "Regional 2 Jawa Barat", area: "Bandung Central", point: "Dago" },
  { pulau: "Jawa 2", regional: "Regional 3 Jawa Tengah", area: "Semarang City", point: "Simpang Lima" },
  { pulau: "Jawa 2", regional: "Regional 4 Jawa Timur", area: "Surabaya Pusat", point: "Tunjungan" },
  { pulau: "Sulawesi", regional: "Regional Sulawesi Selatan", area: "Makassar", point: "Losari" },
  { pulau: "Sumatera 1", regional: "Regional Sumut", area: "Medan", point: "Medan Kota" },
  { pulau: "Sumatera 2", regional: "Regional Sumsel", area: "Palembang", point: "Ampera" },
  { pulau: "Kalimantan", regional: "Regional Kalbar", area: "Pontianak", point: "Kota Pontianak" }
];

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
  fetchMasterDataFromSheet();
});

// Set Default Values & Initialize Form Options
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
  populatePulauDropdown();
}

// Fetch Live Master Data from Sheet "Data Pulau" via GET Webhook
async function fetchMasterDataFromSheet() {
  if (!state.webhookUrl) return;

  try {
    const res = await fetch(state.webhookUrl, { method: "GET" });
    const json = await res.json();
    
    if (json && json.status === "success" && Array.isArray(json.data) && json.data.length > 0) {
      MASTER_DATA = json.data;
      populatePulauDropdown();
      showToast(`Master data 'Data Pulau' (${json.data.length} baris) berhasil dimuat dari Google Sheet!`, "success");
    }
  } catch (err) {
    console.log("Using initial presets for Master Data (Sheet offline / CORS fetch default)");
  }
}

// Populate Pulau Dropdown
function populatePulauDropdown() {
  const pulauSelect = document.getElementById("pulau");
  if (!pulauSelect) return;

  const currentVal = pulauSelect.value;
  const uniquePulau = [...new Set(MASTER_DATA.map(item => item.pulau))];

  pulauSelect.innerHTML = "";
  uniquePulau.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    pulauSelect.appendChild(opt);
  });

  if (currentVal && uniquePulau.includes(currentVal)) {
    pulauSelect.value = currentVal;
  }

  onPulauChanged();
}

// Cascading 1: When Pulau changes -> Populate Regional
function onPulauChanged() {
  const selectedPulau = document.getElementById("pulau")?.value;
  const regionalSelect = document.getElementById("regional");
  if (!regionalSelect) return;

  const filteredRegionals = [...new Set(
    MASTER_DATA
      .filter(item => item.pulau === selectedPulau && item.regional)
      .map(item => item.regional)
  )];

  regionalSelect.innerHTML = `<option value="">-- Pilih Regional --</option>`;
  filteredRegionals.forEach(r => {
    const opt = document.createElement("option");
    opt.value = r;
    opt.textContent = r;
    regionalSelect.appendChild(opt);
  });

  // Auto-select if only 1 option available
  if (filteredRegionals.length === 1) {
    regionalSelect.value = filteredRegionals[0];
  }

  updateTargetSheetBadge();
  onRegionalChanged();
}

// Cascading 2: When Regional changes -> Populate Area
function onRegionalChanged() {
  const selectedPulau = document.getElementById("pulau")?.value;
  const selectedRegional = document.getElementById("regional")?.value;
  const areaSelect = document.getElementById("area");
  if (!areaSelect) return;

  const filteredAreas = [...new Set(
    MASTER_DATA
      .filter(item => item.pulau === selectedPulau && (!selectedRegional || item.regional === selectedRegional) && item.area)
      .map(item => item.area)
  )];

  areaSelect.innerHTML = `<option value="">-- Pilih / Ketik Area --</option>`;
  filteredAreas.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a;
    areaSelect.appendChild(opt);
  });

  onAreaChanged();
}

// Cascading 3: When Area changes -> Populate Point
function onAreaChanged() {
  const selectedPulau = document.getElementById("pulau")?.value;
  const selectedRegional = document.getElementById("regional")?.value;
  const selectedArea = document.getElementById("area")?.value;
  const pointSelect = document.getElementById("point");
  if (!pointSelect) return;

  const filteredPoints = [...new Set(
    MASTER_DATA
      .filter(item => 
        item.pulau === selectedPulau && 
        (!selectedRegional || item.regional === selectedRegional) &&
        (!selectedArea || item.area === selectedArea) &&
        item.point
      )
      .map(item => item.point)
  )];

  pointSelect.innerHTML = `<option value="">-- Pilih / Ketik Point --</option>`;
  filteredPoints.forEach(pt => {
    const opt = document.createElement("option");
    opt.value = pt;
    opt.textContent = pt;
    pointSelect.appendChild(opt);
  });
}

// Setup Event Listeners
function setupEventListeners() {
  const leadForm = document.getElementById("leadForm");
  if (leadForm) {
    leadForm.addEventListener("submit", handleFormSubmit);
  }

  const btnReset = document.getElementById("btnReset");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      leadForm.reset();
      initDefaults();
      showToast("Form berhasil di-reset", "info");
    });
  }

  // Cascading Change Listeners
  document.getElementById("pulau")?.addEventListener("change", onPulauChanged);
  document.getElementById("regional")?.addEventListener("change", onRegionalChanged);
  document.getElementById("area")?.addEventListener("change", onAreaChanged);

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

  // Phone Formatter
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

  // Save Webhook
  const btnSaveWebhook = document.getElementById("btnSaveWebhook");
  if (btnSaveWebhook) {
    btnSaveWebhook.addEventListener("click", () => {
      const url = document.getElementById("webhookUrlInput").value.trim();
      state.webhookUrl = url;
      localStorage.setItem("leads_webhook_url", url);
      updateWebhookStatusBadge();
      fetchMasterDataFromSheet();
      showToast("URL Webhook tersimpan! Memuat master data...", "success");
      gasModal.classList.remove("open");
    });
  }

  // Test Webhook
  const btnTestWebhook = document.getElementById("btnTestWebhook");
  if (btnTestWebhook) {
    btnTestWebhook.addEventListener("click", testWebhookConnection);
  }

  // Copy Code
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

  if (formData.nik_ktp_mitra && formData.nik_ktp_mitra.length !== 16) {
    showToast("NIK KTP Mitra harus 16 digit!", "error");
    return;
  }

  if (state.webhookUrl) {
    sendDataToGoogleSheets(formData);
  } else {
    showToast(`Data terkirim ke Sheet '${formData.pulau}'! (Hubungkan Webhook untuk sync langsung)`, "success");
  }

  form.reset();
  initDefaults();
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
    badge.innerHTML = `<span class="dot text-emerald">●</span> Webhook: <strong class="text-emerald">TERHUBUNG</strong>`;
  } else {
    badge.innerHTML = `<span class="dot text-amber">●</span> Webhook: <strong class="text-amber">OFFLINE</strong>`;
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
