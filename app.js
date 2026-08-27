const STORAGE_KEYS = {
  wishes: 'dk_wishes',
  pin: 'dk_pin',
  settings: 'dk_settings',
  customQuotes: 'dk_custom_quotes',
  firstVisit: 'dk_first_visit'
};

const QUOTES = [
  "İçindeki ışık, dışarıdaki karanlıktan daha güçlüdür.",
  "Bugün attığın her adım, yarının haritasını çizer.",
  "Dilekler sessizce filizlenir, sabırla büyürsün.",
  "Kendine inanmak, en büyük sihirdir.",
  "Her yeni gün, yeni bir dilek hakkıdır.",
  "İçindeki çocuk hâlâ yıldızları sayıyor, onu dinle.",
  "Sen yeter ki dile, evren nasıl olacağını bilir.",
  "Küçük bir umut, büyük bir değişimin tohumudur.",
  "Bugün kendine bir söz ver: Asla vazgeçmeyeceksin.",
  "Dileklerin kadar güçlüsün, unutma.",
  "Yıldızlar karanlıkta parlar, sen de öylesin.",
  "Her zorluğun ardından, daha güçlü bir sen vardır.",
  "Kendini sevmek, en güzel dileğindir.",
  "Bugün seni gülümseten bir an yarat.",
  "İçindeki sessiz sesi duy, o senin gerçek pusulandır.",
  "Dileklerin sınırsızdır, sınırı sen koyarsın.",
  "Yarın için endişelenme, bugün için şükret.",
  "Kendine karşı nazik ol, en değerli hazin sensin.",
  "Her nefes yeni bir başlangıçtır.",
  "Dilek tutmak cesaret ister, sen cesursun.",
  "Parlamak zorunda değilsin, sadece ışık ol yeter.",
  "Bugün kendine: 'Yeterince iyiyim' de.",
  "Küçük adımlar, devasa yolculuklara çıkar.",
  "İçindeki umut, dışarıdaki fırtınadan büyüktür.",
  "Sen bir kavanoz değilsin, bir galaksisin.",
];

const CATEGORY_LABELS = {
  love: '💕 Aşk',
  money: '💰 Para',
  health: '🏥 Sağlık',
  career: '🚀 Kariyer',
  family: '👨‍👩‍👧 Aile',
  growth: '🌟 Gelişim',
  surprise: '🎁 Sürpriz'
};

let wishes = [];
let selectedCategory = null;
let currentVideoBase64 = null;

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.wishes);
    wishes = raw ? JSON.parse(raw) : [];
  } catch (e) { wishes = []; }
}

function saveData() {
  localStorage.setItem(STORAGE_KEYS.wishes, JSON.stringify(wishes));
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    return raw ? JSON.parse(raw) : { darkMode: true, notifications: false };
  } catch (e) { return { darkMode: true, notifications: false }; }
}

function saveSettings(s) {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(s));
}

function loadCustomQuotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.customQuotes);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function saveCustomQuotes(list) {
  localStorage.setItem(STORAGE_KEYS.customQuotes, JSON.stringify(list));
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function calcStreak() {
  if (wishes.length === 0) return 0;
  const days = new Set(wishes.map(w => w.date.slice(0, 10)));
  let streak = 0;
  let cursor = new Date();
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }
  return streak;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function initWelcome() {
  const visited = localStorage.getItem(STORAGE_KEYS.firstVisit);
  if (visited) {
    checkLock();
    return;
  }
  document.getElementById('startBtn').addEventListener('click', () => {
    localStorage.setItem(STORAGE_KEYS.firstVisit, 'true');
    checkLock();
  });
}

function checkLock() {
  const savedPin = localStorage.getItem(STORAGE_KEYS.pin);
  if (savedPin) {
    showScreen('lockScreen');
    initLock();
  } else {
    showApp();
  }
}

function initLock() {
  const input = document.getElementById('pinInput');
  const btn = document.getElementById('pinSubmit');
  btn.addEventListener('click', tryUnlock);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') tryUnlock();
  });
  input.focus();
}

function tryUnlock() {
  const savedPin = localStorage.getItem(STORAGE_KEYS.pin);
  const input = document.getElementById('pinInput').value;
  if (input === savedPin) {
    showApp();
  } else {
    document.getElementById('pinError').classList.remove('hidden');
    document.getElementById('pinInput').value = '';
    document.getElementById('pinInput').focus();
  }
}

