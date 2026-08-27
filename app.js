// ===================== HAYAT DEFTERİ - APP.JS =====================

const STORAGE_KEYS = {
  entries: 'hd_entries',
  pin: 'hd_pin',
  customQuotes: 'hd_custom_quotes',
};

// ---------- GÜNÜN SORUSU (her gün değişir, tarihe göre sabit) ----------
const DAILY_QUESTIONS = [
  "Bugün seni gülümseten neydi?",
  "Bugün kendine karşı nazik miydin?",
  "Şu an içinde en çok hangi duygu ağır basıyor?",
  "Bugün minnettar olduğun küçük bir şey var mı?",
  "Bugün bir şeyden kaçtın mı, yoksa yüzleştin mi?",
  "Bugün kendine ne söylemen gerekiyordu?",
  "Yarın kendine bırakmak istediğin bir not var mı?",
  "Bugün seni yoran neydi, seni besleyen neydi?",
  "Şu an vücudun nasıl hissediyor?",
  "Bugün kimin için minnettarsın?",
  "Bugün hangi anı tekrar yaşamak isterdin?",
  "Kendine bugün bir söz verdin mi?",
  "Bugün neyi bırakmak istiyorsun?",
  "İçindeki çocuğa bugün ne söylerdin?",
  "Bugün cesaret gösterdiğin bir an oldu mu?",
  "Şu an en çok neye ihtiyacın var?",
  "Bugün seni şaşırtan bir şey oldu mu?",
  "Kendine bugün nasıl bir arkadaş oldun?",
  "Bugünden yarına taşımak istediğin ne var?",
  "Şu an kalbinde ne var?",
];

function getDailyQuestion() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = new Date() - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return DAILY_QUESTIONS[dayOfYear % DAILY_QUESTIONS.length];
}

// ---------- MANİFESTO SÖZLERİ (ruh haline göre + genel havuz) ----------
const QUOTES = {
  mutlu: [
    "Bu sevinci kaydettin, artık o senin bir parçan.",
    "Gülüşünün izini bıraktın bugün buraya. Güzel iş.",
    "Mutluluk anları biriktirmeye devam et, bu bir hazine.",
  ],
  huzurlu: [
    "Sakinlik de bir başarıdır. Bugün onu yakaladın.",
    "İçindeki dinginliği fark ettin. Bu az şey değil.",
    "Huzur, gürültüsüz bir zaferdir. Bugünkü zaferin kutlu olsun.",
  ],
  yorgun: [
    "Yorgunluğun da bir emeğin izidir. Kendine iyi bak.",
    "Bugün dinlenmeyi hak ettin. Yarın yine buradayız.",
    "Bitkinlik geçicidir, çabaların kalıcı. Şimdi biraz nefes al.",
  ],
  uzgun: [
    "Bugünü yazdın, bu bile cesaret ister. Yalnız değilsin.",
    "Üzüntü de geçer, ama onu görmezden gelmedin. Bu güçlü bir şey.",
    "Zor günler de defterine yazılmayı hak eder. Sen değerlisin.",
  ],
  kararsiz: [
    "Kararsızlık bir duraktır, son durak değil. Zamanla netleşecek.",
    "Bugün net olmasan da, yazdığın her satır bir adım.",
    "Belirsizlikte bile ilerliyorsun, bunu unutma.",
  ],
  kizgin: [
    "Öfkeni buraya bıraktın, üzerinde taşımana gerek yok artık.",
    "Kızgınlık da bir haber taşır; onu duyduğun için teşekkürler.",
    "Bugün zorlandın ama yazmayı bıraktın. Bu, kendine saygıdır.",
  ],
  umutlu: [
    "Umut ektin bugün, filizlenmesini izleyeceksin.",
    "Küçük bir umut, büyük bir yarının tohumu olabilir.",
    "İçindeki o yeşil ışığı koru, sana yol gösterecek.",
  ],
  genel: [
    "Bugünü yazdın, yarına bir sayfa daha açtın.",
    "Her satır, kendine tuttuğun bir aynadır.",
    "Yazdığın her söz, geleceğe bıraktığın bir iz.",
    "Bugün de kendinle buluştun. Bu küçük bir ritüel, büyük bir anlam taşıyor.",
    "Defterin sessizce dinledi, sen de kendini duydun.",
    "Bir gün daha kayıt altına alındı. Hikayen büyümeye devam ediyor.",
    "Kelimelerin bugün bir yuva buldu.",
    "Bu sayfa kapandı, ama hikayenin devamı var.",
    "Kendine ayırdığın bu birkaç dakika, aslında kendine bir hediyeydi.",
    "Yazmak, kendini hatırlamanın en sessiz yoludur.",
  ],
};

function loadCustomQuotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.customQuotes);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCustomQuotes(list) {
  localStorage.setItem(STORAGE_KEYS.customQuotes, JSON.stringify(list));
}

function pickQuote(mood) {
  const defaultPool = (mood && QUOTES[mood]) ? QUOTES[mood].concat(QUOTES.genel) : QUOTES.genel;
  const custom = loadCustomQuotes();
  // kendi sözlerin varsa havuza karışır; eklemediysen sadece bizim sözlerimiz kullanılır
  const pool = custom.length > 0 ? defaultPool.concat(custom) : defaultPool;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ---------- STATE ----------
let entries = [];
let selectedMood = null;

// ---------- YARDIMCI FONKSİYONLAR ----------
function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.entries);
    entries = raw ? JSON.parse(raw) : [];
  } catch (e) {
    entries = [];
  }
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(entries));
}

function formatDateLong(d) {
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
}

function formatDateShort(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function calcStreak() {
  if (entries.length === 0) return 0;
  const days = new Set(entries.map(e => e.date.slice(0, 10)));
  let streak = 0;
  let cursor = new Date();
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// ---------- KİLİT EKRANI ----------
function initLock() {
  const savedPin = localStorage.getItem(STORAGE_KEYS.pin);
  if (!savedPin) {
    showApp();
    return;
  }
  document.getElementById('lockScreen').classList.remove('hidden');
  document.getElementById('pinSubmit').addEventListener('click', tryUnlock);
  document.getElementById('pinInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') tryUnlock();
  });
}

function tryUnlock() {
  const savedPin = localStorage.getItem(STORAGE_KEYS.pin);
  const input = document.getElementById('pinInput').value;
  if (input === savedPin) {
    document.getElementById('lockScreen').classList.add('hidden');
    showApp();
  } else {
    document.getElementById('pinError').classList.remove('hidden');
    document.getElementById('pinInput').value = '';
  }
}

function showApp() {
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('todayDate').textContent = formatDateLong(new Date());
  renderStreak();
  renderHistory();
  renderStats();
  renderPinSetup();
  renderCustomQuotes();
  document.getElementById('dailyQuestion').textContent = getDailyQuestion();
}

// ---------- SEKMELER ----------
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });
}

// ---------- RUH HALİ SEÇİMİ ----------
function initMoodPicker() {
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedMood = btn.dataset.mood;
    });
  });
}

// ---------- GÜNLÜK KAYDETME ----------
function initSave() {
  document.getElementById('saveEntryBtn').addEventListener('click', () => {
    const textEl = document.getElementById('entryText');
    const goalEl = document.getElementById('goalInput');
    const text = textEl.value.trim();

    if (!text) {
      textEl.focus();
      textEl.style.borderColor = '#E17D61';
      setTimeout(() => { textEl.style.borderColor = ''; }, 800);
      return;
    }

    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mood: selectedMood,
      text: text,
      goal: goalEl.value.trim(),
    };

    entries.unshift(entry);
    saveEntries();

    // formu temizle
    textEl.value = '';
    goalEl.value = '';
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    selectedMood = null;

    renderStreak();
    renderHistory();
    renderStats();
    showManifesto(entry.mood);
  });
}

// ---------- MANİFESTO KARTI ----------
function showManifesto(mood) {
  const quote = pickQuote(mood);
  document.getElementById('manifestoQuote').textContent = quote;
  document.getElementById('manifestoOverlay').classList.remove('hidden');
}

function initManifestoClose() {
  document.getElementById('manifestoClose').addEventListener('click', () => {
    document.getElementById('manifestoOverlay').classList.add('hidden');
  });
}

// ---------- STREAK GÖRÜNÜMÜ ----------
function renderStreak() {
  document.getElementById('streakCount').textContent = calcStreak();
}

// ---------- GEÇMİŞ LİSTESİ ----------
const MOOD_EMOJI = {
  mutlu: '😊', huzurlu: '😌', yorgun: '😴', uzgun: '😔',
  kararsiz: '😐', kizgin: '😤', umutlu: '🌱',
};

