// ============================================================
// PROFILE
// ============================================================
function renderProfile() {
  if (!CU || CU.role !== 'parent') return;
  const { sid, gid, name } = CU;
  // Clear password fields
  ['prof-old-pin','prof-new-pin','prof-confirm-pin'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  const errEl2 = document.getElementById('prof-pass-err');
  if (errEl2) errEl2.style.display = 'none';
  const group = (DATA.groups && DATA.groups[gid]) ? DATA.groups[gid] : null;
  const stu   = group ? (group.students && group.students[sid] ? group.students[sid] : null) : null;
  const nameEl = document.getElementById('prof-name');
  const grpEl  = document.getElementById('prof-group');
  if (nameEl) nameEl.textContent = name || '—';
  if (grpEl)  grpEl.textContent  = group ? group.name : '—';
  const pay = (stu && stu.payments) ? stu.payments : {};
  const payEl = document.getElementById('prof-payment');

  // ─── To'lov muddati hisoblash ───────────────────────────────
  let nextDueStr = '';
  let daysLeft = null;
  if (pay.dueDayOfMonth || pay.dueDate || pay.date) {
    let nextDue;
    if (pay.dueDayOfMonth) {
      // Takrorlanuvchi: har oy shu kunda
      nextDue = new Date(nextDueDateFromDay(pay.dueDayOfMonth) + 'T00:00:00');
    } else if (pay.dueDate) {
      nextDue = new Date(pay.dueDate);
    } else {
      const lastPaid = new Date(pay.date);
      nextDue = new Date(lastPaid);
      nextDue.setMonth(nextDue.getMonth() + 1);
    }
    const todayD = new Date();
    todayD.setHours(0, 0, 0, 0);
    nextDue.setHours(0, 0, 0, 0);
    daysLeft = Math.ceil((nextDue - todayD) / 86400000);
    nextDueStr = localIso(nextDue);
    const fmtNextDue = fmtDate(nextDueStr);

    // Ogohlantirish banneri
    const warnEl = document.getElementById('prof-pay-warning');
    if (warnEl) {
      if (daysLeft <= 3) {
        let icon = '⏰', msg = '';
        if (daysLeft < 0)       { icon = '🚨'; msg = `To'lov muddati ${Math.abs(daysLeft)} kun oldin o'tdi! Iltimos to'lov qiling.`; }
        else if (daysLeft === 0) { icon = '🔔'; msg = `Bugun to'lov kuni! (${fmtNextDue})`; }
        else                    { icon = '⏰'; msg = `To'lov sanasiga ${daysLeft} kun qoldi (${fmtNextDue})`; }
        warnEl.style.display = '';
        warnEl.innerHTML = `<div style="display:flex;align-items:center;gap:8px">${icon} <span>${msg}</span></div>`;
        // Browser notification (bir marta)
        _tryPaymentNotification(daysLeft, fmtNextDue, nextDueStr);
      } else {
        warnEl.style.display = 'none';
      }
    }
  }

  if (payEl) {
    const nextDueRow = nextDueStr ? `
    <div class="info-row">
      <span class="ir-label">Keyingi to'lov</span>
      <span class="ir-val" style="color:${daysLeft !== null && daysLeft <= 3 ? '#EF4444' : 'var(--text1)'};font-weight:${daysLeft !== null && daysLeft <= 3 ? '700' : '400'}">${fmtDate(nextDueStr)}</span>
    </div>` : '';
    payEl.innerHTML = `
    <div class="info-row">
      <span class="ir-label">Holat</span>
      <span class="pay-status ${pay.paid?'pay-paid':'pay-unpaid'}">${pay.paid?'✅ To\'langan':'❌ To\'lanmagan'}</span>
    </div>
    <div class="info-row">
      <span class="ir-label">Summa</span>
      <span class="ir-val">${pay.amount?(+pay.amount).toLocaleString()+' so\'m':'Belgilanmagan'}</span>
    </div>
    <div class="info-row">
      <span class="ir-label">To'langan sana</span>
      <span class="ir-val">${pay.date?fmtDate(pay.date):'—'}</span>
    </div>${nextDueRow}`;
  }
}

// ─── Browser push notification ──────────────────────────────
function _tryPaymentNotification(daysLeft, fmtDue, isoDate) {
  if (!('Notification' in window)) return;
  // Bugun allaqachon yuborilgan bo'lsa, qaytalamaymiz
  const key = 'payNotifSent_' + isoDate + '_' + new Date().toDateString();
  if (localStorage.getItem(key)) return;
  const body = daysLeft < 0
    ? `To'lov muddati ${Math.abs(daysLeft)} kun o'tdi!`
    : daysLeft === 0
    ? `Bugun to'lov kuni (${fmtDue})`
    : `${daysLeft} kun qoldi — ${fmtDue}`;
  function _send() {
    try {
      new Notification('💳 Jaloliddin Math — To\'lov eslatmasi', {
        body,
        icon: './assets/icons/icon.svg',
        badge: './assets/icons/icon.svg',
        tag: 'pay-reminder'
      });
      localStorage.setItem(key, '1');
    } catch(e) { /* silent */ }
  }
  if (Notification.permission === 'granted') {
    _send();
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(function(p) {
      if (p === 'granted') _send();
    });
  }
}
window.saveParentPassword = async function() {
  if (!CU || CU.role !== 'parent') return;
  const { sid, gid } = CU;
  const errEl = document.getElementById('prof-pass-err');
  const oldPin     = (document.getElementById('prof-old-pin')?.value || '').trim();
  const newPin     = (document.getElementById('prof-new-pin')?.value || '').trim();
  const confirmPin = (document.getElementById('prof-confirm-pin')?.value || '').trim();

  function showErr(msg) {
    if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
  }
  if (errEl) errEl.style.display = 'none';

  const stu = DATA.groups?.[gid]?.students?.[sid];
  if (!stu) { showErr('\u274c O\'quvchi topilmadi'); return; }
  if (!oldPin) { showErr('\u274c Hozirgi parolni kiriting'); return; }
  if (String(stu.pin) !== String(oldPin)) { showErr('\u274c Hozirgi parol noto\'g\'ri'); return; }
  if (!newPin) { showErr('\u274c Yangi parolni kiriting'); return; }
  if (newPin.length < 3) { showErr('\u274c Parol kamida 3 ta belgidan iborat bo\'lsin'); return; }
  if (newPin !== confirmPin) { showErr('\u274c Yangi parollar mos kelmadi'); return; }

  // Check uniqueness
  for (const [g2id, g] of Object.entries(DATA.groups || {})) {
    for (const [s2id, s] of Object.entries(g.students || {})) {
      if (String(s.pin) === String(newPin) && !(s2id === sid && g2id === gid)) {
        showErr('\u274c Bu parol allaqachon boshqa o\'quvchida mavjud'); return;
      }
    }
  }

  const changedAt = nowTs();
  const changedAtStr = new Date(changedAt).toLocaleString('uz-UZ');
  DATA.groups[gid].students[sid].pin = newPin;
  DATA.groups[gid].students[sid].pinChangedAt = changedAt;
  DATA.groups[gid].students[sid].pinChangedBy = 'parent';
  DATA.groups[gid].students[sid].pinChangedAtStr = changedAtStr;

  try {
    await fbUpdate('groups/' + gid + '/students/' + sid, {
      pin: newPin,
      pinChangedAt: changedAt,
      pinChangedBy: 'parent',
      pinChangedAtStr: changedAtStr
    });
  } catch(e) { saveLocal(); }

  ['prof-old-pin','prof-new-pin','prof-confirm-pin'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  toast('\u2705 Parol muvaffaqiyatli o\'zgartirildi');
};

// Clear password fields when profile page opens
const _origShowParentPage = showParentPage;


// ============================================================
// LABEL / COLOR / FONTSIZE SETTINGS  (xavfsiz, asosiy kodga tegmaydi)
// ============================================================
function _s(key, def) {
  return (DATA.settings && DATA.settings[key] != null && DATA.settings[key] !== '') ? DATA.settings[key] : def;
}

function applyLabels() {
  // ── 1. Update Edit panel spans from settings ──
  document.querySelectorAll('#sp-edit .editable[data-key]').forEach(el => {
    const key = el.dataset.key;
    const val = DATA.settings[key];
    if (!val) return;
    if (el.dataset.type === 'color') el.style.background = val;
    else el.textContent = val;
  });
  // Font size buttons in edit panel
  const fsz = _s('label_fontsize', 'md');
  document.querySelectorAll('.ep-fsz').forEach(b => b.classList.toggle('active', b.dataset.size === fsz));

  // ── 2. Apply to live DOM ──
  // Parent nav
  const pNav = { 'nav-p-samara':'lbl_nav_samara', 'nav-p-rank':'lbl_nav_rank', 'nav-p-apps':'lbl_nav_apps', 'nav-p-profile':'lbl_nav_profile' };
  Object.entries(pNav).forEach(([id, key]) => { const el=document.getElementById(id); if(el) el.textContent=_s(key, el.textContent); });
  // Guest nav
  const gNav = { 'gnav-home':'lbl_gnav_home', 'gnav-apps':'lbl_gnav_apps', 'gnav-rank':'lbl_gnav_rank', 'gnav-contact':'lbl_gnav_contact' };
  Object.entries(gNav).forEach(([id, key]) => { const el=document.getElementById(id); if(el) el.textContent=_s(key, el.textContent); });
  // Guest hero title
  const ght = document.getElementById('guest-hero-title');
  if (ght) ght.textContent = _s('lbl_guest_hero_title', ght.textContent);
  // Guest subtitle
  const gs = document.getElementById('txt-guest-subtitle');
  if (gs) gs.textContent = _s('lbl_subtitle', gs.textContent);
  // Guest platform tagmatni
  const gp = document.getElementById('txt-guest-platform');
  if (gp) gp.textContent = _s('lbl_platform', gp.textContent);
  // Profile version
  const pv = document.getElementById('txt-prof-version');
  if (pv) pv.textContent = _s('appVersion', 'v1.4');
  // Site name (header)
  const n = _s('siteName', 'Jaloliddin Math');
  ['admin-site-name','parent-site-name','guest-site-name'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = n;
  });
  document.title = n;
}

// getLbl / getClr — ishlatiladi renderSamara, renderCircularProgress ichida
window.getLbl = function(key, def) { return _s('lbl_' + key, def); };
window.getClr = function(key, def) { return _s('clr_' + key, def); };
window.getFsz = function() {
  const fsz = _s('label_fontsize', 'md');
  return fsz === 'sm' ? '.62rem' : fsz === 'lg' ? '.82rem' : '.72rem';
};

window.setFontSize = async function(size, btn) {
  DATA.settings.label_fontsize = size;
  document.documentElement.style.fontSize = size === 'sm' ? '13px' : size === 'lg' ? '17px' : '15px';
  ['sm','md','lg'].forEach(s => {
    const b = document.getElementById('fsz-' + s);
    if (b) b.className = 'btn btn-sm' + (s === size ? ' btn-primary' : '');
  });
  document.querySelectorAll('.ep-fsz').forEach(b => b.classList.toggle('active', b.dataset.size === size));
  saveLocal(); fbUpdate('settings', { label_fontsize: size }).catch(e => console.warn('fb:', e));
  toast('✅ Hajm saqlandi');
};

window.saveLabels = async function() {
  const g = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const updates = {
    lbl_uv:          g('sl-uv')          || 'Vazifa',
    lbl_mt:          g('sl-mt')          || 'Test',
    lbl_att:         g('sl-att')         || 'Faollik',
    lbl_nav_samara:  g('sl-nav-samara')  || 'Samara',
    lbl_nav_rank:    g('sl-nav-rank')    || 'Reyting',
    lbl_nav_apps:    g('sl-nav-apps')    || 'Dasturlar',
    lbl_nav_profile: g('sl-nav-profile') || 'Profil',
    lbl_hello:       g('sl-hello')       || 'Xush kelibsiz',
    lbl_subtitle:    g('sl-subtitle')    || "Professional matematika o'qituvchisi",
    clr_uv:          g('sc-uv')          || '#3B82F6',
    clr_mt:          g('sc-mt')          || '#8B5CF6',
    clr_att:         g('sc-att')         || '#10B981',
  };
  Object.assign(DATA.settings, updates);
  saveLocal(); fbUpdate('settings', updates).catch(e => console.warn('fb:', e));
  applyLabels();
  toast('✅ Sozlamalar saqlandi');
};


// ============================================================
// EDIT PAGE — inline click-to-edit
// ============================================================
let _epCurrentKey = null;

window.switchEditTab = function(tab, btn) {
  document.querySelectorAll('.edit-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.edit-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('ep-' + tab);
  if (panel) panel.classList.add('active');
  renderEditPanel();
};

function renderEditPanel() {
  // Fill all .editable values from DATA.settings
  document.querySelectorAll('#sp-edit .editable[data-key]').forEach(el => {
    const key = el.dataset.key;
    const type = el.dataset.type;
    const val = DATA.settings[key];
    if (!val) return;
    if (type === 'color') {
      el.style.background = val;
    } else {
      // strip emoji suffix added by CSS ::after
      el.textContent = val;
    }
  });
  // Font size buttons
  const fsz = (DATA.settings && DATA.settings.label_fontsize) || 'md';
  document.querySelectorAll('.ep-fsz').forEach(b => {
    b.classList.toggle('active', b.dataset.size === fsz);
  });
}

window.epSetFsz = async function(size, btn) {
  document.querySelectorAll('.ep-fsz').forEach(b => b.classList.toggle('active', b.dataset.size === size));
  DATA.settings.label_fontsize = size;
  // Site-wide font size
  document.documentElement.style.fontSize = size === 'sm' ? '13px' : size === 'lg' ? '17px' : '15px';
  // Settings page buttons sync
  ['sm','md','lg'].forEach(sz => {
    const b = document.getElementById('fsz-' + sz);
    if (b) b.className = 'btn btn-sm' + (sz === size ? ' btn-primary' : '');
  });
  saveLocal(); fbUpdate('settings', { label_fontsize: size }).catch(e => console.warn('fb:', e));
  if (typeof applyLabels === 'function') applyLabels();
  toast('✅ Hajm saqlandi');
};

// Attach click listeners when Edit page opens
function initEditListeners() {
  document.querySelectorAll('#sp-edit .editable').forEach(el => {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      const key = this.dataset.key;
      const type = this.dataset.type;
      if (type === 'color') {
        // Open native color picker
        const inp = document.createElement('input');
        inp.type = 'color';
        inp.value = DATA.settings[key] || '#3B82F6';
        inp.style.position = 'fixed'; inp.style.opacity = '0'; inp.style.top = '0';
        document.body.appendChild(inp);
        inp.click();
        inp.oninput = async () => {
          const newVal = inp.value;
          el.style.background = newVal;
          DATA.settings[key] = newVal;
          try { await fbUpdate('settings', { [key]: newVal }); } catch(ex) { saveLocal(); }
          if (typeof applyLabels === 'function') applyLabels();
        };
        inp.onchange = () => { document.body.removeChild(inp); toast('✅ Rang saqlandi'); };
        return;
      }
      // text edit — show popover
      _epCurrentKey = key;
      const pop = document.getElementById('ep-popover');
      const inp2 = document.getElementById('ep-pop-input');
      const lbl = document.getElementById('ep-pop-label');
      const rect = this.getBoundingClientRect();
      inp2.value = DATA.settings[key] || this.textContent.replace(' ✏️','').trim();
      lbl.textContent = '✏️ ' + (this.closest('.ep-row')?.querySelector('.ep-label')?.textContent || key);
      // position popover
      let top = rect.bottom + 6;
      if (top + 120 > window.innerHeight) top = rect.top - 130;
      pop.style.top = top + 'px';
      pop.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 295)) + 'px';
      pop.style.display = 'block';
      inp2.focus(); inp2.select();
    });
  });
  document.addEventListener('click', function(e) {
    const pop = document.getElementById('ep-popover');
    if (pop && pop.style.display !== 'none' && !pop.contains(e.target)) {
      epClosePopover();
    }
  });
}