function showApp() {
  showScreen('app');
  renderStats();
  renderWishes();
  initMenu();
  initWishModal();
  initMotivationModal();
  initVideoLightbox();
  initLuckyStar();
  initSettings();
  initNotifications();
  if (Math.random() > 0.7 && wishes.length > 0) {
    showLuckyStar();
  }
}

function renderStats() {
  document.getElementById('statTotal').textContent = wishes.length;
  document.getElementById('statDone').textContent = wishes.filter(w => w.completed).length;
  document.getElementById('statStreak').textContent = calcStreak();
}

function renderWishes(filter = 'all') {
  const list = document.getElementById('wishList');
  const empty = document.getElementById('emptyWishes');
  list.innerHTML = '';
  let filtered = wishes;
  if (filter !== 'all') {
    filtered = wishes.filter(w => w.category === filter);
  }
  filtered = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (filtered.length === 0) {
    empty.classList.remove('hidden');
    list.classList.add('hidden');
    return;
  }
  empty.classList.add('hidden');
  list.classList.remove('hidden');
  filtered.forEach(wish => {
    const card = document.createElement('div');
    card.className = 'wish-card' + (wish.completed ? ' completed' : '');
    const catLabel = CATEGORY_LABELS[wish.category] || '📝 Diğer';
    const catClass = 'cat-' + (wish.category || 'surprise');
    let videoHtml = '';
    if (wish.video) {
      videoHtml = `<span class="video-badge" data-id="${wish.id}">🎥 Videoyu İzle</span>`;
    }
    card.innerHTML = `
      <div class="wish-card-header">
        <span class="wish-category ${catClass}">${catLabel}</span>
        <span class="wish-date">${formatDate(wish.date)}</span>
      </div>
      <p class="wish-text">${escapeHtml(wish.text)}</p>
      <div class="wish-actions">
        ${videoHtml}
        <button class="btn-done" data-id="${wish.id}">${wish.completed ? '⭐ Gerçekleşti' : '✨ Gerçekleşti'}</button>
        <button class="btn-delete" data-id="${wish.id}">🗑️ Sil</button>
      </div>
    `;
    list.appendChild(card);
  });
  list.querySelectorAll('.btn-done').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const wish = wishes.find(w => w.id === id);
      if (wish) {
        wish.completed = !wish.completed;
        if (wish.completed) {
          wish.completedDate = new Date().toISOString();
          showCelebration();
        } else {
          wish.completedDate = null;
        }
        saveData();
        renderWishes(document.getElementById('categoryFilter').value);
        renderStats();
      }
    });
  });
  list.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Bu dileği kavanozundan çıkarıyorsun. Emin misin?')) {
        wishes = wishes.filter(w => w.id !== btn.dataset.id);
        saveData();
        renderWishes(document.getElementById('categoryFilter').value);
        renderStats();
      }
    });
  });
  list.querySelectorAll('.video-badge').forEach(btn => {
    btn.addEventListener('click', () => {
      const wish = wishes.find(w => w.id === btn.dataset.id);
      if (wish && wish.video) {
        openVideoLightbox(wish.video);
      }
    });
  });
}

function initCategoryFilter() {
  document.getElementById('categoryFilter').addEventListener('change', (e) => {
    renderWishes(e.target.value);
  });
}