function renderHistory(filter = '') {
  const list = document.getElementById('historyList');
  const empty = document.getElementById('emptyHistory');
  list.innerHTML = '';

  const filtered = entries.filter(e =>
    e.text.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  filtered.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="history-item-top">
        <span class="history-date">${formatDateShort(entry.date)}</span>
        <span class="history-mood">${MOOD_EMOJI[entry.mood] || '📝'}</span>
      </div>
      ${entry.goal ? `<div class="history-goal">🎯 ${escapeHtml(entry.goal)}</div>` : ''}
      <p class="history-text">${escapeHtml(entry.text)}</p>
      <div class="history-actions">
        <button class="delete-btn" data-id="${entry.id}">Sil</button>
      </div>
    `;
    list.appendChild(item);
  });

  list.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      entries = entries.filter(e => e.id !== btn.dataset.id);
      saveEntries();
      renderHistory(document.getElementById('searchInput').value);
      renderStreak();
      renderStats();
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function initSearch() {
  document.getElementById('searchInput').addEventListener('input', (e) => {
    renderHistory(e.target.value);
  });
}

// ---------- İSTATİSTİKLER ----------
function renderStats() {
  const grid = document.getElementById('statsGrid');
  const total = entries.length;
  const streak = calcStreak();
  const moodCounts = {};
  entries.forEach(e => { moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1; });
  let topMood = '-';
  let topCount = 0;
  Object.keys(moodCounts).forEach(m => {
    if (moodCounts[m] > topCount) { topCount = moodCounts[m]; topMood = MOOD_EMOJI[m] || m; }
  });

  grid.innerHTML = `
    <div class="stat-box"><div class="stat-num">${total}</div><div class="stat-label">Toplam Sayfa</div></div>
    <div class="stat-box"><div class="stat-num">${streak}</div><div class="stat-label">Güncel Seri</div></div>
    <div class="stat-box"><div class="stat-num">${topMood}</div><div class="stat-label">Sık Ruh Hali</div></div>
    <div class="stat-box"><div class="stat-num">${entries.filter(e => e.goal).length}</div><div class="stat-label">Belirlenen Hedef</div></div>
  `;
}

// ---------- PIN AYARLARI ----------
function renderPinSetup() {
  const area = document.getElementById('pinSetupArea');
  const savedPin = localStorage.getItem(STORAGE_KEYS.pin);

  if (savedPin) {
    area.innerHTML = `
      <button id="removePinBtn" class="btn-secondary btn-full">PIN Korumasını Kaldır</button>
    `;
    document.getElementById('removePinBtn').addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEYS.pin);
      renderPinSetup();
    });
  } else {
    area.innerHTML = `
      <input type="password" id="newPinInput" inputmode="numeric" maxlength="6" placeholder="4-6 haneli PIN belirle">
      <button id="setPinBtn" class="btn-primary btn-full">PIN Belirle</button>
    `;
    document.getElementById('setPinBtn').addEventListener('click', () => {
      const val = document.getElementById('newPinInput').value.trim();
      if (val.length >= 4) {
        localStorage.setItem(STORAGE_KEYS.pin, val);
        renderPinSetup();
      }
    });
  }
}

// ---------- KENDİ MOTİVE EDİCİ SÖZLERİN ----------
function renderCustomQuotes() {
  const list = document.getElementById('customQuoteList');
  const quotes = loadCustomQuotes();

  if (quotes.length === 0) {
    list.innerHTML = `<p class="custom-quote-empty">Henüz kendi sözünü eklemedin. Bizim sözlerimiz kullanılıyor.</p>`;
    return;
  }

  list.innerHTML = quotes.map((q, i) => `
    <div class="custom-quote-item">
      <p>"${escapeHtml(q)}"</p>
      <button class="remove-quote-btn" data-index="${i}">Sil</button>
    </div>
  `).join('');

  list.querySelectorAll('.remove-quote-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      const updated = loadCustomQuotes();
      updated.splice(idx, 1);
      saveCustomQuotes(updated);
      renderCustomQuotes();
    });
  });
}

function initCustomQuotes() {
  document.getElementById('addQuoteBtn').addEventListener('click', () => {
    const input = document.getElementById('newQuoteInput');
    const val = input.value.trim();
    if (!val) return;
    const quotes = loadCustomQuotes();
    quotes.push(val);
    saveCustomQuotes(quotes);
    input.value = '';
    renderCustomQuotes();
  });
  document.getElementById('newQuoteInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('addQuoteBtn').click();
  });
}

// ---------- DIŞA AKTARMA ----------
function initExport() {
  document.getElementById('exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hayat-defteri-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

// ---------- BAŞLAT ----------
document.addEventListener('DOMContentLoaded', () => {
  loadEntries();
  initLock();
  initTabs();
  initMoodPicker();
  initSave();
  initManifestoClose();
  initSearch();
  initExport();
  initCustomQuotes();

  if (!localStorage.getItem(STORAGE_KEYS.pin)) {
    // kilit yoksa direkt açılacak zaten initLock içinde
  }
});

// ---------- SERVICE WORKER ----------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
