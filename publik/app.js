const PULAU_OPTIONS = window.PULAU_OPTIONS || ["Jawa 1", "Jawa 2", "Sumatera 1", "Sumatera 2", "Sulawesi", "Kalimantan", "Bali Nusra"];
const POINT_OPTIONS = window.POINT_OPTIONS;
const POI_OPTIONS = window.POI_OPTIONS;

// Categorize POI names into islands
function getPulauForPoi(poiName) {
  if (!poiName) return "Jawa 2";
  const p = poiName.trim();
  
  // 1. Regional suffix matching (from Sheet Column D text format, e.g., "BALAI DESA GADUNGANBali", "BENDA AL HIKMAHJawa Tengah 3")
  if (/Jawa\s*Barat|Banten|Jakarta|DKI/i.test(p)) return "Jawa 1";
  if (/Jawa\s*Tengah|Jawa\s*Timur|Yogyakarta|DIY/i.test(p)) return "Jawa 2";
  if (/Sumatera\s*Utara|Aceh|Riau|Kepulauan\s*Riau|Kepri/i.test(p)) return "Sumatera 1";
  if (/Sumatera\s*Barat|Jambi|Sumatera\s*Selatan|Bengkulu|Lampung|Bangka|Belitung/i.test(p)) return "Sumatera 2";
  if (/Sulawesi|Gorontalo/i.test(p)) return "Sulawesi";
  if (/Kalimantan/i.test(p)) return "Kalimantan";
  if (/Bali|Nusa\s*Tenggara|NTB|NTT/i.test(p)) return "Bali Nusra";

  // 2. Keyword fallback for older/plain POI names
  const lower = p.toLowerCase();
  if (lower.startsWith("01 ")) {
    if (/cianjur|cigeulis|cigudeg|cikedung|cimalaka|cipeucang|ciuyah|ciwaru|gebang|kasemen|malausma|padaherang|pameungpeuk|parung|pasar kemis|petir|purwakarta|rancah|sukanegara|tanjungkerta|wanasalam/.test(lower)) {
      return "Jawa 1";
    }
    if (/brandan|halaban|jakabaring|lubai|matur|medan|pedamaran|prabumulih|rengas/.test(lower)) {
      return "Sumatera 1";
    }
    if (/bayah/.test(lower)) return "Jawa 1";
    if (/tambo|tobo/.test(lower)) return "Sumatera 2";
  }
  
  // Bali Nusra
  if (/adonara|aesesa|aikmel|aimere|alor|amarasi|amphitheater|apotheke|arubara|atambua|bakulan|balinggi|bali|baolang|baranusa|belu|besikama|bima|bobou|bonder|cancar|danga|dasong|denpasar|dompu|dualaus|ende|gmit|golewa|ile ape|insana|iteng|jurang are|kaubele|kewapante|kintamani|klibang|komodo|kopang|kuta|labuan bajo|lamekongga|lamokengga|larantuka|ledelero|lelamase|lembor|leneng|lewa|lianglolong|lombok|lunyuk|mataloko|matawai|mataram|maumere|mbay|mengwi|nagekeo|narmada|nita|nubatukan|oenasi|oepliki|ompu|paga|praya|pue|puni|raba|radamata|renteng|reok|riung|ruteng|sade|sakra|sanur|satar mese|selong|seteluk|singaraja|soa|soe|sumba|sumbawa|taliwang|tasifeto|tastura|teluk mutiara|terara|tiberias|ubud|waikabubak|waingapu|waiwadan|waturia|weliman|wewewa|wewiku|woja|wolowaru/.test(lower)) {
    return "Bali Nusra";
  }
  
  // Sulawesi
  if (/amurang|baolan|barombong|batui|batupoaro|bentauna|biau|bintauna|biromaru|bitung|bolaang|boliyohuto|bontomarannu|bontonompo|bunaken|bunta|cambai|dampal|dondo|galesong|gorontalo|gowa|jeneponto|kabila|kadia|kaidipang|kalabbirang|kalukubula|kasimbar|kauditan|kawangkoan|kendari|kokalukuna|kolaka|kotamobagu|kwandang|labakkang|laeya|lage|lalabata|lamasi|lanipa|lasoani|lasusua|loea|lolak|luwuk|luyo|maesa|majene|makassar|malalayang|mamasa|mambi|mamuju|manggarupi|mantikulore|mapanget|mare|marisa|maros|masamba|mepanga|modayag|modoinding|molutangga|moncongloe|moutong|ngapa|paccing|palakka|paleteang|palibelo|pallangga|palolo|palu|pamona|pangkajene|pangkep|parigi|pasarwajo|pattallassang|pelamonia|pitumpanua|pohjentrek|poigar|poleang|polewali|pomalaa|pondidaha|ponrang|popayato|poso|rannayya|ranomeeto|rappang|rappocini|ratahan|ratolindo|sangkub|sindue|sinjai|suwawa|tallo|tamalate|tamalatea|tanete|tawaeli|telihan|tempe|tibawa|tilamuta|tinanggea|tinggi moncong|tinombo|tiworo|toili|tolitoli|tombariri|tomohon|tomoni|tondano|tongauna|tongkuno|topoyo|torue|towuti|ujung bulu|ujung loe|wanea|wara|watang|wawotobi/.test(lower)) {
    return "Sulawesi";
  }
  
  // Kalimantan
  if (/amuntai|anjongan|badau|balesang|balikpapan|banjarmasin|barabai|bati-bati|batu mandi|bengkalis|bengkayang|bontang|dusun selatan|dusun tengah|dusun timur|gantung|handil|jaar|jekan raya|kandangan|kapuas|kelua|kintap|kota bangun|kubu|kusan|liang anggang|loa janan|long ikis|maliku|marabahan|martapura|mempawah|murung|ngabang|pahandut|palangkaraya|palaran|pangeran|pontianak|pulaulaut|sambas|samboja|sambutan|sampaga|sampit|sangatta|sanggi|sanggau|satui|sekadau|sekayam|sepinggan|singkawang|sungai ambawang|sungai kakap|sungai pinyuh|sungai raya|tabalong|tamiang|tanah bumbu|tanah grogot|tanah laut|tarakan|tayan|tebas|tenggarong|terusan|teweh/.test(lower)) {
    return "Kalimantan";
  }
  
  // Sumatera 1 (Sumut, Aceh, Riau, Kepri)
  if (/air joman|asahan|bagan|bahorok|balige|bangko|batang kuis|batangtoru|batin solapan|belawan|berastagi|bilah|binjai|brandan|bukit batrem|deli|delser|dolok|dumai|hkbp|hinai|indragiri|indrapura|kaban jahe|kabanjahe|kampar|kandis|kualuh|kuantan|labuhan|langkat|limapuluh|lubuk pakam|mandau|marbau|marendal|marpoyan|medan|merek|minas|na ix-x|namorambe|natal|padang bolak|padang sidempuan|pangkalan kerinci|pangkalan kuras|pangkalan susu|pasir penyu|payakumbuh|pecut|perbaungan|perdagangan|petapahan|pinggir|pinangsori|pujud|rengat|rumbai|sekuntum|selatpanjang|siabu|siak|siantar|sibolga|siborong|sidikalang|simalungun|simpang padang|singkil|sipirok|sitinjo|sosa|stabat|sunggal|tanjung balai|tanjung morawa|tarutung|tebing tinggi|tembung|tualang|ukui/.test(lower)) {
    return "Sumatera 1";
  }
  
  // Sumatera 2 (Sumbar, Jambi, Sumsel, Bengkulu, Lampung, Babel)
  if (/air anyir|air belo|akabiluru|arizona|babat toman|bengkulu|bentiring|betung|blambangan|bukit kemuning|bukit sundi|bunut|cahya makmur|curup|gajah|gelumbang|gisting|guguk|harau|ilir|indralaya|jambi|jarai|jua jua|jurai|kalianda|kamang|karang jaya|kaur|kayu agung|kayu aro|kebawetan|kedaton|kedondong|kelayang|keliling danau|kemiling|kinali|kisaran|komering|kota agung|kota arga makmur|kota manna|kota metro|koto|kuala dendang|kuala tungkal|lahat|lampung|lembah gumanti|lembah melintang|lengayang|lempuing|linggo|lubai|lubuk alung|lubuk basung|lubuk begalung|lubuk dalam|lubuk raja|lubuk sikaping|lubuk sikarah|lubuklinggau|lunang|mandiangin|manna|maro sebo|megang sakti|merangin|merbau mataram|merlung|mestong|muara dua|muara enim|muara kelingi|muara sabak|muara tebo|muara tembesi|mukomuko|nagari|natar|opas|paal merah|padang|pagaralam|pampangan|parittiga|pasaman|payung|pedamaran|pelepat|pemulutan|penarik|pendopo|pinang raya|plaju|pondok kelapa|pondok tinggi|prabumulih|pringsewu|pulau punjung|rambah|ramba|rao|riau silip|riding panjang|rimbo|sabak|sadai|salo|sarolangun|sarudik|seberang ulu|seberida|sekayu|selangit|selebar|seluma|semidang|siulak|sukarami|sungai bahar|sungai beremas|sungai keruh|sungai lilin|sungai limau|sungai pagu|sungai pandan|sungai tarab|sungailiat|tabir|talang|tanjung bintang|tanjung pandan|tanjung raja|tanjung raya|tanjung senang|tapan|tapung|tebo|teluk betung|teluk segara|tembilahan|toboali|tuguhiu|tungkal|ujan mas|way/.test(lower)) {
    return "Sumatera 2";
  }
  
  // Jawa 1 (Banten, Jabar, DKI)
  if (/alian|anjatan|arjawinangun|astanajapura|babakan|balapulang|baleendah|bandung|banjar|banjarsari|banten|baros|batujajar|bayah|bekasi|bogor|bojong|bojongsoang|buahdua|cangkuang|cariu|ciamis|cianjur|ciawi|cibeber|cibereum|ciborelang|cigudeg|cigeulis|cigasong|cijeungjing|cijulang|cikalong|cikande|cikeusal|cikeris|cikedung|cikoneng|ciledug|cilenka|cileunyi|cileungsi|cilimus|cimalaka|cimahi|cimanggu|cipeucang|cipeujeuh|cipanas|cipatat|cisaat|cisadap|ciseeng|cisitu|citeureup|ciwandan|ciwidey|ciyah|ciwaru|conggeang|darma|darmaraja|depok|gabus wetan|gebang|haurgeulis|ibun|indramayu|jamblang|jasinga|jatibarang|jatinangor|jatiluhur|jebus|kadipaten|kandang haur|kandanghaur|karawang|kasemen|kawali|kedokan bunder|kemang|kramatwatu|kuningan|kutawaluya|lakbok|lebak|lemahsugih|lemah mekar|leuwiliang|leuwimunding|ligung|luragung|maja|majalengka|malausma|malingping|maniis|maleber|menes|merak|padaherang|pameungpeuk|pandeglang|pangandaran|pangenan|panjalu|panumbangan|parung|pasar kemis|pasir jamu|pasirmuncang|pasirmulya|patrol|pedes|petir|puncak|purwakarta|pusakanagara|rajadesa|rangkasbitung|rengasdengklok|sajira|saketi|serang|singaparna|soreang|subang|sukabumi|sukanegara|sukatani|sukawangi|sumedang|tangerang|tanjungkerta|tasikmalaya|terisi|tigaraksa|tomo|tukdana|ujungjaya|waled|wanasalam/.test(lower)) {
    return "Jawa 1";
  }
  
  // Default fallback for Java locations (Jateng, DIY, Jatim)
  return "Jawa 2";
}

