// PWA INSTALL — SODDA VERSIYA
// ============================================================
let _pwaPrompt = null;
let _pwaInstalled = false; // RAM da saqlash — localStorage ishonchsiz

// ═══════════════════════════════════════════════════════════
// YORDAMCHI: iOS / Android / Desktop aniqlash
// ═══════════════════════════════════════════════════════════
function _isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}
function _isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true
      || document.referrer.includes('android-app://');
}
function _isInstalled() {
  return _pwaInstalled || _isStandalone();
}

// ═══════════════════════════════════════════════════════════
// SW XABARLARI (yangilash + reload)
// ═══════════════════════════════════════════════════════════
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    if (!event.data) return;
    if (event.data.type === 'UPDATE_AVAILABLE') {
      _showUpdateBanner(event.data.version);
    }
    if (event.data.type === 'RELOAD') {
      window.location.reload(true);
    }
    if (event.data.type === 'CACHE_CLEARED') {
      toast('✅ Kesh tozalandi!');
    }
  });
}

// ═══════════════════════════════════════════════════════════
// YANGILASH BANNERI (limit tejovchi — faqat foydalanuvchi "Ha" desa reload)
// ═══════════════════════════════════════════════════════════
function _showUpdateBanner(version) {
  // Agar ilgari ko'rsatilgan bo'lsa, takrorlamaymiz
  if (document.getElementById('pwa-update-bar')) return;
  const bar = document.createElement('div');
  bar.id = 'pwa-update-bar';
  bar.style.cssText = [
    'position:fixed;bottom:70px;left:12px;right:12px;z-index:8000',
    'background:linear-gradient(135deg,#1E40AF,#6D28D9)',
    'color:#fff;border-radius:14px;padding:13px 16px',
    'display:flex;align-items:center;gap:12px',
    'box-shadow:0 8px 32px rgba(0,0,0,.35)',
    'animation:slideUp .3s ease'
  ].join(';');
  bar.innerHTML =
    '<div style="flex:1;min-width:0">'
    + '<div style="font-weight:700;font-size:.88rem">🚀 Yangi versiya tayyor!</div>'
    + '<div style="font-size:.75rem;opacity:.8;margin-top:2px">Yangilashni xohlaysizmi?</div>'
    + '</div>'
    + '<button onclick="_doReload()" style="background:rgba(255,255,255,.2);border:1.5px solid rgba(255,255,255,.4);color:#fff;border-radius:9px;padding:8px 14px;font-size:.82rem;font-weight:700;cursor:pointer;flex-shrink:0">✅ Ha</button>'
    + '<button onclick="this.closest(\'#pwa-update-bar\').remove()" style="background:none;border:none;color:rgba(255,255,255,.6);font-size:1.1rem;cursor:pointer;padding:4px;flex-shrink:0">✕</button>';
  document.body.appendChild(bar);
}
window._doReload = function() {
  // localStorage eski ma'lumotlarni tozalaymiz - yangi deploy dan fresh data kelsin
  try { localStorage.removeItem('jm_data'); } catch(e) {}
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'FORCE_UPDATE' });
  }
  setTimeout(() => window.location.reload(true), 800);
};

// ═══════════════════════════════════════════════════════════
// PWA O'RNATISH UI — barcha holatlar uchun
// ═══════════════════════════════════════════════════════════
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _pwaPrompt = e;
  _pwaInstalled = false;
  if (!_isStandalone()) {
    _showInstallUI();
    _showPersistentBanner();
  }
});

window.addEventListener('appinstalled', () => {
  _pwaPrompt = null;
  _pwaInstalled = true;
  _hideInstallUI();
  toast('✅ Ilova muvaffaqiyatli o\'rnatildi!');
});

// Ilovani o'chirsa va qayta kirsa — beforeinstallprompt qayta keladi
// Shuning uchun localStorage da saqlamaymiz, har sessiyada tekshiramiz
window.addEventListener('load', () => {
  // Standalone bo'lmasa va iOS bo'lsa — qo'lda o'rnatish ko'rsatish
  if (!_isStandalone() && _isIOS()) {
    setTimeout(() => {
      if (!_isInstalled()) _showIosGuide();
    }, 2000);
  }
});

// ═══════════════════════════════════════════════════════════
// DOIMIY BANNER — o'rnatilguncha yopilmaydi
// ═══════════════════════════════════════════════════════════
function _showPersistentBanner() {
  if (_isInstalled()) return;
  // Login sahifasidagi Install bannerini ko'rsatamiz
  var lb = document.getElementById('login-install-banner');
  if (lb) lb.style.display = 'flex';
  // Admin va parent bannerlari
  var pb = document.getElementById('pwa-banner');
  if (pb) pb.classList.add('show');
  var bar = document.getElementById('parent-install-bar');
  if (bar) bar.classList.add('show');
}

