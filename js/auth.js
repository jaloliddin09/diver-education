// ============================================================
// LOGIN / LOGOUT — XAVFSIZLIK QATLAMI
// ============================================================
// Himoya choralari:
//   1. Input validation   — PIN va parol tekshiruvi
//   2. Input sanitization — XSS ga qarshi tozalash
//   3. Rate limiting      — tez-tez urinishni to'sish
//   4. Failed attempts    — 5 xato → 15 daqiqa bloklash
// ============================================================

let _loginTab = 'parent';
let _iconClickCount = 0;
let _iconClickTimer = null;

// ── XAVFSIZLIK KONSTANTLARI ──────────────────────────────────
const SEC = {
  MAX_ATTEMPTS : 5,     // Nechta xato → bloklash
  LOCK_MINUTES : 15,    // Bloklash davomiyligi (daqiqa)
  RATE_LIMIT_MS: 1500,  // Urinishlar orasidagi minimal vaqt (ms)
  PIN_MIN      : 4,     // PIN minimal uzunligi
  PIN_MAX      : 6,     // PIN maksimal uzunligi
  PASS_MAX     : 128,   // Parol maksimal uzunligi
};

// ── INPUT SANITIZATION ───────────────────────────────────────
// XSS ga qarshi: HTML teglarni bezarar holga keltiradi
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  const map = { '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;', '&':'&amp;' };
  return str.replace(/[<>'"&]/g, c => map[c]).trim().slice(0, 256);
}

// ── PIN VALIDATSIYA ──────────────────────────────────────────
function validatePin(pin) {
  const clean = String(pin).trim();
  if (!/^\d+$/.test(clean))
    return { ok:false, msg:'❌ PIN faqat raqamlardan iborat bo\'lishi kerak' };
  if (clean.length < SEC.PIN_MIN)
    return { ok:false, msg:`❌ PIN kamida ${SEC.PIN_MIN} ta raqam bo'lishi kerak` };
  if (clean.length > SEC.PIN_MAX)
    return { ok:false, msg:`❌ PIN ${SEC.PIN_MAX} ta raqamdan oshmasligi kerak` };
  return { ok:true, value:clean };
}

// ── PAROL VALIDATSIYA ────────────────────────────────────────
function validatePass(pass) {
  const clean = String(pass).trim();
  if (!clean)              return { ok:false, msg:'❌ Parolni kiriting' };
  if (clean.length > SEC.PASS_MAX) return { ok:false, msg:'❌ Parol juda uzun' };
  return { ok:true, value:clean };
}

// ── FAILED ATTEMPTS — localStorage ──────────────────────────
function getAttemptData(type) {
  try {
    const raw = localStorage.getItem('_sec_' + type);
    if (!raw) return { count:0, lockedUntil:0 };
    return JSON.parse(raw);
  } catch { return { count:0, lockedUntil:0 }; }
}
function saveAttemptData(type, data) {
  try { localStorage.setItem('_sec_' + type, JSON.stringify(data)); } catch {}
}
function resetAttempts(type) {
  try { localStorage.removeItem('_sec_' + type); } catch {}
}

// Bloklangan bo'lsa — xato matni qaytaradi, aks holda null
function checkLock(type) {
  const d = getAttemptData(type);
  if (d.lockedUntil && Date.now() < d.lockedUntil) {
    const minLeft = Math.ceil((d.lockedUntil - Date.now()) / 60000);
    return `🔒 Juda ko'p xato urinish. ${minLeft} daqiqadan keyin qayta urinib ko'ring`;
  }
  if (d.lockedUntil && Date.now() >= d.lockedUntil) resetAttempts(type);
  return null;
}

// Xato urinishni yozadi va mos xabar qaytaradi
function recordFailedAttempt(type) {
  const d = getAttemptData(type);
  d.count = (d.count || 0) + 1;
  if (d.count >= SEC.MAX_ATTEMPTS) {
    d.lockedUntil = Date.now() + SEC.LOCK_MINUTES * 60 * 1000;
    d.count = 0;
    saveAttemptData(type, d);
    return `🔒 ${SEC.MAX_ATTEMPTS} marta xato kiritdingiz. ${SEC.LOCK_MINUTES} daqiqa kuting`;
  }
  const left = SEC.MAX_ATTEMPTS - d.count;
  saveAttemptData(type, d);
  return `❌ Noto'g'ri. Yana ${left} ta urinish qoldi`;
}

// ── RATE LIMITING ────────────────────────────────────────────
// Har bir login urinishi orasida kamida 1.5 soniya bo'lishi kerak
let _lastLoginAttempt = 0;
function checkRateLimit() {
  const now = Date.now();
  if (now - _lastLoginAttempt < SEC.RATE_LIMIT_MS) return '⏳ Iltimos, biroz kuting...';
  _lastLoginAttempt = now;
  return null;
}

// ── ICON SECRET CLICK ────────────────────────────────────────
window.iconSecretClick = function() {
  _iconClickCount++;
  clearTimeout(_iconClickTimer);
  _iconClickTimer = setTimeout(() => { _iconClickCount = 0; }, 2500);
  if (_iconClickCount >= 5) {
    _iconClickCount = 0;
    switchTab('admin');
    document.getElementById('pass-inp').focus();
  }
};

window.closeAdminLogin = function() {
  switchTab(_loginTab === 'admin' ? 'parent' : _loginTab);
};

window.switchTab = function(tab) {
  _loginTab = tab;
  document.getElementById('parent-login-form').style.display = tab==='parent'?'block':'none';
  const gf = document.getElementById('guest-login-form');
  if (gf) gf.style.display = tab==='guest'?'block':'none';
  document.getElementById('admin-login-form').style.display = tab==='admin'?'block':'none';
  document.getElementById('login-err').style.display = 'none';
  const tp = document.getElementById('ltab-parent');
  const tg = document.getElementById('ltab-guest');
  if (tp) tp.classList.toggle('active', tab==='parent');
  if (tg) tg.classList.toggle('active', tab==='guest');
  const btn = document.getElementById('login-main-btn');
  if (btn) btn.textContent = tab==='guest' ? '👥 Mehmon sifatida kirish →' : 'Kirish →';
  const tabsRow = document.querySelector('.login-tabs');
  if (tabsRow) tabsRow.style.display = tab==='admin'?'none':'flex';
};

// ── ASOSIY LOGIN (himoyalangan) ──────────────────────────────
window.doLogin = function() {
  const btn   = document.getElementById('login-main-btn');
  const errEl = document.getElementById('login-err');

  if (btn && btn.disabled) return;
  if (btn) { btn.disabled = true; setTimeout(() => { btn.disabled = false; }, 2000); }
  errEl.style.display = 'none';

  // 1. Rate limit
  const rateErr = checkRateLimit();
  if (rateErr) {
    errEl.textContent = rateErr;
    errEl.style.display = 'block';
    if (btn) btn.disabled = false;
    return;
  }

  // 2. Mehmon kirish
  if (_loginTab === 'guest') { enterGuest(); return; }

  // 3. Admin kirish
  if (_loginTab === 'admin') {
    const lockErr = checkLock('admin');
    if (lockErr) { errEl.textContent = lockErr; errEl.style.display = 'block'; if (btn) btn.disabled = false; return; }

    const passCheck = validatePass(document.getElementById('pass-inp').value);
    if (!passCheck.ok) { errEl.textContent = passCheck.msg; errEl.style.display = 'block'; if (btn) btn.disabled = false; return; }

    if (passCheck.value !== DATA.settings.adminPass) {
      errEl.textContent = recordFailedAttempt('admin');
      errEl.style.display = 'block';
      if (btn) btn.disabled = false;
      return;
    }
    resetAttempts('admin');
    CU = { role:'admin' };
    enterAdmin();
    return;
  }

  // 4. Ota-ona PIN kirish
  const lockErr = checkLock('parent');
  if (lockErr) { errEl.textContent = lockErr; errEl.style.display = 'block'; if (btn) btn.disabled = false; return; }

  const pinCheck = validatePin(document.getElementById('pin-inp').value);
  if (!pinCheck.ok) { errEl.textContent = pinCheck.msg; errEl.style.display = 'block'; if (btn) btn.disabled = false; return; }

  let found = null;
  for (const [gid, group] of Object.entries(DATA.groups || {})) {
    for (const [sid, stu] of Object.entries(group.students || {})) {
      if (String(stu.pin) === pinCheck.value) {
        found = { sid, gid, name: sanitizeInput(stu.name || '') };
        break;
      }
    }
    if (found) break;
  }

  if (!found) {
    errEl.textContent = recordFailedAttempt('parent');
    errEl.style.display = 'block';
    if (btn) btn.disabled = false;
    return;
  }

  resetAttempts('parent');
  CU = { role:'parent', ...found };
  enterParent();
};

// ── ENTER ADMIN ──────────────────────────────────────────────
function enterAdmin() {
  document.getElementById('login').style.display = 'none';
  document.getElementById('admin-app').style.display = 'flex';
  document.getElementById('admin-app').querySelectorAll('.bottom-nav,.gnav-btn').forEach(n => n.style.visibility = '');
  if (_isStandalone()) { _hideInstallUI(); }
  else if (_pwaPrompt || (_isIOS && _isIOS() && !_isStandalone())) { _showInstallUI(); }
  showAdminPage('home', document.querySelector('#admin-app .nav-btn'));
  updateLettersBadge();
  populateGroupSelects();
}

// ── ENTER PARENT ─────────────────────────────────────────────
function enterParent() {
  document.getElementById('login').style.display = 'none';
  document.getElementById('parent-app').style.display = 'flex';
  document.getElementById('parent-app').querySelectorAll('.bottom-nav,.gnav-btn').forEach(n => n.style.visibility = '');
  const b = document.getElementById('parent-badge');
  if (b) b.textContent = '👨‍👩‍👧 ' + (CU.name || '').split(' ')[0];
  showParentPage('home', document.querySelector('#parent-app .nav-btn'));
  const { sid, gid } = CU;
  const ts = nowTs();
  if (DATA.groups?.[gid]?.students?.[sid]) {
    DATA.groups[gid].students[sid].lastLoginAt = ts;
    try { fbUpdate('groups/' + gid + '/students/' + sid, { lastLoginAt: ts }); } catch(e) {}
  }
  if (_isStandalone()) { _hideInstallUI(); }
  else if (_pwaPrompt || (_isIOS && _isIOS() && !_isStandalone())) { _showInstallUI(); }
}

// ── LOGOUT ───────────────────────────────────────────────────
window.logout = function() {
  CU = null;
  ['admin-app','parent-app','guest-app'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'none';
      el.querySelectorAll('.bottom-nav,.gnav-btn').forEach(n => n.style.visibility = 'hidden');
    }
  });
  document.getElementById('login').style.display = 'flex';
  switchTab('parent');
  if (!_isInstalled() && (_pwaPrompt || _isIOS())) {
    const lb = document.getElementById('login-install-banner');
    if (lb) lb.style.display = 'flex';
  }
  // Kiritilgan ma'lumotlarni tozalaymiz
  document.getElementById('pin-inp').value = '';
  document.getElementById('pass-inp').value = '';
};