function updatePoiByPulau(selectedPulau) {
  if (!poiLocationCombobox) return;
  
  if (!selectedPulau) {
    poiLocationCombobox.updateOptions(POI_OPTIONS);
    return;
  }
  
  // Filter POIs matching selected pulau
  const filtered = POI_OPTIONS.filter(poi => getPulauForPoi(poi) === selectedPulau);
  poiLocationCombobox.updateOptions(filtered);
  
  // Clear poiLocation input if current selection is invalid for newly chosen island
  if (poiLocationCombobox.selectedValue && !filtered.includes(poiLocationCombobox.selectedValue)) {
    poiLocationCombobox.clear();
  }
}

const DEFAULT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxwlAqYT-Kh66WWG9lrknNlA-RESczDsq5Iw6ZYwFf8Kr34XdFqGpENRthLWwyzygCB/exec';

// ==========================================================================
// CONFIGURATION & GLOBAL STATE
// ==========================================================================
const STATE = {
  currentStep: 1,
  totalSteps: 2, // Dynamic, 2 if asal_poi = Tidak, 3 if asal_poi = Ya
  draftKey: 'mitra_form_draft',
  settingsKey: 'mitra_form_settings',
  submittedData: null,
  
  // Default Settings
  settings: {
    webhookEnabled: true,
    webhookUrl: DEFAULT_WEBHOOK_URL
  }
};