function _showInstallUI() {
  if (_isInstalled()) return;
  ['admin-install-btn','parent-install-hdr-btn'].forEach(id => {
    var el = document.getElementById(id);
    if (el) { el.style.display = ''; el.textContent = '📲 O\'rnatish'; }
  });
  _showPersistentBanner();
  // Modal — har kirganida ko'rsatilsin (sessionStorage yo'q!)
  setTimeout(() => {
    if (!_isInstalled()) {
      var m = document.getElementById('pwa-modal');
      if (m) m.classList.add('open');
    }
  }, 1200);
}

function _hideInstallUI() {
  ['admin-install-btn','parent-install-hdr-btn'].forEach(id => {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  ['pwa-banner','parent-install-bar'].forEach(id => {
    var el = document.getElementById(id);
    if (el) el.classList.remove('show');
  });
  var lb = document.getElementById('login-install-banner');
  if (lb) lb.style.display = 'none';
  var m = document.getElementById('pwa-modal');
  if (m) m.classList.remove('open');
}

// ═══════════════════════════════════════════════════════════
// O'RNATISH: asosiy funksiya
// ═══════════════════════════════════════════════════════════
function _doInstall() {
  if (_pwaPrompt) {
    _pwaPrompt.prompt();
    _pwaPrompt.userChoice.then(choice => {
      if (choice.outcome === 'accepted') {
        _pwaPrompt = null;
        _pwaInstalled = true;
        _hideInstallUI();
      }
    });
  } else if (_isIOS()) {
    _showIosGuide();
  } else {
    // Android/Desktop — qo'lda qo'shish ko'rsatmasi
    var m = document.getElementById('pwa-manual-modal');
    if (m) m.style.display = 'flex';
  }
}

// iOS uchun qo'llanma modal
function _showIosGuide() {
  var steps = document.getElementById('pwa-manual-steps');
  if (steps) {
    steps.innerHTML =
      '<b style="color:#F59E0B">📱 iPhone / iPad (Safari):</b><br>'
      + '1. Pastdagi <b style="font-size:1.2em">⎙</b> (Ulashish) tugmasini bosing<br>'
      + '2. <b>"Bosh ekranga qo\'shish"</b> ni tanlang<br>'
      + '3. <b>"Qo\'shish"</b> ni bosing ✅<br><br>'
      + '<b style="color:#3B82F6">🤖 Android (Chrome):</b><br>'
      + '1. O\'ng yuqoridagi <b>⋮</b> menyuni oching<br>'
      + '2. <b>"Bosh ekranga qo\'shish"</b> ni tanlang ✅<br><br>'
      + '<b style="color:#8B5CF6">💻 Desktop (Chrome/Edge):</b><br>'
      + '1. Manzil satrining o\'ng tomonidagi <b>⊕</b> belgini bosing ✅';
  }
  var m = document.getElementById('pwa-manual-modal');
  if (m) m.style.display = 'flex';
}

// Barcha tugmalar ushbu funksiyani chaqiradi
window.pwaInstallClick   = _doInstall;
window.pwaTriggerInstall = _doInstall;

window.pwaDismissModal = function() {
  var m = document.getElementById('pwa-modal');
  if (m) m.classList.remove('open');
};
window.pwaDismiss = function() {
  // Banner yopilmaydi — o'rnatilguncha ko'rinib turadi
  // (faqat dismiss bosilsa vaqtincha yashiramiz)
  var b = document.getElementById('pwa-banner');
  if (b) b.classList.remove('show');
};
window.pwaDismissBar = function() {
  var b = document.getElementById('parent-install-bar');
  if (b) b.classList.remove('show');
};
window._showIosGuide = _showIosGuide;

// ═══════════════════════════════════════════════════════════
// ADMIN: kesh tozalash (tejamkor — barcha fayllarni yuklamaydi)
// ═══════════════════════════════════════════════════════════
window.forceCacheClear = async function() {
  if (!confirm('Kesh va mahalliy ma\'lumotlar tozalanadi. Davom etasizmi?')) return;
  toast('🔄 Tozalanmoqda...');
  try { localStorage.removeItem('jm_data'); } catch(e) {}
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
  }
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
  }
  toast('✅ Tozalandi! Sahifa yangilanmoqda...');
  setTimeout(() => window.location.reload(true), 1500);
};

// ═══════════════════════════════════════════════════════════
// SERVICE WORKER RO'YXATDAN O'TKAZISH
// ═══════════════════════════════════════════════════════════
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
      .then(reg => {
        // SW yangilanishini tekshirish
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Yangi versiya bor, lekin sahifani avtomatik reload qilmaymiz
                _showUpdateBanner('yangi');
              }
            });
          }
        });
        // Har 30 daqiqada yangilanishni tekshir
        setInterval(() => reg.update(), 6 * 60 * 60 * 1000); // 6 soatda bir tekshiradi
      })
      .catch(err => console.warn('SW error:', err));
  });
}


// ============================================================
// SAMARA (PERFORMANCE)
// ============================================================