function initWishModal() {
  const modal = document.getElementById('wishModal');
  const btn = document.getElementById('wishBtn');
  const close = document.getElementById('closeWishModal');
  const save = document.getElementById('saveWishBtn');
  const overlay = modal.querySelector('.modal-overlay');
  btn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    selectedCategory = null;
    currentVideoBase64 = null;
    document.getElementById('wishText').value = '';
    document.getElementById('wishVideo').value = '';
    document.getElementById('videoPreview').classList.add('hidden');
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('selected'));
  });
  close.addEventListener('click', () => modal.classList.add('hidden'));
  overlay.addEventListener('click', () => modal.classList.add('hidden'));
  document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      selectedCategory = pill.dataset.cat;
    });
  });
  document.getElementById('wishVideo').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Video 5MB'dan küçük olmalı. Daha küçük bir video seç.");
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      currentVideoBase64 = ev.target.result;
      const preview = document.getElementById('videoPreview');
      preview.innerHTML = `<video src="${currentVideoBase64}" controls></video>`;
      preview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });
  save.addEventListener('click', () => {
    const text = document.getElementById('wishText').value.trim();
    if (!text) {
      document.getElementById('wishText').focus();
      document.getElementById('wishText').style.borderColor = '#ef4444';
      setTimeout(() => document.getElementById('wishText').style.borderColor = '', 800);
      return;
    }
    if (!selectedCategory) selectedCategory = 'surprise';
    const wish = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      text: text,
      category: selectedCategory,
      video: currentVideoBase64,
      completed: false,
      completedDate: null
    };
    wishes.unshift(wish);
    saveData();
    modal.classList.add('hidden');
    renderWishes(document.getElementById('categoryFilter').value);
    renderStats();
    showMiniCelebration();
  });
}

function initMotivationModal() {
  const modal = document.getElementById('motivationModal');
  const btn = document.getElementById('motivationBtn');
  const close = document.getElementById('closeMotivationModal');
  const overlay = modal.querySelector('.modal-overlay');
  const newQuote = document.getElementById('newQuoteBtn');
  const speak = document.getElementById('speakQuoteBtn');
  btn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    showRandomQuote();
  });
  close.addEventListener('click', () => modal.classList.add('hidden'));
  overlay.addEventListener('click', () => modal.classList.add('hidden'));
  newQuote.addEventListener('click', showRandomQuote);
  speak.addEventListener('click', () => {
    const text = document.getElementById('motivationQuote').textContent;
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'tr-TR';
      utter.rate = 0.9;
      window.speechSynthesis.speak(utter);
    } else {
      alert('Tarayıcın sesli okumayı desteklemiyor.');
    }
  });
}

function showRandomQuote() {
  const custom = loadCustomQuotes();
  const pool = custom.length > 0 ? QUOTES.concat(custom) : QUOTES;
  const quote = pool[Math.floor(Math.random() * pool.length)];
  document.getElementById('motivationQuote').textContent = quote;
}

function initVideoLightbox() {
  const lightbox = document.getElementById('videoLightbox');
  document.getElementById('closeLightbox').addEventListener('click', () => {
    lightbox.classList.add('hidden');
    document.getElementById('lightboxVideo').pause();
  });
  lightbox.querySelector('.lightbox-overlay').addEventListener('click', () => {
    lightbox.classList.add('hidden');
    document.getElementById('lightboxVideo').pause();
  });
}

function openVideoLightbox(base64) {
  const lightbox = document.getElementById('videoLightbox');
  const video = document.getElementById('lightboxVideo');
  video.src = base64;
  lightbox.classList.remove('hidden');
  video.play();
}

function initLuckyStar() {
  document.getElementById('luckyStarBtn').addEventListener('click', showLuckyStar);
  document.getElementById('luckyClose').addEventListener('click', () => {
    document.getElementById('luckyStarCard').classList.add('hidden');
  });
}

function showLuckyStar() {
  if (wishes.length === 0) return;
  const wish = wishes[Math.floor(Math.random() * wishes.length)];
  const card = document.getElementById('luckyStarCard');
  document.getElementById('luckyText').textContent = wish.text;
  card.classList.remove('hidden');
}

function showCelebration() {
  const overlay = document.getElementById('celebrationOverlay');
  overlay.classList.remove('hidden');
  setTimeout(() => overlay.classList.add('hidden'), 2500);
}

function showMiniCelebration() {
  const btn = document.getElementById('wishBtn');
  btn.style.transform = 'scale(1.05)';
  btn.style.boxShadow = '0 0 30px rgba(255,215,0,0.5)';
  setTimeout(() => {
    btn.style.transform = '';
    btn.style.boxShadow = '';
  }, 600);
}

function initMenu() {
  document.getElementById('menuBtn').addEventListener('click', () => {
    document.getElementById('settingsMenu').classList.remove('hidden');
  });
}