// Elements Cache
const DOM = {
  form: document.getElementById('mitra-form'),
  steps: document.querySelectorAll('.form-step'),
  stepNodes: document.querySelectorAll('.step-node'),
  poiStepperNode: document.getElementById('poi-stepper-node'),
  progressFill: document.getElementById('progress-fill'),
  
  // Navigation Buttons
  prevBtn: document.getElementById('prev-btn'),
  nextBtn: document.getElementById('next-btn'),
  submitBtn: document.getElementById('submit-btn'),
  
  // Inputs for conditional routing
  poiYa: document.getElementById('poi-ya'),
  poiTidak: document.getElementById('poi-tidak'),
  poiStepSection: document.getElementById('poi-step-section'),
  
  // Cards
  successCard: document.getElementById('success-card'),
  formCard: document.querySelector('.form-card'),
  summaryContent: document.getElementById('summary-content'),
  
  // Settings elements
  themeToggle: document.getElementById('theme-toggle'),
  themeIcon: document.getElementById('theme-icon'),
  settingsToggle: document.getElementById('settings-toggle'),
  settingsModal: document.getElementById('settings-modal'),
  settingsClose: document.getElementById('settings-close'),
  settingsSave: document.getElementById('settings-save'),
  webhookEnabled: document.getElementById('webhook-enabled'),
  webhookUrl: document.getElementById('webhook-url'),
  webhookUrlGroup: document.getElementById('webhook-url-group'),
  testWebhookBtn: document.getElementById('test-webhook-btn'),
  testWebhookStatus: document.getElementById('test-webhook-status'),
  
  // Action Buttons
  restartBtn: document.getElementById('restart-btn'),
  exportCsvBtn: document.getElementById('export-csv-btn'),
  exportJsonBtn: document.getElementById('export-json-btn')
};

// ==========================================================================
// SEARCHABLE DROP DOWN (COMBOBOX) class
// ==========================================================================
class SearchableCombobox {
  constructor(containerId, options, onSelectCallback) {
    this.container = document.getElementById(containerId);
    this.searchInput = this.container.querySelector('input[type="text"]');
    this.hiddenInput = this.container.querySelector('input[type="hidden"]');
    this.clearBtn = this.container.querySelector('.combobox-clear');
    this.dropdown = this.container.querySelector('.combobox-dropdown');
    this.options = (options || []).filter(opt => opt && typeof opt === 'string' && !opt.trim().startsWith('#') && opt.trim() !== '');
    this.onSelect = onSelectCallback;
    this.isOpen = false;
    this.selectedValue = '';
    
    this.init();
  }
  
  init() {
    // Event Listeners
    this.searchInput.addEventListener('focus', () => this.open());
    this.searchInput.addEventListener('input', () => this.filterOptions());
    
    // Toggle dropdown on arrow / icon container click
    this.container.querySelector('.combobox-arrow').addEventListener('click', (e) => {
      e.stopPropagation();
      this.isOpen ? this.close() : this.open();
    });
    
    // Clear selection
    this.clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.clear();
    });
    
    // Document click to close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.close();
      }
    });
    
    // Keyboard navigation
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }
  
  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.container.classList.add('open');
    this.filterOptions();
  }
  
  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.container.classList.remove('open');
    
    // If user closed without selecting a valid item, restore previous search or clear it
    if (this.hiddenInput.value === '') {
      this.searchInput.value = '';
      this.clearBtn.style.display = 'none';
    } else {
      // Find the matched option
      const currentVal = this.hiddenInput.value;
      this.searchInput.value = currentVal;
      this.clearBtn.style.display = 'block';
    }
  }
  
  setValue(val) {
    this.selectedValue = val;
    this.hiddenInput.value = val;
    this.searchInput.value = val;
    this.clearBtn.style.display = val ? 'block' : 'none';
    
    // Remove error class on success choice
    const group = this.container.closest('.form-group');
    if (group) group.classList.remove('has-error');
    
    if (this.onSelect) this.onSelect(val);
  }
  
  clear() {
    this.setValue('');
    this.filterOptions();
    this.searchInput.focus();
  }
  
  updateOptions(newOptions) {
    // Filter out empty items and spreadsheet formula errors (e.g. #REF!, #N/A, #VALUE!)
    this.options = (newOptions || []).filter(opt => opt && typeof opt === 'string' && !opt.trim().startsWith('#') && opt.trim() !== '');
  }
  
  filterOptions() {
    const query = this.searchInput.value.toLowerCase().trim();
    this.dropdown.innerHTML = '';
    
    // Filter matching options (fuzzy contains)
    const matches = this.options.filter(opt => opt.toLowerCase().includes(query));
    
    // Performance optimization: Render only top 50 matched items
    const displayMatches = matches.slice(0, 50);
    
    if (displayMatches.length === 0) {
      this.dropdown.innerHTML = '<div class="combobox-no-results">Tidak ada hasil cocok</div>';
      return;
    }
    
    displayMatches.forEach(opt => {
      const item = document.createElement('div');
      item.className = 'combobox-item';
      if (opt === this.selectedValue) {
        item.classList.add('selected');
      }
      item.textContent = opt;
      
      item.addEventListener('click', () => {
        this.setValue(opt);
        this.close();
      });
      
      this.dropdown.appendChild(item);
    });
    
    // If there are more matches hidden, append a helper indicator
    if (matches.length > 50) {
      const moreIndicator = document.createElement('div');
      moreIndicator.className = 'combobox-searching';
      moreIndicator.textContent = `Menampilkan 50 dari ${matches.length} pilihan. Silahkan ketik spesifik.`;
      this.dropdown.appendChild(moreIndicator);
    }
  }
}

