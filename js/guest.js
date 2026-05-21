// ============================================================
// GUEST VIEW
// ============================================================
let _guestPeriod = 'today';
let _guestRankPeriod = 'today';
let _guestSamaraPeriod = 'today';
window.enterGuest = function() {
  document.getElementById('login').style.display = 'none';
  const gApp = document.getElementById('guest-app');
  gApp.style.display = 'flex';
  gApp.querySelectorAll('.bottom-nav,.gnav-btn').forEach(n => n.style.visibility = '');
  const siteName = DATA.settings?.siteName || 'MY Math!';
  const el = document.getElementById('guest-site-name');
  if (el) el.textContent = siteName;
  initLetterStatusCheck();
  const d = new Date();
  const dateEl = document.getElementById('guest-date-txt');
  if (dateEl) dateEl.textContent = d.toLocaleDateString('uz-UZ', { weekday:'long', day:'numeric', month:'long' });
  // Bosh sahifani avtomatik ko'rsatish
  const homeBtn = document.querySelector('.gnav-btn[data-page="home"]') || document.querySelector('.gnav-btn');
  showGuestPage('home', homeBtn);
  checkGuestPostsDot();
};
window.showGuestPage = function(page, btn) {
  document.querySelectorAll('.guest-page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('gp-' + page);
  if (el) el.classList.add('active');
  document.querySelectorAll('.gnav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (page === 'apps') renderGuestApps();
  else if (page === 'rank') renderGuestRankPage(_guestRankPeriod);
  else if (page === 'samara') renderGuestRankPage(_guestSamaraPeriod || 'today');
  else if (page === 'home') renderGuestHomePosts();
};
window.setGuestRankPeriod = function(period, btn) {
  _guestRankPeriod = period;
  document.querySelectorAll('#gp-rank .gpt2').forEach(b => b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  renderGuestRankPage(period);
};

// Samara/Reyting sahifasidagi period boshqaruvchi
window.setGuestSamaraPeriod = function(period, btn) {
  _guestSamaraPeriod = period;
  document.querySelectorAll('#samara-period-btns .gpt2').forEach(b => b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  renderGuestRankPage(period);
};

function renderGuestRankPage(period) {
  const listEl = document.getElementById('guest-rank-list');
  if (!listEl) return;

  // Barcha guruhlardan barcha o'quvchilar — bitta umumiy reyting
  const all = [];
  Object.entries(DATA.groups || {}).forEach(([gid, g]) => {
    Object.entries(g.students || {}).forEach(([sid, s]) => {
      const avg = getAvg(sid, gid, period);
      if (avg !== null) all.push({ name: s.name, group: g.name, avg });
    });
  });
  all.sort((a, b) => b.avg - a.avg);

  if (!all.length) {
    const periodLabels = { today: 'bugun', week: 'bu hafta', month: 'bu oy', all: '' };
    const hint = period !== 'all' ? `<div style="font-size:.75rem;color:rgba(255,255,255,.4);margin-top:6px">Boshqa davrni tanlang</div>` : '';
    listEl.innerHTML = `<div style="text-align:center;padding:40px 20px">
      <div style="font-size:2.5rem;margin-bottom:10px">🏅</div>
      <div style="color:rgba(255,255,255,.6);font-size:.9rem;font-weight:600">
        ${period === 'all' ? 'Hali natija kiritilmagan' : `${periodLabels[period]||''} uchun natija yo'q`}
      </div>${hint}
    </div>`;
    return;
  }

  const totalCount = all.length;
  const top3 = all.slice(0, 3);
  const rest  = all.slice(3);

  // Podium order: 2nd(left), 1st(centre), 3rd(right)
  const podOrder = top3.length === 1 ? [null, top3[0], null]
                 : top3.length === 2 ? [top3[1], top3[0], null]
                 : [top3[1], top3[0], top3[2]];
  const podCls   = ['silver', 'gold', 'bronze'];
  const podMedal = ['🥈', '🥇', '🥉'];
  const podRank  = [2, 1, 3];

  function podAvatar(s, cls) {
    if (!s) return `<div class="top3-av ${cls}" style="opacity:0"></div>`;
    const initials = s.name.trim().split(/\s+/).map(w => w[0]).join('').slice(0,2).toUpperCase();
    return `<div class="top3-av ${cls}">${initials}</div>`;
  }

  const podHTML = `<div class="top3-row">
    ${podOrder.map((s, idx) => {
      if (!s) return `<div></div>`;
      const cls = podCls[idx];
      return `<div class="top3-pod ${cls}" style="${cls==='gold'?'padding-bottom:18px':''}">
        <div class="top3-medal">${podMedal[idx]}</div>
        ${podAvatar(s, cls)}
        <div class="top3-name">${s.name}</div>
        <div style="font-size:.62rem;color:rgba(255,255,255,.4);margin-bottom:4px;font-weight:600">${s.group}</div>
        <div class="top3-score ${scoreClass(s.avg)}">${s.avg}%</div>
      </div>`;
    }).join('')}
  </div>`;

  const restHTML = rest.length ? `
    <div style="font-size:.72rem;color:rgba(255,255,255,.35);font-weight:700;
      display:grid;grid-template-columns:36px 1fr auto;gap:8px;
      padding:0 6px 8px;border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:6px">
      <span style="text-align:center">#</span>
      <span>O'QUVCHI</span>
      <span>BALL</span>
    </div>
    ${rest.map((s, i) => {
      const rank = i + 4;
      return `<div style="display:grid;grid-template-columns:36px 1fr auto;align-items:center;
        gap:10px;padding:9px 10px;margin-bottom:4px;
        background:transparent;border:1px solid rgba(255,255,255,.06);border-radius:11px">
        <div style="width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.08);
          display:flex;align-items:center;justify-content:center;
          font-size:.8rem;font-weight:800;color:#fff;flex-shrink:0">${rank}</div>
        <div style="min-width:0">
          <div style="font-size:.85rem;font-weight:600;color:#fff;
            white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.name}</div>
          <div style="font-size:.68rem;color:rgba(255,255,255,.45);margin-top:1px;font-weight:600">${s.group}</div>
        </div>
        <span class="score-badge ${scoreClass(s.avg)}" style="font-size:.8rem;padding:5px 9px;flex-shrink:0">${s.avg}%</span>
      </div>`;
    }).join('')}` : '';

  listEl.innerHTML = podHTML + restHTML +
    `<div style="text-align:center;font-size:.72rem;color:rgba(255,255,255,.25);margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,.06)">
      Jami ${totalCount} ta o'quvchi
    </div>`;
}
window.setGuestPeriod = function(period, btn) {
  _guestPeriod = period;
  document.querySelectorAll('#gp-home .gpt2').forEach(b => b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  renderGuestView(period);
};
function makeRingSVG(pct, color, size, fontSize) {
  const r = 38; const cx = 50; const cy = 50;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(pct,100) / 100);
  const sz = size || 72;
  const fs = fontSize || '.7rem';
  return `<svg class="ring-svg${sz>72?' lg':''}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle class="ring-bg" cx="${cx}" cy="${cy}" r="${r}"/>
    <circle class="ring-fill" cx="${cx}" cy="${cy}" r="${r}"
      stroke="${color}" stroke-dasharray="${circ}" stroke-dashoffset="${offset}"/>
    <text x="50" y="50" class="ring-pct" style="font-size:${fs}">${pct}%</text>
  </svg>`;
}
function renderGuestView(period) {
  const colors = { gold:'#F59E0B', silver:'#94A3B8', bronze:'#CD7F32' };
  const podCls = ['gold','silver','bronze'];
  const medals = ['🥇','🥈','🥉'];
  const all = [];
  Object.entries(DATA.groups || {}).forEach(([gid, g]) => {
    Object.entries(g.students || {}).forEach(([sid, s]) => {
      const avg = getAvg(sid, gid, period);
      if (avg !== null) all.push({ name: s.name, group: g.name, avg, sid, gid });
    });
  });
  all.sort((a,b) => b.avg - a.avg);

  const top3El = document.getElementById('guest-top3');
  const restEl = document.getElementById('guest-rest');

  if (!all.length) {
    top3El.innerHTML = `<div class="guest-empty"><div class="ei">🏅</div><p>Hali natija yo'q</p></div>`;
    restEl.innerHTML = '';
  } else {
    // ── TOP 3 PODIUM ─────────────────────────────────────
    const top3 = all.slice(0, 3);
    // Podium display order: 2nd(left), 1st(centre), 3rd(right)
    let podOrder;
    if (top3.length === 1) podOrder = [null, top3[0], null];
    else if (top3.length === 2) podOrder = [top3[1], top3[0], null];
    else podOrder = [top3[1], top3[0], top3[2]];
    const podRanks = [1, 0, 2];

    top3El.innerHTML = `<div class="g-section-title">🏆 Top o'rinchilar</div>
      <div class="ring-grid">${podOrder.map((s, colIdx) => {
        if (!s) return '<div></div>';
        const rank = podRanks[colIdx];
        const cls  = podCls[rank] || '';
        const color = colors[cls] || '#3B82F6';
        const isMain = rank === 0;
        return `<div class="ring-card ${cls}">
          <div class="ring-medal">${medals[rank] || ''}</div>
          ${makeRingSVG(s.avg, color, isMain ? 84 : 72, isMain ? '.72rem' : '.65rem')}
          <div class="ring-name">${s.name}</div>
          <div class="ring-group">${s.group}</div>
        </div>`;
      }).join('')}</div>`;

    // ── 4-O'RINDAN PASTKILAR (takrorlanmaydi!) ────────────
    const rest = all.slice(3);
    if (rest.length) {
      restEl.innerHTML = rest.map((s, i) => {
        const rank = i + 4;
        return `<div class="g-rank-item">
          <div class="g-rank-num ro">${rank}</div>
          <div class="g-rank-info"><div class="gn">${s.name}</div><div class="gg">${s.group}</div></div>
          <span class="score-badge ${scoreClass(s.avg)}">${s.avg}%</span>
        </div>`;
      }).join('');
    } else {
      restEl.innerHTML = '';
    }
  }

  // ── BUGUNGI MINI-RINGLAR ──────────────────────────────
  const dailyEl = document.getElementById('guest-daily');
  if (!dailyEl) return;
  const todayStudents = [];
  Object.entries(DATA.groups || {}).forEach(([gid, g]) => {
    Object.entries(g.students || {}).forEach(([sid, s]) => {
      const r = s.records?.[today()];
      if (r) todayStudents.push({ name: s.name, group: g.name, pct: r.percent || 0 });
    });
  });
  todayStudents.sort((a,b) => b.pct - a.pct);
  if (!todayStudents.length) {
    dailyEl.innerHTML = `<div class="guest-empty" style="padding:20px"><div class="ei">📭</div><p>Bugun hali natija kiritilmagan</p></div>`;
  } else {
    dailyEl.innerHTML = `<div class="day-grid">${todayStudents.map(s => {
      const c = s.pct>=70?'#10B981':s.pct>=50?'#F59E0B':'#EF4444';
      return `<div class="day-card">
        ${makeRingSVG(s.pct, c, 52, '.58rem')}
        <div class="day-name">${s.name}</div>
        <div class="day-group">${s.group}</div>
      </div>`;
    }).join('')}</div>`;
  }
}


window.showAdminPage = function(page, btn) {
  document.querySelectorAll('#admin-content .page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('ap-' + page);
  if (el) el.classList.add('active');
  document.querySelectorAll('#admin-app .nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  _adminPage = page;
  // Render
  if (page === 'home') renderAdminHome();
  else if (page === 'groups') renderGroups();
  else if (page === 'grades') { populateGroupSelects(); buildGradeForm(); }
  else if (page === 'payments') { populateGroupSelects(); renderPayments(); }
  else if (page === 'curriculum') { document.getElementById('curr-admin-content').innerHTML=''; renderCurrAdmin(); }
  else if (page === 'content') {
    // Oxirgi aktiv tabni yoki default (videos) ni ko'rsat
    var lastTab = window._lastContentTab || 'videos';
    var tabBtn = document.getElementById('ctab-' + lastTab);
    showContentTab(lastTab, tabBtn);
  }
  else if (page === 'sozlama') {
    var lastTab = window._lastSozlamaTab || 'edit';
    var tabBtn = document.getElementById('sztab-' + lastTab);
    showSozlamaTab(lastTab, tabBtn);
  }
};

window.showContentTab = function(tab, btn) {
  window._lastContentTab = tab;
  document.querySelectorAll('#ap-content .cpanel').forEach(p => p.classList.remove('active'));
  var panel = document.getElementById('cp-' + tab);
  if (panel) panel.classList.add('active');
  document.querySelectorAll('#ap-content .stab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  // Render
  if (tab === 'videos') renderVideos();
  else if (tab === 'apps') renderAdminApps();
  else if (tab === 'letters') renderAdminLetters();
  else if (tab === 'notifs') {
    window._audParent = true;
    window._audGuest  = true;
    var bp = document.getElementById('aud-parent');
    var bg = document.getElementById('aud-guest');
    if (bp) bp.classList.add('on');
    if (bg) bg.classList.add('on');
    renderNotifsAdmin();
  }
};

window.showSozlamaTab = function(tab, btn) {
  window._lastSozlamaTab = tab;
  document.querySelectorAll('#ap-sozlama .spanel').forEach(p => p.classList.remove('active'));
  var panel = document.getElementById('sp-' + tab);
  if (panel) panel.classList.add('active');
  document.querySelectorAll('#ap-sozlama .stab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (tab === 'edit') { renderEditPanel(); initEditListeners(); }
  else if (tab === 'settings') applySettings();
};

window.showParentPage = function(page, btn) {
  document.querySelectorAll('#parent-content .page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('pp-' + page);
  if (el) el.classList.add('active');
  document.querySelectorAll('#parent-app .nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  _parentPage = page;
  if (page === 'home') renderParentHome();
  else if (page === 'samara') renderSamara(_samaraPeriod);
  else if (page === 'ranking') loadRanking('today', document.querySelector('#pp-ranking .tab-btn'));
  else if (page === 'apps') renderParentApps();
  else if (page === 'profile') renderProfile();
};

function refreshCurrentPage() {
  if (!CU) return;
  if (CU.role === 'admin') {
    if (_adminPage === 'home') renderAdminHome();
    else if (_adminPage === 'groups') renderGroups();
    else if (_adminPage === 'grades') buildGradeForm();
    else if (_adminPage === 'payments') renderPayments();
    else if (_adminPage === 'videos') renderVideos();
    else if (_adminPage === 'apps') renderAdminApps();
    else if (_adminPage === 'notifs') renderNotifsAdmin();
    else if (_adminPage === 'letters') renderAdminLetters();
    else if (_adminPage === 'curriculum') renderCurrAdmin();
    if (document.getElementById('group-schedule-settings')) renderGroupScheduleSettings();
    updateLettersBadge();
  } else {
    if (_parentPage === 'home') renderParentHome();
    else if (_parentPage === 'samara') renderSamara(_samaraPeriod);
    else if (_parentPage === 'ranking') loadRanking('today', null);
    else if (_parentPage === 'apps') renderParentApps();
    else if (_parentPage === 'profile') renderProfile();
  }
  populateGroupSelects();
  applySettings();
}

// ============================================================
// BUSINESS LOGIC
// ============================================================
// Get all valid records for a student (isCounted === true)
function getValidRecords(studentId, groupId) {
  const stu = (DATA.groups[groupId] || {}).students?.[studentId];
  if (!stu) return [];
  return Object.entries(stu.records || {})
    .filter(([,r]) => r.isCounted === true)
    .map(([dateKey, r]) => ({ dateKey, ...r }))
    .sort((a,b) => a.dateKey.localeCompare(b.dateKey));
}

// Get average percent for a student
function getAvg(studentId, groupId, period) {
  let records = getValidRecords(studentId, groupId);
  if (period === 'today') {
    records = records.filter(r => r.dateKey === today());
  } else if (period === 'week') {
    const now = new Date();
    const day = now.getDay() || 7; // Mon=1..Sun=7
    const monDate = new Date(now); monDate.setDate(now.getDate() - day + 1);
    const monKey = localIso(monDate);
    records = records.filter(r => r.dateKey >= monKey);
  } else if (period === 'month') {
    const m = today().slice(0,7);
    records = records.filter(r => r.dateKey && r.dateKey.startsWith(m));
  } else if (period === 'all') {
    // all records
  }
  if (!records.length) return null;
  const sum = records.reduce((s,r) => s + (r.percent||0), 0);
  return Math.round(sum / records.length);
}

// Determine isCounted for a day in a group
// Rule: day counts only if at least ONE student attended
function isDayCounted(groupId, dateKey, gradeMap) {
  // gradeMap: {studentId: {uv, mt, qatnashdi}} — new grades being saved
  // Or check existing records if not provided
  const group = DATA.groups[groupId] || {};
  const students = Object.keys(group.students || {});
  if (!students.length) return false;

  if (gradeMap) {
    // Check from new grades
    return students.some(sid => {
      const g = gradeMap[sid];
      return g && g.qatnashdi === true;
    });
  } else {
    // Check from existing records
    return students.some(sid => {
      const r = group.students[sid]?.records?.[dateKey];
      return r && r.qatnashdi === true;
    });
  }
}