window.epSavePopover = async function() {
  if (!_epCurrentKey) return;
  const val = document.getElementById('ep-pop-input').value.trim();
  if (!val) return;
  DATA.settings[_epCurrentKey] = val;
  // Update the visible span
  document.querySelectorAll('#sp-edit .editable[data-key="'+_epCurrentKey+'"]').forEach(el => {
    el.textContent = val;
  });
  saveLocal(); fbUpdate('settings', { [_epCurrentKey]: val }).catch(e => console.warn('fb:', e));
  if (typeof applyLabels === 'function') applyLabels();
  epClosePopover();
  toast('✅ Saqlandi');
};

window.epClosePopover = function() {
  document.getElementById('ep-popover').style.display = 'none';
  _epCurrentKey = null;
};

// Enter key in popover
document.addEventListener('keydown', function(e) {
  const pop = document.getElementById('ep-popover');
  if (pop && pop.style.display !== 'none' && e.key === 'Enter') epSavePopover();
  if (pop && pop.style.display !== 'none' && e.key === 'Escape') epClosePopover();
});

window.addEventListener('load', () => {
  loadLocal();

  // Set today date
  const gd = document.getElementById('grade-date');
  if (gd) gd.value = isoToDisplay(today());
  document.getElementById('admin-date-txt').textContent = 'Bugun: ' + fmtDate(today());

  applySettings();

  // Firebase ready
  const initFb = () => {
    initFirebaseData().catch(e => console.warn(e));
  };
  if (window._fbReady) initFb();
  else window.addEventListener('fbReady', initFb, { once: true });

  // Show login after 1.2s
  setTimeout(() => {
    const l = document.getElementById('loading');
    l.style.opacity = '0';
    setTimeout(() => {
      l.style.display = 'none';
      document.getElementById('login').style.display = 'flex';
      // Login sahifasida o'rnatish banneri — agar kerak bo'lsa
      if (!_isInstalled() && (_pwaPrompt || _isIOS())) {
        var lb = document.getElementById('login-install-banner');
        if (lb) lb.style.display = 'flex';
      }
    }, 400);
  }, 1200);
});

// Overlay click to close modal
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
});