// Instantiate Comboboxes globally
let pulauCombobox;
let pointCombobox;
let poiLocationCombobox;

// ==========================================================================
// DRAFT AUTO-SAVE & POPULATE
// ==========================================================================
function saveDraft() {
  const formData = new FormData(DOM.form);
  const draft = {};
  
  for (const [key, val] of formData.entries()) {
    draft[key] = val;
  }
  
  // Save search strings as well to restore search input visuals
  const pulauSearchEl = document.getElementById('pulau-poi-search');
  if (pulauSearchEl) draft['pulau_poi_search'] = pulauSearchEl.value;
  draft['point_branch_search'] = document.getElementById('point-branch-search').value;
  draft['poi_location_search'] = document.getElementById('poi-location-search').value;
  
  localStorage.setItem(STATE.draftKey, JSON.stringify(draft));
}

function loadDraft() {
  const draftStr = localStorage.getItem(STATE.draftKey);
  if (!draftStr) return;
  
  try {
    const draft = JSON.parse(draftStr);
    
    // Fill text & hidden inputs
    if (draft.nik_bp) document.getElementById('nik-bp').value = draft.nik_bp;
    if (draft.nama_bp) document.getElementById('nama-bp').value = draft.nama_bp;
    if (draft.nama_mitra) document.getElementById('nama-mitra').value = draft.nama_mitra;
    if (draft.ktp_mitra) document.getElementById('ktp-mitra').value = draft.ktp_mitra;
    if (draft.hp_mitra) document.getElementById('hp-mitra').value = draft.hp_mitra;

    
    // Restore point combobox values
    if (draft.point_branch) {
      pointCombobox.setValue(draft.point_branch);
    } else if (draft.point_branch_search) {
      document.getElementById('point-branch-search').value = draft.point_branch_search;
    }
    
    // Restore pulau combobox values
    if (draft.pulau_poi && pulauCombobox) {
      pulauCombobox.setValue(draft.pulau_poi);
    } else if (draft.pulau_poi_search && document.getElementById('pulau-poi-search')) {
      document.getElementById('pulau-poi-search').value = draft.pulau_poi_search;
    }
    
    // Restore poi combobox values
    if (draft.poi_location) {
      poiLocationCombobox.setValue(draft.poi_location);
    } else if (draft.poi_location_search) {
      document.getElementById('poi-location-search').value = draft.poi_location_search;
    }
    
    // Fill product radio
    if (draft.produk) {
      const radio = DOM.form.querySelector(`input[name="produk"][value="${draft.produk}"]`);
      if (radio) radio.checked = true;
    }
    
    // Fill POI radio and execute routing update
    if (draft.asal_poi) {
      const radio = DOM.form.querySelector(`input[name="asal_poi"][value="${draft.asal_poi}"]`);
      if (radio) {
        radio.checked = true;
        updatePoiRouting(draft.asal_poi);
      }
    }
    
  } catch (e) {
    console.error('Error loading draft:', e);
  }
}

// Clear draft and reset the entire form
function resetEntireForm() {
  DOM.form.reset();
  if (pulauCombobox) pulauCombobox.clear();
  pointCombobox.clear();
  poiLocationCombobox.clear();
  updatePoiByPulau('');
  
  // Default POI routing reset
  updatePoiRouting('Tidak');
  
  // Move back to step 1
  goToStep(1);
  
  // Show form and hide success card
  DOM.successCard.style.display = 'none';
  DOM.formCard.style.display = 'block';
  
  // Clear draft from localStorage
  localStorage.removeItem(STATE.draftKey);
}

// ==========================================================================
// CONDITIONAL NAVIGATION & STEP WIZARD LOGIC
// ==========================================================================
function updatePoiRouting(asalPoiValue) {
  if (asalPoiValue === 'Ya') {
    STATE.totalSteps = 3;
    DOM.poiStepperNode.style.display = 'flex';
    DOM.poiStepSection.querySelector('input[type="hidden"]').required = true;
  } else {
    STATE.totalSteps = 2;
    DOM.poiStepperNode.style.display = 'none';
    DOM.poiStepSection.querySelector('input[type="hidden"]').required = false;
    
    // If user is currently on step 3 but changes to "Tidak", push them back to step 2
    if (STATE.currentStep === 3) {
      goToStep(2);
    }
  }
  updateNavButtons();
}

