'use strict';
// ============================================================
// STATE
// ============================================================
let CU = null; // current user: {role:'admin'} | {role:'parent',sid,gid,name}
let DATA = { groups:{}, videos:{}, settings:{} };
let _adminPage = 'home';
let _parentPage = 'home';
let _samaraPeriod = 7;
let _charts = {};
let _fbListener = null;

// ============================================================
// UTILS
// ============================================================
function today() { return new Date().toISOString().split('T')[0]; }
function nowTs() { return Date.now(); }
function genId() { return '_' + Math.random().toString(36).slice(2,10) + Date.now().toString(36); }

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('uz-UZ', { day:'2-digit', month:'short' });
}

function scoreClass(s) {
  if (s >= 90) return 'score-s';
  if (s >= 70) return 'score-b';
  if (s >= 50) return 'score-o';
  return 'score-r';
}


// ── Foizga asoslangan rang (universal) ──────────────────────
function pctColor(pct) {
  if (pct >= 95) return '#059669';  // to'q yashil
  if (pct >= 85) return '#10B981';  // yashil
  if (pct >= 70) return '#3B82F6';  // ko'k
  if (pct >= 55) return '#F59E0B';  // sariq
  if (pct >= 35) return '#F97316';  // to'q sariq
  if (pct >= 15) return '#EF4444';  // qizil
  return '#DC2626';                  // to'q qizil
}
function pctColorAtt(present) {
  return present ? '#10B981' : '#EF4444';
}
function calcPercent(uv, mt, faol) {
  // UV + MT + FAOLLIK = 100% (davomat ball bermaydi)
  const uvMax   = (DATA.settings && DATA.settings.uvMax)   || 50;
  const mtMax   = (DATA.settings && DATA.settings.mtMax)   || 25;
  const faolMax = (DATA.settings && DATA.settings.faolMax) || 25;
  const total = uvMax + mtMax + faolMax;
  if (!total) return 0;
  const uvScore   = (Math.min(Math.max(uv||0,0),   uvMax)   / uvMax)   * 100 * (uvMax   / total);
  const mtScore   = (Math.min(Math.max(mt||0,0),   mtMax)   / mtMax)   * 100 * (mtMax   / total);
  const faolScore = (Math.min(Math.max(faol||0,0), faolMax) / faolMax) * 100 * (faolMax / total);
  return Math.round(uvScore + mtScore + faolScore);
}

function toast(msg, dur = 2000) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function destroyChart(key) {
  if (_charts[key]) { try { _charts[key].destroy(); } catch(e){} delete _charts[key]; }
}

// ============================================================
// FIREBASE OPERATIONS — fbReady ni kutadi (hech qachon crash bo'lmaydi)
// ============================================================
function _waitFb() {
  if (window._fbReady && window._fb) return Promise.resolve(window._fb);
  return new Promise(function(resolve) {
    window.addEventListener('fbReady', function() { resolve(window._fb); }, { once: true });
  });
}
function fbSet(path, data) {
  return _waitFb().then(function(fb) { return fb.set(fb.ref(fb.db, path), data); });
}
function fbUpdate(path, data) {
  return _waitFb().then(function(fb) { return fb.update(fb.ref(fb.db, path), data); });
}
function fbRemove(path) {
  return _waitFb().then(function(fb) { return fb.remove(fb.ref(fb.db, path)); });
}
function fbGet(path) {
  return _waitFb().then(function(fb) { return fb.get(fb.ref(fb.db, path)); });
}

// Local cache save/load
function saveLocal() {
  try { localStorage.setItem('jm_data', JSON.stringify(DATA)); } catch(e){}
}
function loadLocal() {
  try {
    const d = localStorage.getItem('jm_data');
    if (d) {
      const parsed = JSON.parse(d);
      DATA = Object.assign({ groups:{}, videos:{}, settings:{} }, parsed);
    }
  } catch(e){}
  if (!DATA.settings) DATA.settings = {};
  if (!DATA.groups) DATA.groups = {};
  if (!DATA.videos) DATA.videos = {};
  if (!DATA.notifications) DATA.notifications = {};
  if (!DATA.posts) DATA.posts = {};
  if (!DATA.apps) DATA.apps = {};
  if (!DATA.letters) DATA.letters = {};
  if (!DATA.curriculum) DATA.curriculum = {};
  if (!DATA.settings.adminPass) DATA.settings.adminPass = 'sara';
  if (!DATA.settings.siteName) DATA.settings.siteName = 'Jaloliddin Math';
  if (!DATA.settings.schedule) DATA.settings.schedule = '';
  if (!DATA.settings.uvMax) DATA.settings.uvMax = 50;
  if (!DATA.settings.mtMax) DATA.settings.mtMax = 25;
  if (!DATA.settings.faolMax) DATA.settings.faolMax = 25;
}

