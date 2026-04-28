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
  else if (page === 'samara') { renderGuestView(_guestSamaraPeriod||'today'); }
  else if (page === 'home') {
    renderGuestView(_guestPeriod||'today');
    renderGuestHomePosts();
  }
};
window.setGuestRankPeriod = function(period, btn) {
  _guestRankPeriod = period;
  document.querySelectorAll('#gp-rank .gpt2').forEach(b => b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  renderGuestRankPage(period);
};

// Samara sahifasidagi yagona period boshqaruvchi
window.setGuestSamaraPeriod = function(period, btn) {
  _guestSamaraPeriod = period;
  document.querySelectorAll('#samara-period-btns .gpt2').forEach(b => b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  renderGuestView(period);
};
function renderGuestRankPage(period) {
  const listEl = document.getElementById('guest-rank-list');
  if (!listEl) return;
  const all = [];
  Object.entries(DATA.groups || {}).forEach(([gid, g]) => {
    Object.entries(g.students || {}).forEach(([sid, s]) => {
      const avg = getAvg(sid, gid, period);
      if (avg !== null) all.push({ name: s.name, group: g.name, avg });
    });
  });
  all.sort((a,b) => b.avg - a.avg);
  if (!all.length) {
    listEl.innerHTML = '<div class="guest-empty"><div class="ei">🏅</div><p>Hali natija yo\'q</p></div>';
    return;
  }
  const medals = ['🥇','🥈','🥉'];
  listEl.innerHTML = all.map((s, i) => `
    <div class="g-rank-item" style="background:${i<3?'rgba(255,255,255,.06)':'transparent'};border-radius:${i<3?'12px':'0'};padding:${i<3?'10px 12px':'6px 2px'};margin-bottom:${i<3?'6px':'0'};border-bottom:${i>=3?'1px solid rgba(255,255,255,.07)':'none'}">
      <div class="g-rank-num ${i===0?'r1':i===1?'r2':i===2?'r3':'ro'}">${medals[i]||i+1}</div>
      <div class="g-rank-info"><div class="gn">${s.name}</div><div class="gg">${s.group}</div></div>
      <span class="score-badge ${scoreClass(s.avg)}">${s.avg}%</span>
    </div>`).join('');
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
  else if (page === 'videos') renderVideos();
  else if (page === 'apps') renderAdminApps();
  else if (page === 'letters') renderAdminLetters();
  else if (page === 'notifs') {
    // Audience tugmalarini reset qilish
    window._audParent = true;
    window._audGuest  = true;
    var bp = document.getElementById('aud-parent');
    var bg = document.getElementById('aud-guest');
    if (bp) bp.classList.add('on');
    if (bg) bg.classList.add('on');
    renderNotifsAdmin();
  }
  else if (page === 'edit') { renderEditPanel(); initEditListeners(); }
  else if (page === 'settings') applySettings();
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
    const monKey = monDate.toISOString().split('T')[0];
    records = records.filter(r => r.dateKey >= monKey);
  } else if (period === 'month') {
    const m = new Date().toISOString().slice(0,7);
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