function goToStep(step) {
  // Bound checks
  if (step < 1 || step > STATE.totalSteps) return;
  
  // Remove active state from current step & add to new step
  DOM.steps.forEach(sec => {
    sec.classList.remove('active');
    if (parseInt(sec.dataset.step) === step) {
      sec.classList.add('active');
    }
  });
  
  // Update Stepper Visuals
  DOM.stepNodes.forEach(node => {
    const nodeStep = parseInt(node.dataset.step);
    node.classList.remove('active', 'completed');
    
    if (nodeStep === step) {
      node.classList.add('active');
    } else if (nodeStep < step) {
      node.classList.add('completed');
    }
  });
  
  // Progress bar fill calculation
  // Step 1: 0%, Step 2: 50% (of 2 steps) or 33% (of 3 steps)
  const percent = ((step - 1) / (STATE.totalSteps - 1)) * 100;
  DOM.progressFill.style.width = `${percent}%`;
  
  STATE.currentStep = step;
  updateNavButtons();
  
  // Scroll to top of form smoothly on step change
  DOM.formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function updateNavButtons() {
  // Prev button visibility
  if (STATE.currentStep === 1) {
    DOM.prevBtn.style.display = 'none';
  } else {
    DOM.prevBtn.style.display = 'inline-flex';
  }
  
  // Next and Submit buttons toggle
  if (STATE.currentStep === STATE.totalSteps) {
    DOM.nextBtn.style.display = 'none';
    DOM.submitBtn.style.display = 'inline-flex';
  } else {
    DOM.nextBtn.style.display = 'inline-flex';
    DOM.submitBtn.style.display = 'none';
  }
}

// ==========================================================================
// VALIDATION LOGIC
// ==========================================================================
function validateStep(step) {
  let isValid = true;
  
  if (step === 1) {
    // NIK BP Validation: 7 to 8 digits
    const nikInput = document.getElementById('nik-bp');
    const nikVal = nikInput.value.trim();
    if (!/^\d{7,8}$/.test(nikVal)) {
      showError(nikInput, true);
      isValid = false;
    } else {
      showError(nikInput, false);
    }
    
    // Nama BP Validation: required
    const namaInput = document.getElementById('nama-bp');
    if (namaInput.value.trim() === '') {
      showError(namaInput, true);
      isValid = false;
    } else {
      showError(namaInput, false);
    }
    
    // Point Branch Validation: must select matching branch
    const branchHidden = document.getElementById('point-branch');
    const branchSearch = document.getElementById('point-branch-search');
    if (branchHidden.value === '' || !POINT_OPTIONS.includes(branchHidden.value)) {
      showError(branchSearch, true);
      isValid = false;
    } else {
      showError(branchSearch, false);
    }
  }
  
  else if (step === 2) {
    // Nama Calon Mitra: required
    const namaMitra = document.getElementById('nama-mitra');
    if (namaMitra.value.trim() === '') {
      showError(namaMitra, true);
      isValid = false;
    } else {
      showError(namaMitra, false);
    }
    
    // KTP Calon Mitra: Optional, but if entered must be 16 digits
    const ktpInput = document.getElementById('ktp-mitra');
    const ktpVal = ktpInput.value.trim();
    if (ktpVal !== '' && !/^\d{16}$/.test(ktpVal)) {
      showError(ktpInput, true);
      isValid = false;
    } else {
      showError(ktpInput, false);
    }
    
    // HP Calon Mitra: Indonesian Phone number, min 11 and max 13 digits (normalized)
    const hpInput = document.getElementById('hp-mitra');
    const hpVal = hpInput.value.trim();
    // Normalize prefix +62 or 62 to 0 to count exact digits fairly
    const normalizedHp = hpVal.replace(/^\+62/, '0').replace(/^62/, '0').replace(/\D/g, '');
    if (normalizedHp.length < 11 || normalizedHp.length > 13 || !/^(08|628|\+628)/.test(hpVal)) {
      showError(hpInput, true);
      isValid = false;
    } else {
      showError(hpInput, false);
    }
    
    // Produk Radio selection
    const produkRadios = DOM.form.querySelectorAll('input[name="produk"]');
    let produkChecked = false;
    produkRadios.forEach(r => { if (r.checked) produkChecked = true; });
    
    const produkErrorGroup = document.getElementById('produk-error').closest('.form-group');
    if (!produkChecked) {
      produkErrorGroup.classList.add('has-error');
      isValid = false;
    } else {
      produkErrorGroup.classList.remove('has-error');
    }
    
    // Asal POI Radio selection
    const poiRadios = DOM.form.querySelectorAll('input[name="asal_poi"]');
    let poiChecked = false;
    poiRadios.forEach(r => { if (r.checked) poiChecked = true; });
    
    const poiErrorGroup = document.getElementById('asal_poi-error').closest('.form-group');
    if (!poiChecked) {
      poiErrorGroup.classList.add('has-error');
      isValid = false;
    } else {
      poiErrorGroup.classList.remove('has-error');
    }
  }
  
  else if (step === 3) {
    // Pulau POI validation
    const pulauHidden = document.getElementById('pulau-poi');
    const pulauSearch = document.getElementById('pulau-poi-search');
    if (pulauHidden && (pulauHidden.value === '' || !PULAU_OPTIONS.includes(pulauHidden.value))) {
      showError(pulauSearch, true);
      isValid = false;
    } else if (pulauSearch) {
      showError(pulauSearch, false);
    }

    // POI Location validation
    const poiHidden = document.getElementById('poi-location');
    const poiSearch = document.getElementById('poi-location-search');
    if (poiHidden.value === '' || !POI_OPTIONS.includes(poiHidden.value)) {
      showError(poiSearch, true);
      isValid = false;
    } else {
      showError(poiSearch, false);
    }
  }
  
  return isValid;
}

function showError(inputEl, isError) {
  const group = inputEl.closest('.form-group');
  if (!group) return;
  
  if (isError) {
    group.classList.add('has-error');
  } else {
    group.classList.remove('has-error');
  }
}

async function submitToGoogleForm(data) {
  // Ensure hidden iframe exists in document body to capture form response redirection
  let iframe = document.getElementById('hidden_iframe');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.name = 'hidden_iframe';
    iframe.id = 'hidden_iframe';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
  }
  
  // Create temporary form
  const tempForm = document.createElement('form');
  tempForm.action = 'https://docs.google.com/forms/d/e/1FAIpQLSfR9wbxzXIT86bTqoiByexvyLpD8TUcH8_dSSkV3Alf_sCG1Q/formResponse';
  tempForm.method = 'POST';
  tempForm.target = 'hidden_iframe';
  tempForm.style.display = 'none';
  
  // Populate field mappings
  const pulauMap = {
    'Bali Nusra': { gChoice: 'Ya - POI Bali Nusra', page: '1', entryId: 'entry.40843601' },
    'Jawa 1':     { gChoice: 'Ya - POI Jawa 1',     page: '2', entryId: 'entry.1683837469' },
    'Jawa 2':     { gChoice: 'Ya - POI Jawa 2',     page: '3', entryId: 'entry.900320597' },
    'Kalimantan': { gChoice: 'Ya - POI Kalimantan', page: '4', entryId: 'entry.433344437' },
    'Sulawesi':   { gChoice: 'Ya - POI Sulawesi',   page: '5', entryId: 'entry.1594557959' },
    'Sumatera 1': { gChoice: 'Ya - POI Sumatera 1', page: '6', entryId: 'entry.1587907010' },
    'Sumatera 2': { gChoice: 'Ya - POI Sumatera 2', page: '7', entryId: 'entry.622549808' }
  };

  let gAsalPoi = 'Tidak';
  let pageHistoryVal = '0';
  let poiFieldId = null;

  if (data.asal_poi === 'Ya') {
    const selectedPulau = data.pulau_poi || (typeof getPulauForPoi === 'function' ? getPulauForPoi(data.poi_location) : 'Jawa 2');
    const pulauInfo = pulauMap[selectedPulau] || pulauMap['Jawa 2'];
    gAsalPoi = pulauInfo.gChoice;
    pageHistoryVal = '0,' + pulauInfo.page;
    poiFieldId = pulauInfo.entryId;
  }

  const fields = {
    'entry.646274200': data.nik_bp,
    'entry.1925141275': data.nama_bp,
    'entry.1189147992': data.point_branch,
    'entry.1053074341': data.nama_mitra,
    'entry.350147755': data.ktp_mitra || '',
    'entry.1111462575': data.hp_mitra,
    'entry.322942409': data.produk === 'Group Loan' ? 'Group Loan (GL)' : data.produk,
    'entry.509446125': gAsalPoi,
    'pageHistory': pageHistoryVal
  };
  
  if (data.asal_poi === 'Ya' && poiFieldId && data.poi_location) {
    fields[poiFieldId] = data.poi_location;
  }
  
  // Create input elements dynamically
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    tempForm.appendChild(input);
  }
  
  document.body.appendChild(tempForm);
  
  return new Promise((resolve) => {
    let completed = false;
    
    const finish = (status) => {
      if (completed) return;
      completed = true;
      iframe.removeEventListener('load', onLoadHandler);
      if (tempForm.parentNode) {
        document.body.removeChild(tempForm);
      }
      resolve({ success: status });
    };
    
    const onLoadHandler = () => {
      // Form redirect loaded successfully inside iframe
      finish(true);
    };
    
    iframe.addEventListener('load', onLoadHandler);
    
    try {
      tempForm.submit();
      // Set a robust timeout fallback of 1.5 seconds to proceed in case load event is restricted by CORS
      setTimeout(() => {
        finish(true);
      }, 1500);
    } catch (e) {
      console.error('Submit error:', e);
      finish(false);
    }
  });
}