// ── Force-reload mexanizmi ─────────────────────────────────
// Admin "Yangilash" bosganida Firebase ga forceReloadTs yoziladi.
// Barcha ulangan qurilmalar (ota-ona, o'quvchi) shu o'zgarishni ko'rib avtomatik reload bo'ladi.
let _lastForceReloadTs = null;       // null = Firebase dan hali o'qilmagan
window._suppressForceReload = false; // Admin o'zi yozganida o'zini reload qilmasligi uchun

async function _forceClientReload() {
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
  } catch(e) {}
  window.location.reload(true);
}

// Setup Firebase real-time listener
function setupFirebaseListener() {
  const { onValue, ref, db } = window._fb;  // bu chaqirilganda _fb tayyor
  onValue(ref(db, '/'), snap => {
    if (snap.exists()) {
      const d = snap.val();

      // ── Force-reload tekshiruvi (eng birinchi) ──────────────
      const newForcTs = (d.settings && d.settings.forceReloadTs) || 0;
      if (_lastForceReloadTs === null) {
        // Birinchi ulanish — faqat qiymatni yodlaymiz, reload yo'q
        _lastForceReloadTs = newForcTs;
      } else if (newForcTs > _lastForceReloadTs) {
        _lastForceReloadTs = newForcTs;
        if (window._suppressForceReload) {
          // Bu admin tomonidan yozilgan edi — adminni reloadlamaymiz
          window._suppressForceReload = false;
        } else {
          // Boshqa foydalanuvchi — kesh tozalab reload
          _forceClientReload();
          return;
        }
      }
      // ────────────────────────────────────────────────────────

      DATA.groups = d.groups || {};
      DATA.videos = d.videos || {};
      DATA.notifications = d.notifications || {};
      DATA.posts = d.posts || {};
      DATA.apps = d.apps || {};
      DATA.curriculum = d.curriculum || {};
      DATA.letters = d.letters || {};
      DATA.settings = Object.assign({ adminPass:'sara', siteName:'Diver Education', schedule:'', uvMax:50, mtMax:25, faolMax:25 }, d.settings || {});
      saveLocal();
      applySettings();
      if (CU) refreshCurrentPage();
      // Letter status check
      if (window._onDataRefresh) window._onDataRefresh();
      // Guest app - doim refresh
      if (typeof renderGuestHomePosts === 'function') renderGuestHomePosts();
      if (document.getElementById('guest-app') &&
          document.getElementById('guest-app').style.display !== 'none') {
        if (typeof renderGuestRankPage === 'function') {
          renderGuestRankPage(_guestSamaraPeriod || 'today');
        }
      }
    }
  }, err => { console.warn('Firebase listen error:', err); });
}

// Push initial data if Firebase is empty
async function initFirebaseData() {
  try {
    const snap = await fbGet('/');
    if (!snap.exists()) {
      await fbSet('/', { groups: DATA.groups, videos: DATA.videos, settings: DATA.settings });
    } else {
      const d = snap.val();
      DATA.groups = d.groups || {};
      DATA.videos = d.videos || {};
      DATA.notifications = d.notifications || {};
      DATA.posts = d.posts || {};
      DATA.apps = d.apps || {};
      DATA.curriculum = d.curriculum || {};
      DATA.letters = d.letters || {};
      DATA.settings = Object.assign({ adminPass:'sara', siteName:'Diver Education', schedule:'', uvMax:50, mtMax:25, faolMax:25 }, d.settings || {});
      saveLocal();
    }
    setupFirebaseListener();
  } catch(e) {
    console.warn('Firebase init failed, using localStorage:', e);
    setupFirebaseListener();
  }
}