function initSettings() {
  const menu = document.getElementById('settingsMenu');
  const overlay = document.getElementById('settingsOverlay');
  const close = document.getElementById('closeSettings');
  close.addEventListener('click', () => menu.classList.add('hidden'));
  overlay.addEventListener('click', () => menu.classList.add('hidden'));
  const settings = loadSettings();
  document.getElementById('darkToggle').checked = settings.darkMode;
  document.getElementById('darkToggle').addEventListener('change', (e) => {
    settings.darkMode = e.target.checked;
    saveSettings(settings);
  });
  document.getElementById('notifToggle').checked = settings.notifications;
  document.getElementById('notifToggle').addEventListener('change', (e) => {
    settings.notifications = e.target.checked;
    saveSettings(settings);
    if (settings.notifications) {
      requestNotificationPermission();
    }
  });
  renderPinSetup();
  renderCustomQuotes();
  document.getElementById('addQuoteBtn').addEventListener('click', addCustomQuote);
  document.getElementById('newQuoteInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addCustomQuote();
  });
  document.getElementById('exportBtn').addEventListener('click', exportData);
  document.getElementById('clearBtn').addEventListener('click', () => {
    if (confirm('TÜM dileklerini silmek üzeresin. Bu geri alınamaz! Emin misin?')) {
      wishes = [];
      saveData();
      renderWishes();
      renderStats();
      menu.classList.add('hidden');
    }
  });
}

function renderPinSetup() {
  const area = document.getElementById('pinSetupArea');
  const savedPin = localStorage.getItem(STORAGE_KEYS.pin);
  if (savedPin) {
    area.innerHTML = `
      <button id="removePinBtn" class="btn-secondary btn-full" style="margin-top:0.5rem">🔓 PIN Korumasını Kaldır</button>
    `;
    document.getElementById('removePinBtn').addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEYS.pin);
      renderPinSetup();
    });
  } else {
    area.innerHTML = `
      <input type="password" id="newPinInput" inputmode="numeric" maxlength="6" placeholder="4-6 haneli PIN">
      <button id="setPinBtn" class="btn-magic btn-full" style="margin-top:0.5rem">🔐 PIN Belirle</button>
    `;
    document.getElementById('setPinBtn').addEventListener('click', () => {
      const val = document.getElementById('newPinInput').value.trim();
      if (val.length >= 4) {
        localStorage.setItem(STORAGE_KEYS.pin, val);
        renderPinSetup();
      } else {
        alert('PIN en az 4 haneli olmalı.');
      }
    });
  }
}

function renderCustomQuotes() {
  const list = document.getElementById('customQuoteList');
  const quotes = loadCustomQuotes();
  if (quotes.length === 0) {
    list.innerHTML = `<p style="color:var(--text-secondary);font-size:0.85rem">Henüz kendi sözünü eklemedin.</p>`;
    return;
  }
  list.innerHTML = quotes.map((q, i) => `
    <div class="quote-item">
      <span>"${escapeHtml(q)}"</span>
      <button data-index="${i}">Sil</button>
    </div>
  `).join('');
  list.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      const updated = loadCustomQuotes();
      updated.splice(idx, 1);
      saveCustomQuotes(updated);
      renderCustomQuotes();
    });
  });
}

function addCustomQuote() {
  const input = document.getElementById('newQuoteInput');
  const val = input.value.trim();
  if (!val) return;
  const quotes = loadCustomQuotes();
  quotes.push(val);
  saveCustomQuotes(quotes);
  input.value = '';
  renderCustomQuotes();
}

function exportData() {
  const data = {
    wishes: wishes,
    exportedAt: new Date().toISOString(),
    app: 'Dilek Kavanozu'
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dilek-kavanozu-${todayKey()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function initNotifications() {
  const settings = loadSettings();
  if (settings.notifications) {
    requestNotificationPermission();
  }
  setInterval(checkDailyReminder, 60000);
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function checkDailyReminder() {
  const settings = loadSettings();
  if (!settings.notifications) return;
  const now = new Date();
  if (now.getHours() === 21 && now.getMinutes() === 0) {
    const todayWishes = wishes.filter(w => w.date.startsWith(todayKey()));
    if (todayWishes.length === 0) {
      sendNotification('Dilek Kavanozu', 'Bugün henüz bir dilek tutmadın. Yıldızlar seni bekliyor ✨');
    }
  }
}

function sendNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: 'icon-192.png',
      badge: 'icon-192.png'
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  initWelcome();
  initCategoryFilter();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