async function fetchDynamicFormOptions() {
  const url = STATE.settings.webhookUrl || DEFAULT_WEBHOOK_URL;
  if (!url) return;
  
  try {
    const response = await fetch(url);
    if (response.ok) {
      const result = await response.json();
      
      // Update Point/Cabang options if available
      if (result.point_options && Array.isArray(result.point_options) && result.point_options.length > 0) {
        pointCombobox.updateOptions(result.point_options);
        console.log('Point/Cabang options loaded dynamically from GForm:', result.point_options.length);
      }
      
      // Update POI Location options if available from Google Sheets
      if (result.poi_options && Array.isArray(result.poi_options) && result.poi_options.length > 0) {
        const cleanPois = result.poi_options.filter(opt => opt && typeof opt === 'string' && !opt.trim().startsWith('#') && opt.trim() !== '');
        if (cleanPois.length > 0) {
          POI_OPTIONS.length = 0;
          POI_OPTIONS.push(...cleanPois);
          if (typeof updatePoiByPulau === 'function') {
            updatePoiByPulau(pulauCombobox ? pulauCombobox.selectedValue : '');
          }
          console.log('POI locations loaded dynamically from Sheet list POI:', cleanPois.length);
        }
      }
    }
  } catch (e) {
    console.warn('Dynamic options fetch failed, using cached list:', e);
  }
}

async function sendWebhook(data) {
  if (STATE.settings && STATE.settings.webhookEnabled === false) {
    return { success: true, reason: 'Webhook disabled' };
  }

  const url = STATE.settings.webhookUrl || DEFAULT_WEBHOOK_URL;
  if (!url) {
    return { success: false, reason: 'Missing Webhook URL' };
  }
  
  try {
    // Send using text/plain to avoid CORS preflight OPTIONS request on Google Apps Script Web App
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok || response.status === 200 || response.type === 'opaque') {
      return { success: true };
    } else {
      return { success: false, reason: `HTTP error: ${response.status}` };
    }
  } catch (error) {
    // Fallback attempt with mode: 'no-cors'
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(data),
        mode: 'no-cors'
      });
      return { success: true };
    } catch (fallbackErr) {
      console.error('Webhook fetch error:', error);
      return { success: false, reason: error.message };
    }
  }
}

function generateCSV(data) {
  const headers = ['Timestamp', 'NIK BP', 'Nama BP', 'Point Branch', 'Nama Mitra', 'KTP Mitra', 'HP Mitra', 'Produk', 'Mitra Dari POI', 'Lokasi POI'];
  const row = [
    new Date().toLocaleString('id-ID'),
    data.nik_bp,
    data.nama_bp,
    data.point_branch,
    data.nama_mitra,
    data.ktp_mitra || '-',
    data.hp_mitra,
    data.produk,
    data.asal_poi,
    data.poi_location || '-'
  ];
  
  // Escape quotes and wrap with double quotes
  const escapedRow = row.map(val => `"${val.replace(/"/g, '""')}"`);
  
  return [headers.join(','), escapedRow.join(',')].join('\n');
}

function triggerDownload(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
}

// ==========================================================================
// THEME MANAGER (DARK / LIGHT)
// ==========================================================================
function initTheme() {
  const savedTheme = localStorage.getItem('app_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
  
  DOM.themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('app_theme', newTheme);
    updateThemeIcon(newTheme);
  });
}

function updateThemeIcon(theme) {
  if (theme === 'dark') {
    DOM.themeIcon.setAttribute('data-lucide', 'sun');
    DOM.themeIcon.style.color = '#FFB800';
  } else {
    DOM.themeIcon.setAttribute('data-lucide', 'moon');
    DOM.themeIcon.style.color = '';
  }
  lucide.createIcons();
}

// ==========================================================================
// SETTINGS / WEBHOOK MODAL MANAGER
// ==========================================================================
function initSettings() {
  // Load saved settings
  const savedSettings = localStorage.getItem(STATE.settingsKey);
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings);
      STATE.settings = {
        webhookEnabled: true,
        webhookUrl: DEFAULT_WEBHOOK_URL
      };
      localStorage.setItem(STATE.settingsKey, JSON.stringify(STATE.settings));
    } catch (e) {
      console.error('Error parsing settings:', e);
    }
  }
  
  // Apply saved values to input elements
  DOM.webhookEnabled.checked = STATE.settings.webhookEnabled;
  DOM.webhookUrl.value = STATE.settings.webhookUrl;
  toggleWebhookUrlInput(STATE.settings.webhookEnabled);
  
  // Events
  DOM.settingsToggle.addEventListener('click', () => {
    DOM.settingsModal.style.display = 'flex';
  });
  
  const closeModal = () => {
    DOM.settingsModal.style.display = 'none';
    DOM.testWebhookStatus.textContent = '';
    DOM.testWebhookStatus.className = 'test-status';
  };
  
  DOM.settingsClose.addEventListener('click', closeModal);
  DOM.settingsModal.addEventListener('click', (e) => {
    if (e.target === DOM.settingsModal) closeModal();
  });
  
  DOM.webhookEnabled.addEventListener('change', (e) => {
    toggleWebhookUrlInput(e.target.checked);
  });
  
  DOM.settingsSave.addEventListener('click', () => {
    STATE.settings.webhookEnabled = DOM.webhookEnabled.checked;
    STATE.settings.webhookUrl = DOM.webhookUrl.value.trim();
    
    localStorage.setItem(STATE.settingsKey, JSON.stringify(STATE.settings));
    closeModal();
  });
  
  DOM.testWebhookBtn.addEventListener('click', async () => {
    const url = DOM.webhookUrl.value.trim();
    if (!url) {
      updateTestStatus('Masukkan URL terlebih dahulu!', 'error');
      return;
    }
    
    updateTestStatus('Menguji...', 'testing');
    
    try {
      // Test using a GET request (which Google Apps Script supports with CORS headers for JSON content)
      const response = await fetch(url);
      
      if (response.ok || response.status === 200) {
        const result = await response.json();
        if (result.poi_options || result.point_options) {
          updateTestStatus('Koneksi Sukses!', 'success');
        } else {
          updateTestStatus('Koneksi Sukses!', 'success');
        }
      } else {
        updateTestStatus(`Gagal (${response.status})`, 'error');
      }
    } catch (e) {
      updateTestStatus(`Error: ${e.message}`, 'error');
    }
  });
}

function toggleWebhookUrlInput(isEnabled) {
  DOM.webhookUrlGroup.style.display = isEnabled ? 'block' : 'none';
}

function updateTestStatus(text, className) {
  DOM.testWebhookStatus.textContent = text;
  DOM.testWebhookStatus.className = `test-status ${className}`;
}

// ==========================================================================
// INITIALIZATION & EVENT REGISTERING
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Lucide icon replacement helper
  lucide.createIcons();
  
  // Theme Toggle initialization
  initTheme();
  
  // Webhook settings initialization
  initSettings();
  
  // Instantiate SearchableComboboxes
  if (document.getElementById('pulau-combobox')) {
    pulauCombobox = new SearchableCombobox('pulau-combobox', PULAU_OPTIONS, (selectedVal) => {
      saveDraft();
      updatePoiByPulau(selectedVal);
    });
  }
  pointCombobox = new SearchableCombobox('point-combobox', POINT_OPTIONS, () => saveDraft());
  poiLocationCombobox = new SearchableCombobox('poi-combobox', POI_OPTIONS, () => saveDraft());
  
  // Load local draft if available
  loadDraft();

  // Initial sync of POI location dropdown based on restored/selected pulau
  if (pulauCombobox && pulauCombobox.selectedValue) {
    updatePoiByPulau(pulauCombobox.selectedValue);
  }

  // Load dynamic form options (Point and POI) from the Google Sheets webhook URL (GET request)
  fetchDynamicFormOptions();
  
  // Restrict inputs to digits only (digits/numbers keypad enforcement)
  ['nik-bp', 'ktp-mitra'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
      });
    }
  });

  const hpEl = document.getElementById('hp-mitra');
  if (hpEl) {
    hpEl.addEventListener('input', (e) => {
      let val = e.target.value;
      if (val.startsWith('+')) {
        e.target.value = '+' + val.substring(1).replace(/\D/g, '');
      } else {
        e.target.value = val.replace(/\D/g, '');
      }
    });
  }


  // Handle manual steps navigations
  DOM.stepNodes.forEach(node => {
    node.addEventListener('click', () => {
      const targetStep = parseInt(node.dataset.step);
      // Allow moving backward directly, or forward only if previous step is valid
      if (targetStep < STATE.currentStep) {
        goToStep(targetStep);
      } else if (targetStep > STATE.currentStep && validateStep(STATE.currentStep)) {
        // Step validations sequentially
        let allValid = true;
        for (let s = STATE.currentStep; s < targetStep; s++) {
          if (!validateStep(s)) {
            allValid = false;
            goToStep(s);
            break;
          }
        }
        if (allValid) goToStep(targetStep);
      }
    });
  });
  
  // Button Event Listeners
  DOM.nextBtn.addEventListener('click', () => {
    if (validateStep(STATE.currentStep)) {
      goToStep(STATE.currentStep + 1);
    }
  });
  
  DOM.prevBtn.addEventListener('click', () => {
    goToStep(STATE.currentStep - 1);
  });
  
  // Radio button routing events
  DOM.poiYa.addEventListener('change', () => {
    updatePoiRouting('Ya');
    saveDraft();
  });
  
  DOM.poiTidak.addEventListener('change', () => {
    updatePoiRouting('Tidak');
    saveDraft();
  });
  
  // Auto-save draft on any input change inside form
  DOM.form.addEventListener('input', () => saveDraft());
  DOM.form.addEventListener('change', () => saveDraft());
  
  // Final submission action
  DOM.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateStep(STATE.currentStep)) return;
    
    // Collect Data
    const formData = new FormData(DOM.form);
    const data = {};
    for (const [key, val] of formData.entries()) {
      data[key] = val.trim();
    }
    
    // Explicitly add missing optionals if not routed
    if (data.asal_poi === 'Tidak') {
      data.poi_location = '-';
    }
    
    STATE.submittedData = data;
    
    // Show loading spinner/animations
    DOM.submitBtn.disabled = true;
    DOM.submitBtn.innerHTML = 'Mengirim... <i data-lucide="loader" class="animate-spin"></i>';
    lucide.createIcons();
    
    // Submit to Google Form Response Endpoint
    const gFormResult = await submitToGoogleForm(data);
    
    // Send to custom Webhook if enabled
    const hookResult = await sendWebhook(data);
    
    // Reset submit button state
    DOM.submitBtn.disabled = false;
    DOM.submitBtn.innerHTML = 'Kirim Form <i data-lucide="send"></i>';
    lucide.createIcons();
    
    // Render Summary Content in Success Card
    DOM.summaryContent.innerHTML = `
      <div class="summary-label">Nama Calon Mitra:</div>
      <div class="summary-value">${data.nama_mitra}</div>
      <div class="summary-label">No. HP:</div>
      <div class="summary-value">${data.hp_mitra}</div>
      <div class="summary-label">Produk Pilihan:</div>
      <div class="summary-value">${data.produk}</div>
      <div class="summary-label">Point / Cabang:</div>
      <div class="summary-value">${data.point_branch}</div>
      <div class="summary-label">Asal POI:</div>
      <div class="summary-value">${data.asal_poi}</div>
      ${data.asal_poi === 'Ya' ? `
        ${data.pulau_poi ? `<div class="summary-label">Pulau POI:</div><div class="summary-value">${data.pulau_poi}</div>` : ''}
        <div class="summary-label">Lokasi POI:</div>
        <div class="summary-value">${data.poi_location}</div>
      ` : ''}
      <div class="summary-label">Status Pengiriman:</div>
      <div class="summary-value">
        ${gFormResult.success 
          ? '<span style="color:var(--success);">Terkirim</span>' 
          : '<span style="color:var(--danger);">Gagal</span>'}
      </div>
    `;
    
    // Transition UI Cards
    DOM.formCard.style.display = 'none';
    DOM.successCard.style.display = 'block';
    
    // Scroll to success screen
    DOM.successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Delete partial form draft entries, preserve BP details
    const draftStr = localStorage.getItem(STATE.draftKey);
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        const savedDraft = {
          nik_bp: draft.nik_bp,
          nama_bp: draft.nama_bp,
          point_branch: draft.point_branch,
          point_branch_search: draft.point_branch_search
        };
        localStorage.setItem(STATE.draftKey, JSON.stringify(savedDraft));
      } catch (e) {}
    }
  });
  
  // Restart / Submit another form
  DOM.restartBtn.addEventListener('click', () => {
    resetEntireForm();
  });
  
  // CSV Export Action
  DOM.exportCsvBtn.addEventListener('click', () => {
    if (!STATE.submittedData) return;
    const csvContent = generateCSV(STATE.submittedData);
    const fileName = `mitra_baru_${STATE.submittedData.nama_mitra.replace(/\s+/g, '_').toLowerCase()}.csv`;
    triggerDownload(csvContent, fileName, 'text/csv;charset=utf-8;');
  });
  
  // JSON Export Action
  DOM.exportJsonBtn.addEventListener('click', () => {
    if (!STATE.submittedData) return;
    const jsonContent = JSON.stringify(STATE.submittedData, null, 2);
    const fileName = `mitra_baru_${STATE.submittedData.nama_mitra.replace(/\s+/g, '_').toLowerCase()}.json`;
    triggerDownload(jsonContent, fileName, 'application/json;charset=utf-8;');
  });
});
