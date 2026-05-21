// ============================================================
// ADMIN HOME
// ============================================================
function renderAdminHome() {
  const groups = DATA.groups || {};
  let totalStudents = 0, todayGraded = 0, todayAttended = 0;
  Object.values(groups).forEach(g => {
    const stus = Object.values(g.students || {});
    totalStudents += stus.length;
    stus.forEach(s => {
      const r = s.records?.[today()];
      if (r) { todayGraded++; if (r.qatnashdi) todayAttended++; }
    });
  });
  document.getElementById('admin-stats').innerHTML =
    '<div class="stat-box"><div class="sv" style="color:var(--blue)">' + totalStudents + '</div><div class="sl">O\'quvchi</div></div>' +
    '<div class="stat-box"><div class="sv" style="color:var(--green)">' + todayGraded + '</div><div class="sl">Baholandi</div></div>';

  // ── Guruh dars vaqtlari ──────────────────────────────
  const cdEl = document.getElementById('admin-group-countdowns');
  if (cdEl && Object.keys(groups).length) {
    cdEl.innerHTML = `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px">
      ${Object.entries(groups).map(([gid, g]) => {
        let ndt = g.nextClassDt || '';
        if (!ndt && g.classDays && g.classDays.length && g.classTime) {
          const auto = computeNextClassDt(g.classDays, g.classTime);
          if (auto) ndt = toLocalISOStr(auto);
        }
        let diff = ndt ? (new Date(ndt) - new Date()) : -1;
        const schedLbl = g.schedule || (g.classTime ?
          `${(g.classDays||[]).map(d=>['Ya','Du','Se','Cho','Pay','Ju','Sha'][d]).join(',')} ${g.classTime}` : '—');
        let cdText = diff > 0 ? (() => {
          const days = Math.floor(diff/86400000);
          const h = Math.floor((diff%86400000)/3600000);
          const m = Math.floor((diff%3600000)/60000);
          return days > 0 ? `${days}k ${h}s` : `${h}s ${m}d`;
        })() : 'Jadval yo\'q';
        return `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;
          padding:10px 14px;min-width:140px">
          <div style="font-size:.72rem;font-weight:700;color:var(--text2)">${g.name}</div>
          <div style="font-size:.75rem;color:var(--text3);margin:2px 0">${schedLbl}</div>
          <div style="font-size:.92rem;font-weight:800;color:var(--green)" id="admin-cd-${gid}">${cdText}</div>
        </div>`;
      }).join('')}
    </div>`;
  }

  const gids = Object.keys(groups);
  const tabsWrap = document.getElementById('admin-group-tabs-wrap');
  const periodWrap = document.getElementById('admin-period-wrap');
  const tabsEl = document.getElementById('admin-group-tabs');

  if (!gids.length) {
    document.getElementById('admin-stu-cards').innerHTML = '<div class="empty"><div class="ei">👥</div><p>Guruh qo\'shilmagan</p></div>';
    if (tabsWrap) tabsWrap.style.display = 'none';
    if (periodWrap) periodWrap.style.display = 'none';
    document.getElementById('admin-period-rank-wrap').style.display = 'none';
  } else {
    if (tabsWrap) tabsWrap.style.display = 'block';
    if (periodWrap) periodWrap.style.display = 'block';
    // Build group tabs
    tabsEl.innerHTML = gids.map((gid, i) =>
      '<button class="agt' + (i===0?' on':'') + '" onclick="selectAdminGroup(\'' + gid + '\',this)">' +
        (groups[gid].name) + ' <span style="font-size:.65rem;opacity:.7">(' + Object.keys(groups[gid].students||{}).length + ')</span>' +
      '</button>'
    ).join('');
    // Load first group
    _adminCurrentGid = gids[0];
    _adminCurrentPeriod = 'today';
    renderAdminGroupCards(_adminCurrentGid, _adminCurrentPeriod);
  }

  // Top all-time — boshida birinchi guruhniki ko'rsatiladi
  const firstGid = gids[0] || null;
  renderTopStudents(firstGid);
}

function renderTopStudents(gid) {
  const groups = DATA.groups || {};
  const allStudents = [];
  if (gid && groups[gid]) {
    const g = groups[gid];
    Object.entries(g.students || {}).forEach(([sid, s]) => {
      const avg = getAvg(sid, gid, 'all');
      if (avg !== null) allStudents.push({ name: s.name, avg, group: g.name });
    });
  } else {
    Object.entries(groups).forEach(([gid2, g]) => {
      Object.entries(g.students || {}).forEach(([sid, s]) => {
        const avg = getAvg(sid, gid2, 'all');
        if (avg !== null) allStudents.push({ name: s.name, avg, group: g.name });
      });
    });
  }
  allStudents.sort((a,b) => b.avg - a.avg);
  const top = allStudents.slice(0, 5);
  const titleEl = document.getElementById('top-students-title');
  if (titleEl) {
    const gName = gid && groups[gid] ? groups[gid].name : null;
    titleEl.textContent = '🏆 Top o\'quvchilar — ' + (gName ? gName : 'Barcha guruhlar');
  }
  const topEl = document.getElementById('top-students');
  if (!topEl) return;
  topEl.innerHTML = !top.length
    ? '<div class="empty"><div class="ei">🏅</div><p>Hali natija yo\'q</p></div>'
    : top.map((s,i) =>
        '<div class="rank-item">' +
          '<div class="rnum ' + (i===0?'r1':i===1?'r2':i===2?'r3':'rother') + '">' + (i+1) + '</div>' +
          '<div style="flex:1"><span style="font-weight:600;font-size:.9rem">' + s.name + '</span>' +
          '<div style="font-size:.7rem;color:var(--text3)">' + s.group + '</div></div>' +
          '<span class="score-badge ' + scoreClass(s.avg) + '">' + s.avg + '%</span>' +
        '</div>'
      ).join('');
}

let _adminCurrentGid = null;
let _adminCurrentPeriod = 'today';

window.selectAdminGroup = function(gid, btn) {
  _adminCurrentGid = gid;
  document.querySelectorAll('.agt').forEach(b => b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  renderAdminGroupCards(gid, _adminCurrentPeriod);
  renderTopStudents(gid);
};

window.setAdminPeriod = function(period, btn) {
  _adminCurrentPeriod = period;
  document.querySelectorAll('.apt').forEach(b => b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  const titles = { today: '📊 Kunlik reyting', week: '📊 Haftalik reyting', month: '📊 Oylik reyting' };
  const titleEl = document.getElementById('admin-rank-title');
  if (titleEl) titleEl.textContent = titles[period] || '📊 Reyting';
  if (_adminCurrentGid) renderAdminGroupCards(_adminCurrentGid, period);
};

function renderAdminGroupCards(gid, period) {
  const group = DATA.groups[gid];
  const cardsEl = document.getElementById('admin-stu-cards');
  const rankWrap = document.getElementById('admin-period-rank-wrap');
  const rankEl = document.getElementById('admin-period-rank');
  if (!group) { cardsEl.innerHTML = ''; return; }

  const studs = Object.entries(group.students || {});
  if (!studs.length) {
    cardsEl.innerHTML = '<div class="empty" style="padding:20px 0"><div class="ei">👤</div><p>O\'quvchi yo\'q</p></div>';
    if (rankWrap) rankWrap.style.display = 'none';
    return;
  }

  const uvMax = DATA.settings?.uvMax || 50;
  const mtMax = DATA.settings?.mtMax || 25;
  const todayKey = today();

  // Build student data with period avg
  const stuData = studs.map(([sid, s]) => {
    const todayRec = s.records?.[todayKey];
    const periodAvg = getAvg(sid, gid, period);
    // Last login date
    const lastLoginAt = s.lastLoginAt || null;
    const loginedToday = lastLoginAt && localIso(new Date(lastLoginAt)) === todayKey;
    return { sid, s, todayRec, periodAvg, loginedToday, lastLoginAt };
  });

  // Sort by period avg descending
  const sorted = [...stuData].sort((a,b) => (b.periodAvg||0) - (a.periodAvg||0));

  // Build cards
  cardsEl.innerHTML = sorted.map((d, idx) => {
    const { sid, s, todayRec, periodAvg, loginedToday, lastLoginAt } = d;
    const rank = idx + 1;
    const rankLabel = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '#' + rank;

    // Today's detail
    let todayDetail = '';
    if (todayRec) {
      todayDetail = 'UV:' + todayRec.uv + '/' + uvMax + ' · MT:' + todayRec.mt + '/' + mtMax +
        ' · ' + (todayRec.qatnashdi ? '✅ Keldi' : '❌ Kelmadi');
    } else {
      todayDetail = 'Bugun baholanmagan';
    }

    // Login status
    let loginStatus = '';
    if (loginedToday) {
      loginStatus = '<span style="color:#10B981;font-size:.82rem;font-weight:800">✅ Bugun kirdi</span>';
    } else if (lastLoginAt) {
      const d2 = new Date(lastLoginAt);
      const dStr = d2.toLocaleDateString('uz-UZ', {day:'2-digit', month:'short'});
      const diffD = Math.floor((Date.now() - lastLoginAt) / 86400000);
      const diffLabel = diffD <= 1 ? '🟡 Kecha kirdi' : '🔴 ' + diffD + ' kun oldin kirdi';
      loginStatus = '<span style="color:' + (diffD<=1?'#F59E0B':'#EF4444') + ';font-size:.82rem;font-weight:800">' + diffLabel + '</span>';
    } else {
      loginStatus = '<span style="color:#EF4444;font-size:.82rem;font-weight:800">🔴 Hali kirmagan</span>';
    }

    const avgColor = periodAvg !== null ? (periodAvg>=90?'var(--green)':periodAvg>=70?'var(--blue)':periodAvg>=50?'var(--yellow)':'var(--red)') : 'var(--text3)';
    const avatarColors = ['linear-gradient(135deg,#3B82F6,#8B5CF6)','linear-gradient(135deg,#10B981,#3B82F6)','linear-gradient(135deg,#F59E0B,#EF4444)','linear-gradient(135deg,#8B5CF6,#EC4899)','linear-gradient(135deg,#06B6D4,#10B981)'];
    const avBg = avatarColors[idx % avatarColors.length];

    // Card background based on login recency
    let cardBg = 'var(--bg2)';
    let cardBorder = 'var(--border)';
    if (loginedToday) {
      cardBg = 'rgba(16,185,129,.10)'; cardBorder = 'rgba(16,185,129,.35)';
    } else if (lastLoginAt) {
      const diffDays = Math.floor((Date.now() - lastLoginAt) / 86400000);
      if (diffDays <= 1) { cardBg = 'rgba(245,158,11,.09)'; cardBorder = 'rgba(245,158,11,.35)'; }
      else { cardBg = 'rgba(239,68,68,.08)'; cardBorder = 'rgba(239,68,68,.30)'; }
    } else {
      cardBg = 'rgba(239,68,68,.08)'; cardBorder = 'rgba(239,68,68,.30)';
    }

    return '<div class="asc" style="background:' + cardBg + ';border-color:' + cardBorder + '">' +
      '<div class="asc-av" style="background:' + avBg + '">' + s.name.charAt(0).toUpperCase() + '</div>' +
      '<div class="asc-info">' +
        '<div class="asc-name">' + s.name + '</div>' +
        '<div class="asc-meta">' +
          '<span>' + todayDetail + '</span>' +
        '</div>' +
        '<div style="margin-top:5px;font-size:.78rem;font-weight:700">' + loginStatus + '</div>' +
      '</div>' +
      '<div class="asc-right">' +
        '<span class="score-badge ' + scoreClass(periodAvg||0) + '" style="font-size:.82rem;padding:4px 8px">' + (periodAvg !== null ? periodAvg+'%' : '—') + '</span>' +
        '<span class="asc-rank">' + rankLabel + '</span>' +
      '</div>' +
    '</div>';
  }).join('');

  // Period ranking block
  if (rankWrap) rankWrap.style.display = 'block';
  if (rankEl) {
    const withAvg = sorted.filter(d => d.periodAvg !== null);
    if (!withAvg.length) {
      rankEl.innerHTML = '<div style="font-size:.82rem;color:var(--text2);padding:8px 0">Ma\'lumot yo\'q</div>';
    } else {
      rankEl.innerHTML = withAvg.map((d, i) => {
        const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
        return '<div class="rank-row">' +
          '<div style="width:24px;text-align:center;font-size:.8rem;font-weight:800;color:var(--text3)">' + (medal || (i+1)) + '</div>' +
          '<div style="flex:1;font-size:.85rem;font-weight:600">' + d.s.name + '</div>' +
          '<span class="score-badge ' + scoreClass(d.periodAvg) + '">' + d.periodAvg + '%</span>' +
        '</div>';
      }).join('');
    }
  }
}


// ============================================================
// GROUPS & STUDENTS
// ============================================================
function renderGroups() {
  const groups = DATA.groups || {};
  const container = document.getElementById('groups-list');
  if (!Object.keys(groups).length) {
    container.innerHTML = '<div class="empty"><div class="ei">👥</div><p>Hali guruh qo\'shilmagan</p></div>';
    return;
  }
  container.innerHTML = Object.entries(groups).map(([gid, group]) => {
    const stuCount = Object.keys(group.students || {}).length;
    const students = Object.entries(group.students || {}).sort((a,b) => a[1].name.localeCompare(b[1].name));
    return `
    <div class="group-card">
      <div class="group-header" onclick="toggleGroup('${gid}')">
        <div class="gh-left">
          <div class="gico">👥</div>
          <div>
            <div class="gname">${group.name}</div>
            <div class="gcnt">${stuCount} ta o'quvchi</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <button class="btn btn-xs btn-ghost" onclick="event.stopPropagation();openEditGroup('${gid}')">✏️</button>
          <span class="garr">▼</span>
        </div>
      </div>
      <div class="group-body" id="gb-${gid}">
        <button class="btn btn-sm btn-primary" onclick="openAddStudent('${gid}')" style="margin-bottom:10px;width:100%">➕ O'quvchi qo'shish</button>
        ${students.length === 0 ? '<div class="empty" style="padding:16px 0"><div class="ei" style="font-size:1.5rem">👤</div><p style="font-size:.8rem">O\'quvchi yo\'q</p></div>' :
          students.map(([sid, s]) => {
            const avg = getAvg(sid, gid, 'all');
            return `
            <div class="stu-item" onclick="openEditStudent('${sid}','${gid}')">
              <div class="stu-av">${s.name.charAt(0).toUpperCase()}</div>
              <div class="stu-info">
                <div class="sn">${s.name}</div>
                <div class="sp">PIN: ${s.pin} · ${Object.keys(s.records||{}).length} dars</div>
              </div>
              <div style="display:flex;align-items:center;gap:6px">
                ${avg !== null ? `<span class="score-badge ${scoreClass(avg)}">${avg}%</span>` : '<span style="color:var(--text3);font-size:.78rem">—</span>'}
                <button class="btn btn-xs btn-purple" onclick="event.stopPropagation();openAdminSamara('${sid}','${gid}')" title="Samara">📊</button>
              </div>
            </div>`;
          }).join('')}
      </div>
    </div>`;
  }).join('');
}

window.toggleGroup = function(gid) {
  const body = document.getElementById('gb-'+gid);
  const header = body.previousElementSibling;
  const isOpen = body.classList.contains('open');
  // Close all
  document.querySelectorAll('.group-body').forEach(b => b.classList.remove('open'));
  document.querySelectorAll('.group-header').forEach(h => h.classList.remove('open'));
  if (!isOpen) { body.classList.add('open'); header.classList.add('open'); }
};

window.openAddGroup = function() {
  document.getElementById('mg-name').value = '';
  document.getElementById('mg-err').style.display = 'none';
  openModal('m-addgroup');
};

window.addGroup = async function() {
  const name = document.getElementById('mg-name').value.trim();
  const errEl = document.getElementById('mg-err');
  if (!name) { errEl.textContent='Guruh nomini kiriting!'; errEl.style.display='block'; return; }
  const gid = genId();
  DATA.groups[gid] = { name, createdAt: nowTs(), students: {} };
  saveLocal();
  closeModal('m-addgroup');
  renderGroups();
  populateGroupSelects();
  toast('✅ Guruh qo\'shildi');
  fbSet('groups/' + gid, { name, createdAt: nowTs(), students: {} }).catch(e => console.warn('fb:', e));
};

window.openEditGroup = function(gid) {
  const g = DATA.groups[gid];
  if (!g) return;
  document.getElementById('meg-name').value = g.name;
  document.getElementById('meg-price').value = g.coursePrice || '';
  document.getElementById('meg-id').value = gid;
  openModal('m-editgroup');
};

window.updateGroup = async function() {
  const gid = document.getElementById('meg-id').value;
  const name = document.getElementById('meg-name').value.trim();
  if (!name) return;
  const coursePrice = parseInt(document.getElementById('meg-price').value) || 0;
  DATA.groups[gid].name = name;
  DATA.groups[gid].coursePrice = coursePrice;
  saveLocal();
  closeModal('m-editgroup');
  renderGroups();
  populateGroupSelects();
  toast('✅ Yangilandi');
  fbUpdate('groups/' + gid, { name, coursePrice }).catch(e => console.warn('fb:', e));
};

window.deleteGroup = async function() {
  const gid = document.getElementById('meg-id').value;
  if (!confirm('Guruhni va barcha o\'quvchilarni o\'chirmoqchimisiz?')) return;
  delete DATA.groups[gid];
  saveLocal();
  closeModal('m-editgroup');
  renderGroups();
  populateGroupSelects();
  toast('🗑️ Guruh o\'chirildi');
  fbRemove('groups/' + gid).catch(e => console.warn('fb:', e));
};

window.openAddStudent = function(gid) {
  document.getElementById('ms-name').value = '';
  document.getElementById('ms-pin').value = '';
  document.getElementById('ms-groupid').value = gid;
  document.getElementById('ms-err').style.display = 'none';
  openModal('m-addstu');
};

window.addStudent = async function() {
  const name = document.getElementById('ms-name').value.trim();
  const pin = document.getElementById('ms-pin').value.trim();
  const gid = document.getElementById('ms-groupid').value;
  const errEl = document.getElementById('ms-err');
  if (!name) { errEl.textContent='Ism kiriting!'; errEl.style.display='block'; return; }
  if (!pin || pin.length !== 4) { errEl.textContent='4 xonali PIN kiriting!'; errEl.style.display='block'; return; }
  // Check PIN uniqueness across all groups
  for (const g of Object.values(DATA.groups || {})) {
    for (const s of Object.values(g.students || {})) {
      if (String(s.pin) === String(pin)) { errEl.textContent='Bu PIN allaqachon ishlatilgan!'; errEl.style.display='block'; return; }
    }
  }
  // Qabul sanasi → to'lov kun tsikli
  const joinDateDisplay = document.getElementById('ms-joindate')?.value || '';
  const joinDate = displayToIso(joinDateDisplay) || today();
  const dueDayOfMonth = new Date(joinDate + 'T00:00:00').getDate();
  // Guruh uchun belgilangan kun ustuvor bo'lsa o'sha ishlatiladi
  const g0 = DATA.groups[gid] || {};
  const effectiveDay = g0.payDueDay || dueDayOfMonth;
  const dueDate = nextDueDateFromDay(effectiveDay);

  const sid = genId();
  const stuData = {
    name, pin, createdAt: nowTs(), joinDate,
    payments: { amount: 0, paid: false, date: '', dueDayOfMonth: effectiveDay, dueDate, history: [] },
    records: {}
  };
  if (!DATA.groups[gid]) DATA.groups[gid] = { name:'', students:{} };
  if (!DATA.groups[gid].students) DATA.groups[gid].students = {};
  DATA.groups[gid].students[sid] = stuData;
  saveLocal();
  closeModal('m-addstu');
  // Formani tozalaymiz
  const jd = document.getElementById('ms-joindate');
  if (jd) jd.value = '';
  renderGroups();
  toast('✅ O\'quvchi qo\'shildi · To\'lov kuni: har oy ' + effectiveDay + '-sana');
  fbSet(`groups/${gid}/students/${sid}`, stuData).catch(e => console.warn('fb:', e));
};

window.openEditStudent = function(sid, gid) {
  const s = DATA.groups[gid]?.students?.[sid];
  if (!s) return;
  document.getElementById('mes-name').value = s.name;
  document.getElementById('mes-pin').value = s.pin;
  document.getElementById('mes-id').value = sid;
  document.getElementById('mes-groupid').value = gid;
  // Show parent password change info
  const infoEl = document.getElementById('mes-pin-change-info');
  if (infoEl) {
    if (s.pinChangedAt && s.pinChangedBy === 'parent') {
      infoEl.innerHTML = `<div style="font-size:.72rem;color:var(--yellow);margin-top:4px;padding:6px 10px;background:rgba(245,158,11,.1);border-radius:8px;border:1px solid rgba(245,158,11,.3)">🔔 Ota-ona tomonidan o'zgartirildi: <b>${s.pinChangedAtStr || new Date(s.pinChangedAt).toLocaleString('uz-UZ')}</b></div>`;
      infoEl.style.display = 'block';
    } else {
      infoEl.style.display = 'none';
    }
  }
  openModal('m-editstu');
};

window.updateStudent = async function() {
  const sid = document.getElementById('mes-id').value;
  const gid = document.getElementById('mes-groupid').value;
  const name = document.getElementById('mes-name').value.trim();
  const pin = document.getElementById('mes-pin').value.trim();
  if (!name || !pin) return;
  // Check PIN uniqueness (exclude self)
  for (const [g2id, g] of Object.entries(DATA.groups || {})) {
    for (const [s2id, s] of Object.entries(g.students || {})) {
      if (String(s.pin) === String(pin) && !(s2id === sid && g2id === gid)) {
        toast('❌ Bu PIN allaqachon band!'); return;
      }
    }
  }
  DATA.groups[gid].students[sid].name = name;
  DATA.groups[gid].students[sid].pin = pin;
  // If admin changes pin, clear parent-change flag
  DATA.groups[gid].students[sid].pinChangedBy = 'admin';
  DATA.groups[gid].students[sid].pinChangedAt = null;
  saveLocal();
  closeModal('m-editstu');
  renderGroups();
  toast('✅ Yangilandi');
  fbUpdate(`groups/${gid}/students/${sid}`, { name, pin, pinChangedBy: 'admin', pinChangedAt: null }).catch(e => console.warn('fb:', e));
};

window.deleteStudent = async function() {
  const sid = document.getElementById('mes-id').value;
  const gid = document.getElementById('mes-groupid').value;
  if (!confirm('O\'quvchini o\'chirmoqchimisiz?')) return;
  delete DATA.groups[gid].students[sid];
  saveLocal();
  closeModal('m-editstu');
  renderGroups();
  toast('🗑️ O\'chirildi');
  fbRemove(`groups/${gid}/students/${sid}`).catch(e => console.warn('fb:', e));
};

// ============================================================
// NATIJALARNI TOZALASH — o'quvchi yoki guruh records
// ============================================================

// Bitta o'quvchining barcha natijalarini o'chirish
window.clearStudentRecords = async function(sid, gid) {
  const s = DATA.groups[gid]?.students?.[sid];
  if (!s) return;
  const cnt = Object.keys(s.records || {}).length;
  if (!cnt) { toast('ℹ️ Natija yo\'q'); return; }
  if (!confirm(s.name + ' — barcha ' + cnt + ' ta natijani o\'chirasizmi?\nQayta tiklab bo\'lmaydi!')) return;
  DATA.groups[gid].students[sid].records = {};
  saveLocal();
  renderGroups();
  buildGradeForm && buildGradeForm();
  toast('🗑️ ' + s.name + ' natijalari tozalandi');
  fbSet('groups/' + gid + '/students/' + sid + '/records', {}).catch(function(e){ console.warn('fb:',e); });
};

// Guruh uchun vaqt oralig'i bo'yicha records tozalash
// range: 'today' | 'week' | 'month' | 'all'
window.clearGroupRecords = async function(gid, range) {
  const group = DATA.groups[gid];
  if (!group) return;
  const students = group.students || {};

  // Vaqt filtr
  const now = new Date();
  function inRange(dateStr) {
    if (range === 'all') return true;
    const d = new Date(dateStr);
    if (range === 'today') {
      return dateStr === today();
    }
    if (range === 'week') {
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo;
    }
    if (range === 'month') {
      return dateStr.slice(0, 7) === today().slice(0, 7);
    }
    return false;
  }

  const rangeNames = { today: 'bugungi', week: 'haftalik', month: 'oylik', all: 'BARCHA' };
  const totalDates = new Set();
  Object.values(students).forEach(function(s) { Object.keys(s.records||{}).forEach(function(d){ if(inRange(d)) totalDates.add(d); }); });

  if (!totalDates.size) { toast('ℹ️ O\'chirish uchun natija topilmadi'); return; }

  const msg = group.name + ' — ' + rangeNames[range] + ' ' + totalDates.size + ' kunlik natijani o\'chirasizmi?\n' + (range==='all'?'⚠️ BARCHA natijalar yo\'qoladi! ' : '') + 'Qayta tiklab bo\'lmaydi!';
  if (!confirm(msg)) return;

  const removes = [];
  Object.entries(students).forEach(function(se) {
    const sid = se[0], s = se[1];
    Object.keys(s.records || {}).forEach(function(d) {
      if (inRange(d)) {
        delete DATA.groups[gid].students[sid].records[d];
        removes.push(fbRemove('groups/' + gid + '/students/' + sid + '/records/' + d));
      }
    });
  });

  saveLocal();
  renderGroups();
  buildGradeForm && buildGradeForm();
  toast('🗑️ ' + totalDates.size + ' kun natijalari tozalandi');
  Promise.all(removes).catch(function(e){ console.warn('fb:',e); });
};

// Modal ochish: guruh tanlash + tozalash
window.openClearRecordsModal = function() {
  const groups = DATA.groups || {};
  const gEntries = Object.entries(groups);
  if (!gEntries.length) { toast('⚠️ Guruh yo\'q'); return; }

  // Modal HTML yaratish
  const opts = gEntries.map(function(e){ return '<option value="'+e[0]+'">'+e[1].name+'</option>'; }).join('');
  const m = document.createElement('div');
  m.id = 'clear-records-modal';
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(6px);z-index:9999;display:flex;align-items:flex-end;justify-content:center';
  m.innerHTML = `
  <div style="background:var(--bg1);border-radius:18px 18px 0 0;width:100%;max-width:480px;padding:20px 18px 32px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div style="font-weight:800;font-size:1rem">🗑️ Natijalarni tozalash</div>
      <button onclick="document.getElementById('clear-records-modal').remove()"
        style="background:var(--bg2);border:none;color:var(--text1);width:32px;height:32px;border-radius:50%;font-size:1.1rem;cursor:pointer">✕</button>
    </div>
    <div style="font-size:.8rem;color:var(--text2);margin-bottom:14px">Guruh tanlab, qaysi davr natijalarini o'chirishni belgilang.</div>
    <div class="form-group" style="margin-bottom:12px">
      <label style="font-size:.72rem;font-weight:700;color:var(--text2)">Guruh</label>
      <select class="inp" id="cr-group-sel">${opts}</select>
    </div>
    <div style="font-size:.72rem;font-weight:700;color:var(--text2);margin-bottom:8px">Davr</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
      <button onclick="clearGroupRecords(document.getElementById('cr-group-sel').value,'today');document.getElementById('clear-records-modal').remove()"
        style="padding:12px 8px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;font-size:.82rem;font-weight:700;color:var(--text1);cursor:pointer">
        📅 Bugun</button>
      <button onclick="clearGroupRecords(document.getElementById('cr-group-sel').value,'week');document.getElementById('clear-records-modal').remove()"
        style="padding:12px 8px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;font-size:.82rem;font-weight:700;color:var(--text1);cursor:pointer">
        📆 Hafta</button>
      <button onclick="clearGroupRecords(document.getElementById('cr-group-sel').value,'month');document.getElementById('clear-records-modal').remove()"
        style="padding:12px 8px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;font-size:.82rem;font-weight:700;color:var(--text1);cursor:pointer">
        🗓️ Bu oy</button>
      <button onclick="clearGroupRecords(document.getElementById('cr-group-sel').value,'all');document.getElementById('clear-records-modal').remove()"
        style="padding:12px 8px;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);border-radius:10px;font-size:.82rem;font-weight:700;color:#EF4444;cursor:pointer">
        ⚠️ Barcha</button>
    </div>
    <div style="font-size:.68rem;color:var(--text2);opacity:.7;text-align:center">Natijalar o'chirilgach qayta tiklanmaydi</div>
  </div>`;
  m.addEventListener('click', function(e){ if(e.target===m) m.remove(); });
  document.body.appendChild(m);
};

// ============================================================
// GROUP SELECTS (shared)
// ============================================================
function populateGroupSelects() {
  const groups = Object.entries(DATA.groups || {});
  const html = groups.length
    ? groups.map(([gid,g]) => `<option value="${gid}">${g.name}</option>`).join('')
    : '<option value="">— Guruh yo\'q —</option>';
  ['grade-group','pay-group'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const prev = el.value;
      el.innerHTML = html;
      if (prev && groups.find(([k])=>k===prev)) el.value = prev;
    }
  });
}

// ============================================================
// GRADING
// ============================================================

window.gradeAutoAtt = function(sid, uvMax, mtMax, faolMax) {
  gradeUpdateRow(sid, uvMax, mtMax, faolMax);
};
window.gradeUpdateRow = function(sid, uvMax, mtMax, faolMax) {
  const uvEl   = document.getElementById('uv_'   + sid);
  const mtEl   = document.getElementById('mt_'   + sid);
  const faolEl = document.getElementById('faol_' + sid);
  const liveEl = document.getElementById('glv_'  + sid);
  const attEl  = document.getElementById('att_'  + sid);
  if (!uvEl || !liveEl) return;
  const uv   = Math.min(uvMax,   Math.max(0, parseInt(uvEl.value)||0));
  const mt   = Math.min(mtMax,   Math.max(0, parseInt(mtEl?.value)||0));
  const faol = Math.min(faolMax||25, Math.max(0, parseInt(faolEl?.value)||0));
  const pct  = calcPercent(uv, mt, faol);
  liveEl.textContent = pct + '%';
  liveEl.style.color = pctColor(pct);
  // Birorta bal kiritilsa → davomat avtomatik "keldi" ga yoqilsin
  if (attEl && (uv > 0 || mt > 0 || faol > 0)) {
    attEl.classList.add('on');
  }
};
window.buildGradeForm = function() {
  const gid = document.getElementById('grade-group').value;
  const date = displayToIso(document.getElementById('grade-date').value) || today();
  const container = document.getElementById('grade-form');
  const histCard = document.getElementById('grade-history-card');
  const uvMax = DATA.settings.uvMax || 50;
  const mtMax = DATA.settings.mtMax || 25;
  const attMax = 100 - uvMax - mtMax;

  // Update hint box
  const hintEl = document.getElementById('grade-hint-box');
  const faolMax = DATA.settings.faolMax || 25;
  if (hintEl) hintEl.innerHTML = `⚡ UV: 0–${uvMax} · MT: 0–${mtMax} · Faollik: 0–${faolMax} · <span id='grade-autosave-hint' style='color:#10B981;transition:opacity 1s;opacity:0'>✅ Saqlandi</span>`;

  if (!gid || !DATA.groups[gid]) {
    container.innerHTML = '<div class="empty" style="padding:20px 0"><div class="ei">👥</div><p>Guruh tanlang</p></div>';
    histCard.style.display = 'none';
    return;
  }

  const students = Object.entries(DATA.groups[gid].students || {}).sort((a,b)=>a[1].name.localeCompare(b[1].name));
  if (!students.length) {
    container.innerHTML = '<div class="empty" style="padding:20px 0"><div class="ei">👤</div><p>O\'quvchi yo\'q</p></div>';
    histCard.style.display = 'none';
    return;
  }

  container.innerHTML = students.map(([sid, s]) => {
    const ex = s.records?.[date];
    const uv   = ex?.uv   ?? '';
    const mt   = ex?.mt   ?? '';
    const faol = ex?.faol ?? '';
    const dav  = ex?.qatnashdi ? 'on' : '';
    const cancelled = ex && ex.isCounted === false;
    const prevPct = ex ? ex.percent : null;
    return `
    <div class="grade-row ${cancelled ? 'cancelled' : ''}" id="gr_${sid}">
      <div class="gname" title="${s.name}">${s.name}</div>
      <input type="number" min="0" max="${uvMax}"   placeholder="UV"   value="${uv}"   id="uv_${sid}"
        oninput="gradeUpdateRow('${sid}',${uvMax},${mtMax},${faolMax})" style="border-color:rgba(59,130,246,.4)">
      <input type="number" min="0" max="${mtMax}"   placeholder="MT"   value="${mt}"   id="mt_${sid}"
        oninput="gradeUpdateRow('${sid}',${uvMax},${mtMax},${faolMax})" style="border-color:rgba(139,92,246,.4)">
      <input type="number" min="0" max="${faolMax}" placeholder="Faol" value="${faol}" id="faol_${sid}"
        oninput="gradeUpdateRow('${sid}',${uvMax},${mtMax},${faolMax})" style="border-color:rgba(245,158,11,.4)">
      <div style="display:flex;justify-content:center">
        <div class="faol-toggle ${dav}" id="att_${sid}"
          onclick="this.classList.toggle('on')"
          title="Davomat (statistika)"></div>
      </div>
      <span class="grade-live" id="glv_${sid}">${prevPct !== null ? prevPct+'%' : '—'}</span>
    </div>`;
  }).join('');

  // Show history
  renderGradeHistory(gid, date);
};

window.saveGrades = async function() {
  const gid = document.getElementById('grade-group').value;
  const date = displayToIso(document.getElementById('grade-date').value) || today();
  if (!gid || !date) { toast('❌ Guruh va sana tanlang!'); return; }

  const group = DATA.groups[gid];
  if (!group) return;
  const students = Object.entries(group.students || {});
  if (!students.length) { toast('❌ Guruhda o\'quvchi yo\'q'); return; }

  // Build grade map
  const uvMax   = DATA.settings.uvMax   || 50;
  const mtMax   = DATA.settings.mtMax   || 25;
  const faolMax = DATA.settings.faolMax || 25;
  const gradeMap = {};
  for (const [sid] of students) {
    const uvEl   = document.getElementById('uv_'+sid);
    const mtEl   = document.getElementById('mt_'+sid);
    const faolEl = document.getElementById('faol_'+sid);
    const attEl  = document.getElementById('att_'+sid);
    if (!uvEl) continue;
    const uv       = Math.min(uvMax,   Math.max(0, parseInt(uvEl.value)||0));
    const mt       = Math.min(mtMax,   Math.max(0, parseInt(mtEl?.value)||0));
    const faol     = Math.min(faolMax, Math.max(0, parseInt(faolEl?.value)||0));
    const qatnashdi = attEl ? attEl.classList.contains('on') : false;
    gradeMap[sid] = { uv, mt, faol, qatnashdi };
  }

  // Determine isCounted: at least one student attended
  const counted = isDayCounted(gid, date, gradeMap);

  // Save records
  const updates = {};
  for (const [sid, g] of Object.entries(gradeMap)) {
    const existing = DATA.groups[gid].students[sid]?.records?.[date];
    const isCounted = existing?.manualOverride ? existing.isCounted : counted;
    const percent = calcPercent(g.uv, g.mt, g.faol);
    const record = { uv:g.uv, mt:g.mt, faol:g.faol, qatnashdi:g.qatnashdi, percent, isCounted, createdAt: nowTs() };
    updates[`groups/${gid}/students/${sid}/records/${date}`] = record;
    if (!DATA.groups[gid].students[sid]) continue;
    if (!DATA.groups[gid].students[sid].records) DATA.groups[gid].students[sid].records = {};
    DATA.groups[gid].students[sid].records[date] = record;
  }

  saveLocal();
  buildGradeForm();
  toast(`✅ ${Object.keys(gradeMap).length} o'quvchi bahosi saqlandi`);
  fbUpdate('/', updates).catch(e => console.warn('fb:', e));
};

function renderGradeHistory(gid, currentDate) {
  const group = DATA.groups[gid] || {};
  const students = Object.values(group.students || {});
  if (!students.length) return;

  // Collect all dates with records in this group
  const dates = new Set();
  students.forEach(s => { Object.keys(s.records||{}).forEach(d => dates.add(d)); });
  const sortedDates = Array.from(dates).sort((a,b)=>b.localeCompare(a)).slice(0,20);

  if (!sortedDates.length) {
    document.getElementById('grade-history-card').style.display = 'none';
    return;
  }

  document.getElementById('grade-history-card').style.display = 'block';
  document.getElementById('grade-history').innerHTML = sortedDates.filter(d => {
    return isDayCounted(gid, d, null); // Bekor kunlarni ko'rsatmaymiz
  }).map(d => {
    const isCounted = true; // filter'dan o'tdi — doim true
    const avgArr = Object.entries(group.students||{}).map(([,s]) => s.records?.[d]?.percent).filter(v=>v!==undefined);
    const avg = avgArr.length ? Math.round(avgArr.reduce((a,b)=>a+b,0)/avgArr.length) : 0;
    const attCount = Object.values(group.students||{}).filter(s=>s.records?.[d]?.qatnashdi).length;
    return `
    <div class="hist-row">
      <div style="flex:1">
        <div class="hist-date">${fmtDate(d)} ${d===today()?'(bugun)':''}</div>
        <div class="hist-sub">O'rtacha: ${avg}% · Keldi: ${attCount}/${students.length}</div>
      </div>
      <div class="hist-actions">
        <button class="btn btn-xs btn-danger" onclick="toggleDayCount('${gid}','${d}',false)">Bekor</button>
      </div>
    </div>`;
  }).join('');
}

window.toggleDayCount = async function(gid, date, counted) {
  const group = DATA.groups[gid];
  if (!group) return;
  if (!counted) {
    // Bekor = o'chirish (Firebase dan ham, localdan ham)
    if (!confirm('Bu kunni butunlay o\'chirasizmi? Qayta tiklab bo\'lmaydi!')) return;
    const removes = [];
    for (const [sid, s] of Object.entries(group.students||{})) {
      if (s.records?.[date]) {
        delete DATA.groups[gid].students[sid].records[date];
        removes.push(fbRemove(`groups/${gid}/students/${sid}/records/${date}`));
      }
    }
    saveLocal();
    buildGradeForm();
    toast('🗑️ Kun o\'chirildi');
    Promise.all(removes).catch(e => console.warn('fb:', e));
  } else {
    // Tiklash (agar kerak bo'lsa)
    const updates = {};
    for (const [sid, s] of Object.entries(group.students||{})) {
      if (s.records?.[date]) {
        DATA.groups[gid].students[sid].records[date].isCounted = true;
        DATA.groups[gid].students[sid].records[date].manualOverride = true;
        updates[`groups/${gid}/students/${sid}/records/${date}/isCounted`] = true;
        updates[`groups/${gid}/students/${sid}/records/${date}/manualOverride`] = true;
      }
    }
    saveLocal();
    buildGradeForm();
    toast('✅ Kun tiklandi');
    fbUpdate('/', updates).catch(e => console.warn('fb:', e));
  }
};

// ============================================================
// PAYMENTS
// ============================================================

// Guruh narxi yoki global standart narx
function getEffectivePrice(g) {
  return (g && g.coursePrice) || (DATA.settings && DATA.settings.globalCoursePrice) || 0;
}

// Guruh o'quvchilarining to'lov miqdorini kurs narxiga qayta tiklash
window.bulkUpdatePayAmounts = async function(gid) {
  const g = DATA.groups[gid];
  if (!g) return;
  const price = getEffectivePrice(g);
  if (!price) { toast('⚠️ Avval kurs narxini kiriting'); return; }
  const count = Object.keys(g.students || {}).length;
  if (!confirm(count + ' ta o\'quvchi to\'lov summasini ' + price.toLocaleString() + ' so\'mga yangilash?\n(Chegirmali o\'quvchilar qo\'lda tartibga solinsin)')) return;
  const fbUpdates = [];
  Object.keys(g.students || {}).forEach(function(sid) {
    const pay = g.students[sid].payments || {};
    const newPay = Object.assign({}, pay, { amount: price });
    DATA.groups[gid].students[sid].payments = newPay;
    fbUpdates.push(fbSet('groups/' + gid + '/students/' + sid + '/payments', newPay));
  });
  saveLocal();
  toast('✅ ' + count + ' ta o\'quvchi summasi yangilandi');
  renderPayments();
  Promise.all(fbUpdates).catch(function(e){ console.warn('fb:', e); });
};

// Guruh to'lov sozlamalarini saqlash + o'quvchilarni yangilash
window.saveGroupPaySettings = async function(gid) {
  const g = DATA.groups[gid];
  if (!g) return;
  const priceEl = document.getElementById('gps-price');
  const dayEl   = document.getElementById('gps-day');
  const coursePrice = parseInt(priceEl && priceEl.value) || 0;
  const newDay      = parseInt(dayEl   && dayEl.value)   || 0;
  const oldDay      = g.payDueDay || 0;

  // Kun o'zgarsa — ogohlantirish + barcha o'quvchilarni yangilash
  if (newDay && newDay !== oldDay) {
    const stuCount = Object.keys(g.students || {}).length;
    const ok = confirm(
      '⚠️ Diqqat!\n\nGuruh to\'lov sanasi ' + newDay + '-sana bo\'ladi.\n' +
      stuCount + ' ta o\'quvchining to\'lov sanasi ham ' + newDay +
      '-sana qilib yangilanadi (avvalgi sanalar almashtiriladi).\n\nDavom etasizmi?'
    );
    if (!ok) return;

    const fbUpds = [];
    Object.entries(g.students || {}).forEach(function([sid, s]) {
      const pay = Object.assign({}, s.payments || {});
      pay.dueDayOfMonth = newDay;
      pay.dueDate = nextDueDateFromDay(newDay);
      DATA.groups[gid].students[sid].payments = pay;
      fbUpds.push(fbUpdate('groups/' + gid + '/students/' + sid + '/payments',
        { dueDayOfMonth: newDay, dueDate: pay.dueDate }));
    });
    Promise.all(fbUpds).catch(function(e){ console.warn('fb:', e); });
  }

  DATA.groups[gid].coursePrice = coursePrice || null;
  DATA.groups[gid].payDueDay   = newDay || null;
  saveLocal();
  renderPayments();
  if (typeof renderHisobKitob === 'function') renderHisobKitob();
  toast('✅ Saqlandi' + (newDay ? ' · Har oy ' + newDay + '-sana' : ''));
  fbUpdate('groups/' + gid, { coursePrice: coursePrice||null, payDueDay: newDay||null })
    .catch(function(e){ console.warn('fb:', e); });
};

window.renderPayments = function() {
  const gid = document.getElementById('pay-group').value;
  const container = document.getElementById('payments-list');
  if (!gid || !DATA.groups[gid]) { container.innerHTML=''; return; }
  const g = DATA.groups[gid];
  const coursePrice    = getEffectivePrice(g);
  const globalPrice    = DATA.settings && DATA.settings.globalCoursePrice;
  const isGlobalPrice  = coursePrice && !g.coursePrice;
  const students = Object.entries(g.students||{}).sort(function(a,b){ return a[1].name.localeCompare(b[1].name); });

  // ─── Guruh to'lov sozlamalari kartasi ──────────────────────
  const dueDayVal  = g.payDueDay || '';
  const dueDayHint = g.payDueDay
    ? `<div style="font-size:.65rem;color:var(--green);margin-top:3px">📅 Har oy ${g.payDueDay}-sanada</div>`
    : '';
  const globalHint = isGlobalPrice
    ? `<div style="font-size:.65rem;color:#F59E0B;margin-top:3px">⚠️ Standart narx ishlatilmoqda</div>` : '';

  const settingsCard = `
  <div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:12px">
    <div style="font-size:.68rem;font-weight:800;color:var(--text2);letter-spacing:.5px;margin-bottom:10px">⚙️ TO'LOV SOZLAMALARI</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
      <div>
        <div style="font-size:.68rem;color:var(--text2);font-weight:600;margin-bottom:5px">💰 Kurs narxi (so'm)</div>
        <input type="number" id="gps-price" value="${g.coursePrice||''}" placeholder="${globalPrice?globalPrice:'Masalan: 150000'}"
          style="width:100%;box-sizing:border-box;padding:9px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:9px;color:var(--text1);font-size:.88rem;font-weight:700;outline:none;font-family:inherit">
        ${globalHint}
      </div>
      <div>
        <div style="font-size:.68rem;color:var(--text2);font-weight:600;margin-bottom:5px">📅 To'lov kuni (1-31)</div>
        <input type="number" id="gps-day" value="${dueDayVal}" placeholder="5" min="1" max="31"
          style="width:100%;box-sizing:border-box;padding:9px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:9px;color:var(--text1);font-size:.88rem;font-weight:700;outline:none;font-family:inherit">
        ${dueDayHint}
      </div>
    </div>
    <div style="display:flex;gap:7px">
      <button onclick="saveGroupPaySettings('${gid}')"
        style="flex:1;padding:9px 8px;background:var(--blue);border:none;border-radius:9px;font-size:.78rem;font-weight:700;color:#fff;cursor:pointer">💾 Saqlash</button>
      ${coursePrice ? `<button onclick="bulkUpdatePayAmounts('${gid}')"
        style="flex:1;padding:9px 8px;background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.3);border-radius:9px;font-size:.78rem;font-weight:700;color:var(--blue);cursor:pointer">🔄 Summani yangilash</button>` : ''}
    </div>
  </div>`;

  if (!students.length) {
    container.innerHTML = settingsCard + '<div class="empty"><div class="ei">👤</div><p>O\'quvchi yo\'q</p></div>';
    return;
  }

  // ─── Statistika ─────────────────────────────────────────────
  const paidCount  = students.filter(function(e){ return e[1].payments&&e[1].payments.paid; }).length;
  const totalCount = students.length;
  const summaryBar = `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding:0 2px">
    <span style="font-size:.75rem;font-weight:700;color:var(--text2)">${totalCount} ta o'quvchi</span>
    <span style="font-size:.75rem;font-weight:800;color:${paidCount===totalCount?'#10B981':paidCount>0?'#F59E0B':'#EF4444'}">
      ✅ ${paidCount} / ${totalCount} to'lagan</span>
  </div>`;

  // ─── Inline to'lov kartalari ────────────────────────────────
  const nowBase = new Date(); nowBase.setHours(0,0,0,0);

  const list = students.map(function(entry){
    const sid = entry[0], s = entry[1];
    const pay = s.payments || {};

    // To'lov sanasi: dueDayOfMonth → dinamik hisoblash
    const effectiveDue = pay.dueDayOfMonth
      ? nextDueDateFromDay(pay.dueDayOfMonth)
      : (pay.dueDate || today());

    const defaultAmt  = pay.amount || coursePrice || '';
    const defaultDisc = pay.discount || '';
    const defaultPaid = !!pay.paid;

    // Qolgan kunlar badge
    let dueBadge = '', borderColor = 'var(--border)';
    const dueTmp = new Date(effectiveDue); dueTmp.setHours(0,0,0,0);
    const dl = Math.round((dueTmp - nowBase) / 86400000);
    if (dl < 0) {
      dueBadge = `<span style="font-size:.58rem;background:#EF4444;color:#fff;padding:1px 6px;border-radius:6px;margin-left:5px">🚨 ${Math.abs(dl)}k o'tdi</span>`;
      borderColor = '#EF444440';
    } else if (dl === 0) {
      dueBadge = `<span style="font-size:.58rem;background:#EF4444;color:#fff;padding:1px 6px;border-radius:6px;margin-left:5px">🔔 Bugun!</span>`;
      borderColor = '#EF444440';
    } else if (dl <= 5) {
      dueBadge = `<span style="font-size:.58rem;background:#F59E0B;color:#fff;padding:1px 6px;border-radius:6px;margin-left:5px">⚠️ ${dl}k</span>`;
      borderColor = '#F59E0B40';
    }

    // Qabul sanasi hintti
    const joinHint = s.joinDate
      ? `<span style="font-size:.58rem;color:var(--text3)"> · qabul: ${fmtDate(s.joinDate)}</span>`
      : '';

    // To'lov tsikli hint
    const cycleHint = pay.dueDayOfMonth
      ? `<div style="font-size:.6rem;color:#10B981;margin-top:4px">📅 Har oy ${pay.dueDayOfMonth}-sana · keyingi: ${fmtDate(effectiveDue)}</div>`
      : '';

    // To'lov tarixi
    const history = pay.history || [];
    const histHtml = history.length ? `
      <div style="margin-top:8px;border-top:1px solid var(--border);padding-top:7px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
          <span style="font-size:.6rem;font-weight:700;color:var(--text2)">📋 To'lov tarixi (${history.length})</span>
          <button onclick="deletePayHistory('${sid}','${gid}')"
            style="font-size:.6rem;padding:2px 8px;background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);
                   border-radius:6px;color:#EF4444;cursor:pointer;font-weight:700">🗑️ Tozalash</button>
        </div>
        ${history.slice().reverse().slice(0,3).map(function(h){
          return `<div style="display:flex;justify-content:space-between;font-size:.62rem;color:var(--text2);padding:2px 0">
            <span>${fmtDate(h.date)}</span>
            <span style="font-weight:700;color:#10B981">${(h.amount||0).toLocaleString()} so'm</span>
          </div>`;
        }).join('')}
        ${history.length > 3 ? `<div style="font-size:.58rem;color:var(--text3);text-align:center;margin-top:2px">+ yana ${history.length-3} ta</div>` : ''}
      </div>` : '';

    return `
    <div style="background:var(--bg2);border:1px solid ${borderColor};border-radius:12px;padding:12px 13px;margin-bottom:8px">
      <!-- Ism + toggle -->
      <div style="display:flex;align-items:center;gap:9px;margin-bottom:10px">
        <div id="pi-av-${sid}" style="width:33px;height:33px;border-radius:50%;
             background:${defaultPaid?'#10B981':'var(--blue)'};
             display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:.85rem;flex-shrink:0">
          ${s.name.charAt(0)}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:.86rem;font-weight:700;color:var(--text1)">${s.name}${dueBadge}</div>
          <div id="pi-st-${sid}" style="font-size:.62rem;font-weight:700;color:${defaultPaid?'#10B981':'#F59E0B'}">
            ${defaultPaid?'✅ To\'langan':'⏳ Kutilmoqda'}${joinHint}</div>
        </div>
        <!-- data-on attribute bilan toggle — style.background dan mustaqil -->
        <button id="pi-tog-${sid}" data-on="${defaultPaid?'1':'0'}" onclick="togglePayInline('${sid}')"
          style="width:52px;height:28px;border-radius:14px;border:none;cursor:pointer;position:relative;flex-shrink:0;
                 background:${defaultPaid?'#10B981':'rgba(255,255,255,.15)'};transition:background .2s">
          <div style="position:absolute;top:3px;${defaultPaid?'right:3px':'left:3px'};width:22px;height:22px;
               border-radius:50%;background:#fff;transition:all .2s;box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>
        </button>
      </div>
      <!-- Inputlar -->
      <div style="display:grid;grid-template-columns:1fr 70px 1fr;gap:6px">
        <div>
          <div style="font-size:.58rem;color:var(--text2);font-weight:700;margin-bottom:3px">TO'LOV (SO'M)</div>
          <input type="number" id="pi-amt-${sid}" value="${defaultAmt}" placeholder="${coursePrice||'Summa'}"
            style="width:100%;box-sizing:border-box;padding:7px 8px;background:var(--bg3);border:1px solid var(--border);
                   border-radius:8px;color:var(--text1);font-size:.82rem;font-weight:700;outline:none;font-family:inherit">
        </div>
        <div>
          <div style="font-size:.58rem;color:var(--text2);font-weight:700;margin-bottom:3px">CHEGIRMA%</div>
          <input type="number" id="pi-disc-${sid}" value="${defaultDisc}" placeholder="0" min="0" max="100"
            style="width:100%;box-sizing:border-box;padding:7px 8px;background:var(--bg3);border:1px solid var(--border);
                   border-radius:8px;color:var(--text1);font-size:.82rem;font-weight:700;outline:none;font-family:inherit">
        </div>
        <div>
          <div style="font-size:.58rem;color:var(--text2);font-weight:700;margin-bottom:3px">TO'LOV SANASI</div>
          <input type="text" id="pi-date-${sid}" value="${isoToDisplay(effectiveDue)}" placeholder="KK.OO.YYYY" maxlength="10"
            oninput="formatDateInput(this)"
            style="width:100%;box-sizing:border-box;padding:7px 8px;background:var(--bg3);border:1px solid var(--border);
                   border-radius:8px;color:var(--text1);font-size:.82rem;font-weight:700;outline:none;font-family:inherit">
        </div>
      </div>
      ${cycleHint}
      ${histHtml}
    </div>`;
  }).join('');

  // ─── Bitta "Hammasini saqlash" tugmasi ──────────────────────
  const saveAllBtn = `
  <div style="position:sticky;bottom:0;padding:10px 0 2px;background:var(--bg1)">
    <button onclick="saveAllPayments('${gid}')"
      style="width:100%;padding:13px;background:var(--blue);border:none;border-radius:12px;
             font-size:.9rem;font-weight:800;color:#fff;cursor:pointer;letter-spacing:.3px">
      💾 Hammasini saqlash (${students.length} ta o'quvchi)
    </button>
  </div>`;

  container.innerHTML = settingsCard + summaryBar + list + saveAllBtn;
};

// ─── Inline toggle — data-on attribute orqali (style.background emas) ──────
window.togglePayInline = function(sid) {
  const tog   = document.getElementById('pi-tog-' + sid);
  const av    = document.getElementById('pi-av-'  + sid);
  const st    = document.getElementById('pi-st-'  + sid);
  if (!tog) return;
  const isOn  = tog.dataset.on !== '1';      // yangi holat
  tog.dataset.on = isOn ? '1' : '0';
  tog.style.background = isOn ? '#10B981' : 'rgba(255,255,255,.15)';
  const thumb = tog.querySelector('div');
  if (thumb) { thumb.style.right = isOn ? '3px' : 'auto'; thumb.style.left = isOn ? 'auto' : '3px'; }
  if (av)  av.style.background = isOn ? '#10B981' : 'var(--blue)';
  if (st)  { st.textContent = isOn ? '✅ To\'langan' : '⏳ Kutilmoqda'; st.style.color = isOn ? '#10B981' : '#F59E0B'; }
};

// ─── Hammasini saqlash — data-on orqali + tarix ────────────────
window.saveAllPayments = async function(gid) {
  const g = DATA.groups[gid];
  if (!g) return;
  const students = Object.entries(g.students || {});
  const fbUpdates = [];
  let count = 0;

  for (const [sid] of students) {
    const amtEl  = document.getElementById('pi-amt-'  + sid);
    const discEl = document.getElementById('pi-disc-' + sid);
    const dateEl = document.getElementById('pi-date-' + sid);
    const togEl  = document.getElementById('pi-tog-'  + sid);
    if (!amtEl) continue;

    const amount        = parseInt(amtEl.value)    || 0;
    const discount      = parseFloat(discEl.value) || 0;
    const dateIso       = displayToIso(dateEl.value) || today();
    const paid          = togEl.dataset.on === '1';   // data-on dan o'qiymiz
    const prevPay       = DATA.groups[gid].students[sid].payments || {};
    const wasPaid       = !!prevPay.paid;

    // dueDayOfMonth kiritilgan sanadan
    const dueDayOfMonth = new Date(dateIso + 'T00:00:00').getDate();

    // keyingi to'lov sanasi
    let dueDate = dateIso;
    if (paid) {
      const nowD = new Date(); nowD.setHours(0,0,0,0);
      const y = nowD.getFullYear(), mo = nowD.getMonth();
      let next = new Date(y, mo, dueDayOfMonth);
      if (next <= nowD) next = new Date(y, mo + 1, dueDayOfMonth);
      dueDate = localIso(next);
    }

    // Tarixga qo'shamiz: faqat yangi to'langan bo'lsa
    const history = Array.isArray(prevPay.history) ? prevPay.history.slice() : [];
    if (paid && !wasPaid && amount > 0) {
      history.push({ date: dateIso, amount });
    }

    const payData = { amount, date: dateIso, paid, discount, dueDate, dueDayOfMonth, history };
    DATA.groups[gid].students[sid].payments = payData;
    fbUpdates.push(fbSet('groups/' + gid + '/students/' + sid + '/payments', payData));
    count++;
  }

  saveLocal();
  renderPayments();
  if (window._payDatesVisible) renderPayDates();
  toast('✅ ' + count + ' ta o\'quvchi to\'lovi saqlandi');
  Promise.all(fbUpdates).catch(function(e){ console.warn('fb:', e); });
};

// ─── To'lov tarixini o'chirish ────────────────────────────────
window.deletePayHistory = async function(sid, gid) {
  if (!confirm('To\'lov tarixini tozalash? Bu amalni qaytarib bo\'lmaydi.')) return;
  if (!DATA.groups[gid]?.students?.[sid]) return;
  const pay = DATA.groups[gid].students[sid].payments || {};
  pay.history = [];
  DATA.groups[gid].students[sid].payments = pay;
  saveLocal();
  renderPayments();
  toast('🗑️ Tarix tozalandi');
  // fbRemove — bo'sh array Firebase da muammo beradi, node ni o'chiramiz
  fbRemove('groups/' + gid + '/students/' + sid + '/payments/history')
    .catch(function(e){ console.warn('fb:', e); });
};

window.calcPayAmount = function() {
  const gid = document.getElementById('pay-group-id').value;
  const g = DATA.groups[gid];
  const coursePrice = getEffectivePrice(g);
  if (!coursePrice) return;
  const discount = parseFloat(document.getElementById('pay-discount').value) || 0;
  const amount = Math.round(coursePrice * (1 - discount / 100));
  document.getElementById('pay-amount').value = amount > 0 ? amount : 0;
  const hint = document.getElementById('pay-amount-hint');
  if (hint) {
    if (discount > 0) {
      hint.style.display = '';
      hint.textContent = `${coursePrice.toLocaleString()} − ${discount}% = ${amount.toLocaleString()} so'm`;
    } else {
      hint.style.display = 'none';
    }
  }
};

window.openPayment = function(sid, gid) {
  const s = DATA.groups[gid]?.students?.[sid];
  if (!s) return;
  const g = DATA.groups[gid];
  const pay = s.payments || {};
  const coursePrice = getEffectivePrice(g);
  document.getElementById('pay-modal-title').textContent = s.name + ' — To\'lov';
  // Course price display
  const infoEl = document.getElementById('pay-course-info');
  const priceEl = document.getElementById('pay-course-price-lbl');
  if (infoEl) infoEl.style.display = coursePrice ? '' : 'none';
  if (priceEl && coursePrice) priceEl.textContent = coursePrice.toLocaleString() + ' so\'m';
  // Discount
  const discountEl = document.getElementById('pay-discount');
  if (discountEl) discountEl.value = pay.discount || '';
  // Hint
  const hint = document.getElementById('pay-amount-hint');
  if (hint) hint.style.display = 'none';
  // Amount
  if (coursePrice && !pay.amount) {
    const disc = pay.discount || 0;
    document.getElementById('pay-amount').value = Math.round(coursePrice * (1 - disc / 100));
  } else {
    document.getElementById('pay-amount').value = pay.amount || '';
  }
  // Sana: dueDayOfMonth → keyingi to'lov sanasi, yo'q bo'lsa dueDate, yo'q bo'lsa oxirgi to'lov
  let prefillDate = today();
  if (pay.dueDayOfMonth) {
    prefillDate = nextDueDateFromDay(pay.dueDayOfMonth);
  } else if (pay.dueDate) {
    prefillDate = pay.dueDate;
  } else if (pay.date) {
    prefillDate = pay.date;
  }
  document.getElementById('pay-date').value = isoToDisplay(prefillDate);
  const tog = document.getElementById('pay-toggle');
  if (pay.paid) tog.classList.add('on'); else tog.classList.remove('on');
  document.getElementById('pay-stu-id').value = sid;
  document.getElementById('pay-group-id').value = gid;
  openModal('m-payment');
};

window.savePayment = async function() {
  const sid = document.getElementById('pay-stu-id').value;
  const gid = document.getElementById('pay-group-id').value;
  const amount   = parseInt(document.getElementById('pay-amount').value) || 0;
  const date     = displayToIso(document.getElementById('pay-date').value) || today();
  const paid     = document.getElementById('pay-toggle').classList.contains('on');
  const discount = parseFloat(document.getElementById('pay-discount').value) || 0;

  // dueDayOfMonth: kiritilgan sanadan olinadi (yoki avvalgisidan)
  const prevPay = DATA.groups[gid]?.students?.[sid]?.payments || {};
  const dueDayOfMonth = new Date(date + 'T00:00:00').getDate();
  let dueDate = date; // kiritilgan sana = joriy to'lov sanasi

  // To'langan bo'lsa → keyingi oyga siljitamiz
  if (paid) {
    const nowD = new Date(); nowD.setHours(0,0,0,0);
    const y = nowD.getFullYear(), mo = nowD.getMonth();
    let next = new Date(y, mo, dueDayOfMonth);
    if (next <= nowD) next = new Date(y, mo + 1, dueDayOfMonth);
    dueDate = localIso(next);
  }

  const payData = { amount, date, paid, discount, dueDate, dueDayOfMonth };
  if (DATA.groups[gid]?.students?.[sid]) DATA.groups[gid].students[sid].payments = payData;
  saveLocal();
  closeModal('m-payment');
  renderPayments();
  if (window._payDatesVisible) renderPayDates();
  const msg = paid
    ? `✅ To'landi! Keyingi to'lov: ${fmtDate(dueDate)}`
    : '✅ To\'lov saqlandi';
  toast(msg);
  fbSet(`groups/${gid}/students/${sid}/payments`, payData).catch(e => console.warn('fb:', e));
};

// ============================================================
// PAYMENTS — TO'LOV SANASI (GRAFIK)
// ============================================================

// To'lov dueDate saqlash
window.saveDueDate = async function(sid, gid, displayVal) {
  if (!DATA.groups[gid]?.students?.[sid]) return;
  const dateVal = displayToIso(displayVal);
  const dueDayOfMonth = dateVal ? new Date(dateVal + 'T00:00:00').getDate() : null;
  DATA.groups[gid].students[sid].payments = DATA.groups[gid].students[sid].payments || {};
  DATA.groups[gid].students[sid].payments.dueDate = dateVal || null;
  DATA.groups[gid].students[sid].payments.dueDayOfMonth = dueDayOfMonth || null;
  saveLocal();
  renderPayDates();
  const dayHint = dueDayOfMonth ? ` (har oy ${dueDayOfMonth}-sana)` : '';
  toast('✅ To\'lov sanasi saqlandi' + dayHint);
  fbUpdate('groups/' + gid + '/students/' + sid + '/payments', { dueDate: dateVal || null, dueDayOfMonth: dueDayOfMonth || null })
    .catch(function(e){ console.warn('fb:', e); });
};

// To'lov sanasi tab render
window.renderPayDates = function() {
  window._payDatesVisible = true;
  const container = document.getElementById('pay-dates-content');
  if (!container) return;
  const groups = DATA.groups || {};

  // Umumiy statistika
  const nowD = new Date(); nowD.setHours(0,0,0,0);
  let totalStu = 0, overdueCount = 0, warnCount = 0, okCount = 0;

  // Guruhlar bo'yicha render
  let groupsHtml = '';

  Object.entries(groups).forEach(function([gid, g]) {
    const students = Object.entries(g.students || {})
      .sort(function(a,b){ return a[1].name.localeCompare(b[1].name); });
    if (!students.length) return;

    const stuCards = students.map(function([sid, s]) {
      const pay = s.payments || {};
      // Takrorlanuvchi kun bo'lsa — har doim dinamik hisoblaymiz
      const dueDate = pay.dueDayOfMonth
        ? nextDueDateFromDay(pay.dueDayOfMonth)
        : (pay.dueDate || '');

      // --- kun hisobi ---
      let daysLeft = null, barPct = 0, barColor = '#10B981', badgeHtml = '', badgeBg = '';
      if (dueDate) {
        const dueD = new Date(dueDate); dueD.setHours(0,0,0,0);
        daysLeft = Math.round((dueD - nowD) / 86400000);
        totalStu++;
        if (daysLeft < 0)       { overdueCount++; }
        else if (daysLeft <= 3) { warnCount++; }
        else                    { okCount++; }

        // Bar: 30 kunlik sikl
        const cycleStart = new Date(dueD);
        cycleStart.setMonth(cycleStart.getMonth() - 1);
        const totalCycleDays = Math.round((dueD - cycleStart) / 86400000) || 30;
        const elapsed        = Math.round((nowD - cycleStart) / 86400000);
        barPct = Math.max(0, Math.min(100, (elapsed / totalCycleDays) * 100));

        if      (daysLeft < 0)  { barColor = '#EF4444'; }
        else if (daysLeft <= 3) { barColor = '#F59E0B'; }
        else if (daysLeft <= 7) { barColor = '#3B82F6'; }
        else                    { barColor = '#10B981'; }

        if (daysLeft < 0) {
          badgeBg = '#EF4444';
          badgeHtml = `<span style="background:${badgeBg};color:#fff;font-size:.62rem;font-weight:800;padding:3px 9px;border-radius:99px;white-space:nowrap">🚨 ${Math.abs(daysLeft)}k o'tdi</span>`;
        } else if (daysLeft === 0) {
          badgeBg = '#EF4444';
          badgeHtml = `<span style="background:${badgeBg};color:#fff;font-size:.62rem;font-weight:800;padding:3px 9px;border-radius:99px;white-space:nowrap">🔔 Bugun!</span>`;
        } else if (daysLeft <= 3) {
          badgeBg = '#F59E0B';
          badgeHtml = `<span style="background:${badgeBg};color:#fff;font-size:.62rem;font-weight:800;padding:3px 9px;border-radius:99px;white-space:nowrap">⚠️ ${daysLeft} kun</span>`;
        } else {
          badgeBg = 'rgba(16,185,129,.15)';
          badgeHtml = `<span style="background:${badgeBg};color:#10B981;font-size:.62rem;font-weight:800;padding:3px 9px;border-radius:99px;white-space:nowrap">${daysLeft} kun</span>`;
        }
      }

      // Timeline bar
      const prevDate = dueDate
        ? (function(){
            const d = new Date(dueDate + 'T00:00:00'); d.setMonth(d.getMonth()-1);
            return localIso(d);
          })()
        : '';
      const timelineHtml = dueDate ? `
        <div style="margin-top:10px">
          <div style="position:relative;height:10px;background:var(--bg3);border-radius:5px;overflow:visible;margin-bottom:4px">
            <!-- doldi qismi -->
            <div style="position:absolute;left:0;top:0;height:100%;width:${barPct}%;background:${barColor};border-radius:5px;transition:width .4s ease"></div>
            <!-- bugungi kun markeri -->
            <div style="position:absolute;top:-3px;left:${barPct}%;transform:translateX(-50%);width:16px;height:16px;border-radius:50%;background:${barColor};border:2px solid var(--bg1);box-shadow:0 0 0 2px ${barColor}40;z-index:2"></div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:.6rem;color:var(--text3)">${fmtDate(prevDate)}</span>
            <span style="font-size:.65rem;color:${barColor};font-weight:800">
              ${daysLeft < 0 ? '🚨 Muddat o\'tdi' : daysLeft === 0 ? '🔔 Bugun to\'lov!' : '📅 ' + daysLeft + ' kun qoldi'}
            </span>
            <span style="font-size:.6rem;color:var(--text3)">${fmtDate(dueDate)}</span>
          </div>
        </div>` : `<div style="margin-top:8px;font-size:.68rem;color:var(--text3);font-style:italic">📅 To'lov sanasi belgilanmagan</div>`;

      return `
      <div style="background:var(--bg2);border:1px solid ${daysLeft !== null && daysLeft <= 3 ? barColor+'60' : 'var(--border)'};
                  border-radius:12px;padding:12px 14px;margin-bottom:9px;
                  ${daysLeft !== null && daysLeft <= 3 ? 'box-shadow:0 0 0 1px '+barColor+'30' : ''}">
        <!-- Sarlavha qator -->
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <div style="width:34px;height:34px;border-radius:50%;background:${pay.paid?'#10B981':'var(--blue)'};
                      display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;
                      font-size:.85rem;flex-shrink:0">${s.name.charAt(0)}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:.88rem;font-weight:700;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.name}</div>
            <div style="font-size:.62rem;color:${pay.paid?'#10B981':'#F59E0B'};font-weight:700;margin-top:1px">
              ${pay.paid?'✅ To\'langan':'⏳ Kutilmoqda'}
              ${pay.amount ? ' · ' + pay.amount.toLocaleString() + ' so\'m' : ''}
            </div>
          </div>
          ${badgeHtml}
        </div>
        <!-- Sana input -->
        <div style="display:flex;gap:7px;align-items:center">
          <div style="font-size:.65rem;color:var(--text2);font-weight:600;flex-shrink:0">📅 To'lov kuni:</div>
          <input type="text" id="due-${gid}-${sid}" value="${isoToDisplay(dueDate)}" placeholder="KK.OO.YYYY" maxlength="10"
            oninput="formatDateInput(this)"
            style="flex:1;padding:7px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:9px;
                   color:var(--text1);font-size:.82rem;font-weight:600;outline:none;font-family:inherit">
          <button onclick="saveDueDate('${sid}','${gid}',document.getElementById('due-${gid}-${sid}').value)"
            style="padding:7px 13px;background:var(--blue);border:none;border-radius:9px;color:#fff;
                   font-size:.78rem;font-weight:700;cursor:pointer;flex-shrink:0">💾</button>
        </div>
        ${pay.dueDayOfMonth ? `<div style="font-size:.62rem;color:#10B981;margin-top:4px">🔄 Har oy ${pay.dueDayOfMonth}-sanada takrorlanadi</div>` : ''}
        ${timelineHtml}
      </div>`;
    }).join('');

    groupsHtml += `
    <div style="margin-bottom:20px">
      <div style="font-size:.7rem;font-weight:800;color:var(--text2);letter-spacing:.5px;
                  margin-bottom:10px;display:flex;align-items:center;gap:6px">
        <span style="background:var(--blue);color:#fff;padding:2px 10px;border-radius:99px">${g.name}</span>
        <span style="color:var(--text3)">${students.length} ta o'quvchi</span>
      </div>
      ${stuCards}
    </div>`;
  });

  if (!groupsHtml) {
    container.innerHTML = '<div class="empty"><div class="ei">📅</div><p>Guruhlar yo\'q</p></div>';
    return;
  }

  // Umumiy statistika kartasi
  const statCard = `
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">
    <div style="background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.25);border-radius:12px;padding:10px;text-align:center">
      <div style="font-size:1.3rem;font-weight:800;color:#10B981">${okCount}</div>
      <div style="font-size:.62rem;color:#10B981;font-weight:600">OK</div>
    </div>
    <div style="background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25);border-radius:12px;padding:10px;text-align:center">
      <div style="font-size:1.3rem;font-weight:800;color:#F59E0B">${warnCount}</div>
      <div style="font-size:.62rem;color:#F59E0B;font-weight:600">Yaqinlashmoqda</div>
    </div>
    <div style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);border-radius:12px;padding:10px;text-align:center">
      <div style="font-size:1.3rem;font-weight:800;color:#EF4444">${overdueCount}</div>
      <div style="font-size:.62rem;color:#EF4444;font-weight:600">Muddati o'tdi</div>
    </div>
  </div>`;

  container.innerHTML = statCard + groupsHtml;
};

// ============================================================
// PAYMENTS — HISOB-KITOB
// ============================================================
const _OY = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
function _fmtMonth(ym) {
  const [y, m] = ym.split('-');
  return _OY[parseInt(m, 10) - 1] + ' ' + y;
}

/**
 * To'lov qaysi oyga tegishli ekanligini aniqlash.
 * Misol: payDate=2026-04-23, dueDate=2026-05-23
 *   → Aprel: 8 kun, May: 23 kun → May (ko'p)
 * Agar dueDate yo'q bo'lsa, payDate + 1 oy ishlatiladi.
 */
function getPayBillingMonth(payDate, dueDate) {
  if (!payDate) return null;
  const start = new Date(payDate + 'T00:00:00');
  let end;
  if (dueDate) {
    end = new Date(dueDate + 'T00:00:00');
  } else {
    end = new Date(start);
    end.setMonth(end.getMonth() + 1);
  }
  if (end <= start) return localIso(start).slice(0, 7);

  // Har bir kun qaysi oyda ekanligini hisoblaymiz
  const monthCounts = {};
  const cur = new Date(start);
  while (cur < end) {
    const ym = localIso(cur).slice(0, 7);
    monthCounts[ym] = (monthCounts[ym] || 0) + 1;
    cur.setDate(cur.getDate() + 1);
  }

  // Ko'p kun bo'lgan oy = billing oy
  let bestYM = null, bestCount = 0;
  Object.entries(monthCounts).forEach(function(e) {
    if (e[1] > bestCount) { bestCount = e[1]; bestYM = e[0]; }
  });
  return bestYM;
}

window.switchPayTab = function(tab, btn) {
  document.querySelectorAll('.pay-tab-btn').forEach(b => b.classList.remove('btn-primary'));
  if (btn) btn.classList.add('btn-primary');
  document.getElementById('pay-tab-list').style.display       = tab === 'list'        ? '' : 'none';
  document.getElementById('pay-tab-dates').style.display      = tab === 'dates'       ? '' : 'none';
  document.getElementById('pay-tab-hisobkitob').style.display = tab === 'hisobkitob'  ? '' : 'none';
  if (tab === 'hisobkitob') renderHisobKitob();
  if (tab === 'dates')      renderPayDates();
};

// Hisob-kitob yordamchi: raqamni chiroyli ko'rsatish
function _fmtSom(n) {
  if (!n || isNaN(n)) return '0';
  n = Math.round(n);
  if (n >= 1000000) return (n/1000000).toFixed(n%1000000===0?0:1) + ' mln';
  if (n >= 1000)    return Math.round(n/1000) + 'K';
  return n.toString();
}
function _fmtSomFull(n) {
  return Math.round(n||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

window.renderHisobKitob = function() {
  const el = document.getElementById('hisobkitob-content');
  if (!el) return;
  const groups   = DATA.groups || {};
  const mode     = window._hisobMode || 'month';
  const nowD     = new Date(); nowD.setHours(0,0,0,0);
  const nowYM    = localIso(nowD).slice(0, 7);
  const nowMonthName = _fmtMonth(nowYM);

  // ─── Mode toggle ─────────────────────────────────────────
  const modeToggle = `
  <div style="display:flex;gap:6px;margin-bottom:14px;background:var(--bg2);padding:4px;border-radius:12px">
    <button onclick="window._hisobMode='month';renderHisobKitob()"
      style="flex:1;padding:8px 4px;border:none;border-radius:9px;font-size:.8rem;font-weight:700;
             cursor:pointer;font-family:inherit;
             background:${mode==='month'?'var(--blue)':'transparent'};
             color:${mode==='month'?'#fff':'var(--text2)'}">
      📅 Bu oy (${nowMonthName})
    </button>
    <button onclick="window._hisobMode='all';renderHisobKitob()"
      style="flex:1;padding:8px 4px;border:none;border-radius:9px;font-size:.8rem;font-weight:700;
             cursor:pointer;font-family:inherit;
             background:${mode==='all'?'var(--blue)':'transparent'};
             color:${mode==='all'?'#fff':'var(--text2)'}">
      📊 Umumiy tarix
    </button>
  </div>`;

  // ═══════════════════════════════════════════════════════
  // "BU OY" MODE
  // ═══════════════════════════════════════════════════════
  if (mode === 'month') {
    let grandPaid=0, grandUnpaid=0, grandCollected=0, grandExpected=0;

    const groupCards = Object.entries(groups).map(function(ge) {
      const gid = ge[0], g = ge[1];
      const coursePrice = getEffectivePrice(g);
      const allStudents = Object.entries(g.students || {});
      if (!allStudents.length) return '';

      // Har bir o'quvchi uchun shu oy uchun to'lagan/to'lamagan aniqlash
      const paidList   = [];
      const unpaidList = [];

      allStudents.forEach(function(se) {
        const s = se[1];
        const pay = s.payments || {};
        // Billing oy — qaysi oy uchun to'lagan?
        const billingYM = pay.paid && pay.date
          ? getPayBillingMonth(pay.date, pay.dueDate)
          : null;

        if (pay.paid && billingYM === nowYM) {
          // Bu oy uchun to'lagan ✅
          paidList.push({ name: s.name, amount: pay.amount || 0, dueDate: pay.dueDate });
        } else {
          // To'lamagan yoki boshqa oy uchun to'lagan
          // Shu oy uchun to'lashi kerakmi? dueDate shu oyda yoki o'tib ketgan bo'lsa
          const shouldPayThisMonth = !pay.dueDate
            || pay.dueDate.slice(0,7) <= nowYM; // muddat shu oy yoki o'tgan
          if (shouldPayThisMonth) {
            unpaidList.push({ name: s.name, amount: coursePrice || pay.amount || 0, dueDate: pay.dueDate });
          }
        }
      });

      const count    = paidList.length + unpaidList.length;
      if (!count) return '';

      const collected = paidList.reduce(function(a,s){ return a+(s.amount||0); }, 0);
      const expected  = coursePrice ? coursePrice * count : 0;
      const debt      = Math.max(0, expected - collected);
      const pct       = count ? Math.round(paidList.length / count * 100) : 0;
      const bColor    = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';

      grandPaid      += paidList.length;
      grandUnpaid    += unpaidList.length;
      grandCollected += collected;
      grandExpected  += expected;

      // To'lamaganlar ro'yxati (ochish/yopish)
      const unpaidRows = unpaidList.map(function(s) {
        const nowTmp = new Date(); nowTmp.setHours(0,0,0,0);
        const dueD   = s.dueDate ? new Date(s.dueDate + 'T00:00:00') : null;
        const dl     = dueD ? Math.round((dueD - nowTmp) / 86400000) : null;
        const dlTxt  = dl !== null
          ? (dl < 0 ? `<span style="color:#EF4444;font-size:.6rem">${Math.abs(dl)}k o'tdi</span>`
           : dl === 0 ? `<span style="color:#EF4444;font-size:.6rem">Bugun!</span>`
           : `<span style="color:#F59E0B;font-size:.6rem">${dl}k qoldi</span>`)
          : '';
        return `<div style="display:flex;justify-content:space-between;align-items:center;
                  padding:7px 0;border-bottom:1px solid var(--border)">
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:.82rem;font-weight:600">${s.name}</span>
            ${dlTxt}
          </div>
          <span style="font-size:.75rem;font-weight:700;color:#EF4444">
            ${s.amount ? s.amount.toLocaleString()+' so\'m' : '—'}
          </span>
        </div>`;
      }).join('');

      const unpaidSection = unpaidList.length
        ? `<details style="margin-top:8px">
            <summary style="cursor:pointer;font-size:.72rem;color:#EF4444;font-weight:700;list-style:none;
                           display:flex;align-items:center;gap:4px;user-select:none">
              ▸ ❌ To'lamaganlar (${unpaidList.length} kishi) — bosing
            </summary>
            <div style="margin-top:8px;padding:0 4px">${unpaidRows}</div>
          </details>`
        : '';

      const debtRow = debt > 0
        ? `<div style="display:flex;justify-content:space-between;font-size:.7rem;padding:6px 10px;
              background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:8px;margin-top:8px">
            <span style="color:#EF4444;font-weight:600">❌ Qarzdorlik</span>
            <span style="font-weight:800;color:#EF4444">${_fmtSomFull(debt)} so'm</span>
          </div>`
        : paidList.length === count && count > 0
          ? `<div style="font-size:.7rem;padding:6px 10px;background:rgba(16,185,129,.08);
              border:1px solid rgba(16,185,129,.2);border-radius:8px;color:#10B981;font-weight:700;
              text-align:center;margin-top:8px">✅ Barcha ${count} kishi to'lagan!</div>`
          : '';

      return `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;
                           padding:14px;margin-bottom:10px">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px">
          <div>
            <div style="font-weight:700;font-size:.92rem">${g.name}</div>
            <div style="font-size:.68rem;color:var(--text2);margin-top:2px">
              ${count} ta o'quvchi · ${nowMonthName} uchun
            </div>
          </div>
          ${coursePrice
            ? `<div style="font-size:.7rem;font-weight:700;color:var(--blue);background:rgba(59,130,246,.1);
                  padding:3px 9px;border-radius:8px;flex-shrink:0">${coursePrice.toLocaleString()} so'm</div>`
            : ''}
        </div>
        <!-- progress bar -->
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <div style="flex:1;height:8px;background:var(--bg3);border-radius:4px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${bColor};border-radius:4px;transition:width .4s"></div>
          </div>
          <span style="font-size:.75rem;font-weight:800;color:${bColor};min-width:36px;text-align:right">${pct}%</span>
        </div>
        <!-- 3 stat -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:8px">
          <div style="text-align:center;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2);
                      border-radius:9px;padding:8px 4px">
            <div style="font-size:1rem;font-weight:800;color:#10B981">${paidList.length}</div>
            <div style="font-size:.6rem;color:var(--text2);margin-top:2px">✅ To'lagan</div>
          </div>
          <div style="text-align:center;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);
                      border-radius:9px;padding:8px 4px">
            <div style="font-size:1rem;font-weight:800;color:#EF4444">${unpaidList.length}</div>
            <div style="font-size:.6rem;color:var(--text2);margin-top:2px">❌ To'lamagan</div>
          </div>
          <div style="text-align:center;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2);
                      border-radius:9px;padding:8px 4px">
            <div style="font-size:.78rem;font-weight:800;color:var(--blue)">${_fmtSom(collected)}</div>
            <div style="font-size:.6rem;color:var(--text2);margin-top:2px">💰 Yig'ilgan</div>
          </div>
        </div>
        ${expected ? `<div style="display:flex;justify-content:space-between;font-size:.7rem;padding:6px 10px;
          background:var(--bg3);border-radius:8px">
          <span style="color:var(--text2)">Kutilgan (${count}×${Math.round(coursePrice/1000)}K)</span>
          <span style="font-weight:700">${_fmtSomFull(expected)} so'm</span>
        </div>` : ''}
        ${debtRow}
        ${unpaidSection}
      </div>`;
    }).filter(Boolean).join('');

    const grandCount = grandPaid + grandUnpaid;
    const grandPct   = grandCount ? Math.round(grandPaid / grandCount * 100) : 0;
    const grandBC    = grandPct >= 80 ? '#10B981' : grandPct >= 50 ? '#F59E0B' : '#EF4444';
    const grandDebt  = Math.max(0, grandExpected - grandCollected);

    const grandCard = `
    <div style="background:linear-gradient(135deg,rgba(59,130,246,.18),rgba(139,92,246,.12));
                border:1px solid rgba(59,130,246,.35);border-radius:14px;padding:16px;margin-bottom:14px">
      <div style="font-weight:800;font-size:.9rem;margin-bottom:2px">📅 ${nowMonthName}</div>
      <div style="font-size:.68rem;color:var(--text2);margin-bottom:12px">Joriy oy hisobi · ${grandCount} ta o'quvchi</div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <div style="flex:1;height:10px;background:rgba(0,0,0,.2);border-radius:5px;overflow:hidden">
          <div style="height:100%;width:${grandPct}%;background:${grandBC};border-radius:5px;transition:width .5s"></div>
        </div>
        <span style="font-size:.85rem;font-weight:800;color:${grandBC};min-width:38px;text-align:right">${grandPct}%</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:8px">
        <div style="background:rgba(16,185,129,.15);border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:1.1rem;font-weight:800;color:#10B981">${grandPaid}
            <span style="font-size:.7rem;opacity:.7"> / ${grandCount}</span></div>
          <div style="font-size:.62rem;font-weight:600;color:var(--text2);margin-top:2px">✅ To'lagan / Jami</div>
        </div>
        <div style="background:rgba(59,130,246,.15);border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:.95rem;font-weight:800;color:var(--blue)">${_fmtSomFull(grandCollected)}</div>
          <div style="font-size:.62rem;font-weight:600;color:var(--text2);margin-top:2px">💰 Yig'ilgan (so'm)</div>
        </div>
      </div>
      ${grandExpected ? `
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">
        <div style="background:rgba(0,0,0,.12);border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:.88rem;font-weight:800;color:var(--text1)">${_fmtSomFull(grandExpected)}</div>
          <div style="font-size:.62rem;font-weight:600;color:var(--text2);margin-top:2px">📋 Kutilgan jami</div>
        </div>
        <div style="background:${grandDebt?'rgba(239,68,68,.15)':'rgba(16,185,129,.12)'};border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:.88rem;font-weight:800;color:${grandDebt?'#EF4444':'#10B981'}">
            ${grandDebt ? _fmtSomFull(grandDebt)+' so\'m' : '✅ Yo\'q'}</div>
          <div style="font-size:.62rem;font-weight:600;color:var(--text2);margin-top:2px">
            ${grandDebt ? '❌ Qarzdorlik' : '✅ Qarzdorlik'}</div>
        </div>
      </div>` : ''}
    </div>`;

    el.innerHTML = modeToggle + grandCard +
      `<div style="font-size:.7rem;font-weight:800;color:var(--text2);text-transform:uppercase;
          letter-spacing:.6px;margin-bottom:8px">👥 Guruhlar bo'yicha</div>` +
      (groupCards || `<div class="empty"><div class="ei">📅</div><p>Bu oy uchun ma'lumot yo'q</p></div>`);
    return;
  }

  // ═══════════════════════════════════════════════════════
  // "UMUMIY" MODE — Oylar bo'yicha tarix
  // Billing month = getPayBillingMonth asosida guruhlash
  // ═══════════════════════════════════════════════════════
  const byMonth = {};  // key: "YYYY-MM", value: { paidList, unpaidList, collected }

  Object.entries(groups).forEach(function(ge) {
    const g = ge[1];
    Object.values(g.students || {}).forEach(function(st) {
      const pay = st.payments || {};
      if (!pay.date && !pay.dueDate) return; // ma'lumot yo'q

      if (pay.paid && pay.date) {
        // To'lagan — billing oy aniqlaymiz
        const bym = getPayBillingMonth(pay.date, pay.dueDate);
        if (!bym) return;
        if (!byMonth[bym]) byMonth[bym] = { paidList:[], unpaidList:[], collected:0, expected:0 };
        byMonth[bym].paidList.push({ name: st.name, group: g.name, amount: pay.amount||0, date: pay.date, dueDate: pay.dueDate||'' });
        byMonth[bym].collected += pay.amount||0;
      } else if (pay.dueDate) {
        // To'lamagan — dueDate oyiga qo'yamiz
        const bym = pay.dueDate.slice(0,7);
        if (!byMonth[bym]) byMonth[bym] = { paidList:[], unpaidList:[], collected:0, expected:0 };
        const courseP = getEffectivePrice(DATA.groups && Object.entries(DATA.groups).find(function(e){ return Object.values(e[1].students||{}).some(function(s2){ return s2===st; }); })?.[1] || {});
        byMonth[bym].unpaidList.push({ name: st.name, group: g.name, amount: pay.amount||courseP||0, dueDate: pay.dueDate });
      }
    });
  });

  window._payMonthData = byMonth;
  const monthEntries = Object.entries(byMonth).sort(function(a,b){ return b[0].localeCompare(a[0]); });

  // Grand summary (umumiy barcha oylar)
  let totalCollected = 0, totalPaid = 0, totalUnpaid = 0;
  monthEntries.forEach(function(me) {
    totalCollected += me[1].collected;
    totalPaid      += me[1].paidList.length;
    totalUnpaid    += me[1].unpaidList.length;
  });

  const grandCard2 = `
  <div style="background:linear-gradient(135deg,rgba(139,92,246,.18),rgba(59,130,246,.12));
              border:1px solid rgba(139,92,246,.35);border-radius:14px;padding:16px;margin-bottom:14px">
    <div style="font-weight:800;font-size:.9rem;margin-bottom:2px">📊 Umumiy tarix</div>
    <div style="font-size:.68rem;color:var(--text2);margin-bottom:12px">${monthEntries.length} oy · jami yozuv</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
      <div style="background:rgba(16,185,129,.15);border-radius:10px;padding:10px;text-align:center">
        <div style="font-size:1.1rem;font-weight:800;color:#10B981">${totalPaid}</div>
        <div style="font-size:.6rem;color:var(--text2);margin-top:2px">✅ To'lagan</div>
      </div>
      <div style="background:rgba(239,68,68,.12);border-radius:10px;padding:10px;text-align:center">
        <div style="font-size:1.1rem;font-weight:800;color:#EF4444">${totalUnpaid}</div>
        <div style="font-size:.6rem;color:var(--text2);margin-top:2px">❌ To'lamagan</div>
      </div>
      <div style="background:rgba(59,130,246,.15);border-radius:10px;padding:10px;text-align:center">
        <div style="font-size:.9rem;font-weight:800;color:var(--blue)">${_fmtSom(totalCollected)}</div>
        <div style="font-size:.6rem;color:var(--text2);margin-top:2px">💰 Yig'ilgan</div>
      </div>
    </div>
  </div>`;

  // Oylar kartasi
  const monthCards = monthEntries.length ? monthEntries.map(function(me) {
    const ym = me[0], d = me[1];
    const isCurrent = ym === nowYM;
    const tot = d.paidList.length + d.unpaidList.length;
    const pct = tot ? Math.round(d.paidList.length/tot*100) : 0;
    const bc  = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';
    return `<div style="background:var(--bg2);border:1px solid ${isCurrent?'rgba(59,130,246,.5)':'var(--border)'};
                        border-radius:12px;padding:14px;margin-bottom:8px
                        ${isCurrent?';box-shadow:0 0 0 2px rgba(59,130,246,.15)':''}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div>
          <span style="font-weight:800;font-size:.9rem">${_fmtMonth(ym)}</span>
          ${isCurrent?'<span style="font-size:.62rem;background:var(--blue);color:#fff;padding:1px 7px;border-radius:99px;margin-left:6px">Joriy oy</span>':''}
        </div>
        <div style="font-size:.7rem;font-weight:700;color:${bc}">${pct}% · ${d.paidList.length}/${tot}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <div style="flex:1;height:6px;background:var(--bg3);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${bc};border-radius:3px"></div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div onclick="showPayMonth('${ym}','paid')"
          style="background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2);
                 border-radius:9px;padding:9px;text-align:center;cursor:pointer">
          <div style="font-size:.85rem;font-weight:800;color:#10B981">${_fmtSomFull(d.collected)} so'm</div>
          <div style="font-size:.6rem;color:var(--text2);margin-top:3px">✅ To'lagan ${d.paidList.length} kishi ▸</div>
        </div>
        <div onclick="showPayMonth('${ym}','unpaid')"
          style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);
                 border-radius:9px;padding:9px;text-align:center;cursor:pointer">
          <div style="font-size:.85rem;font-weight:800;color:#EF4444">${d.unpaidList.length} ta</div>
          <div style="font-size:.6rem;color:var(--text2);margin-top:3px">❌ To'lamagan ▸</div>
        </div>
      </div>
    </div>`;
  }).join('') : `<div class="empty"><div class="ei">📊</div><p>Ma'lumot yo'q</p></div>`;

  // Bottom sheet modal: to'laganlar yoki to'lamaganlar ro'yxati
  window.showPayMonth = function(ym, type) {
    const d = (window._payMonthData||{})[ym]; if (!d) return;
    const list  = type === 'paid' ? d.paidList : d.unpaidList;
    const title = type === 'paid' ? "✅ To'laganlar" : "❌ To'lamaganlar";
    const color = type === 'paid' ? '#10B981' : '#EF4444';
    const rows  = list.length ? list.map(function(s) {
      const sub = type === 'paid'
        ? `${s.group} · ${fmtDate(s.date)}→${s.dueDate?fmtDate(s.dueDate):''}`
        : `${s.group}${s.dueDate?' · muddat: '+fmtDate(s.dueDate):''}`;
      return `<div style="display:flex;justify-content:space-between;align-items:center;
                  padding:9px 0;border-bottom:1px solid var(--border)">
        <div>
          <div style="font-weight:700;font-size:.85rem">${s.name}</div>
          <div style="font-size:.68rem;color:var(--text2)">${sub}</div>
        </div>
        <div style="font-weight:800;color:${color}">${_fmtSomFull(s.amount)} so'm</div>
      </div>`;
    }).join('') : `<div style="text-align:center;padding:24px;color:var(--text2)">Hech kim yo'q</div>`;

    const mo = document.createElement('div');
    mo.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(6px);z-index:9999;display:flex;align-items:flex-end;justify-content:center';
    mo.innerHTML = `<div style="background:var(--bg1);border-radius:18px 18px 0 0;width:100%;max-width:480px;max-height:78vh;display:flex;flex-direction:column">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 18px;border-bottom:1px solid var(--border)">
        <div>
          <div style="font-weight:800;font-size:.95rem;color:${color}">${title}</div>
          <div style="font-size:.72rem;color:var(--text2);margin-top:2px">${_fmtMonth(ym)} — ${list.length} ta</div>
        </div>
        <button onclick="this.closest('[style*=fixed]').remove()"
          style="background:var(--bg2);border:none;color:var(--text1);width:32px;height:32px;
                 border-radius:50%;font-size:1.1rem;cursor:pointer">✕</button>
      </div>
      <div style="overflow-y:auto;padding:0 18px 24px">${rows}</div>
    </div>`;
    mo.addEventListener('click', function(e){ if (e.target === mo) mo.remove(); });
    document.body.appendChild(mo);
  };

  el.innerHTML = modeToggle + grandCard2 +
    `<div style="font-size:.7rem;font-weight:800;color:var(--text2);text-transform:uppercase;
        letter-spacing:.6px;margin-bottom:8px">🗓 Oylar bo'yicha</div>` +
    monthCards;
};

// ============================================================
// VIDEOS
// ============================================================
function getYoutubeEmbedUrl(url) {
  if (!url) return '';
  url = url.trim();
  if (url.includes('youtube.com/embed/')) {
    const m = url.match(/youtube\.com\/embed\/([^?&]+)/);
    if (m) return 'https://www.youtube.com/embed/' + m[1] + '?rel=0&playsinline=1';
  }
  const patterns = [
    /[?&]v=([^&#]+)/,
    /youtu\.be\/([^?&#]+)/,
    /youtube\.com\/shorts\/([^?&#]+)/,
    /youtube\.com\/live\/([^?&#]+)/,
    /youtube\.com\/v\/([^?&#]+)/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m && m[1]) return 'https://www.youtube.com/embed/' + m[1] + '?rel=0&playsinline=1';
  }
  return '';
}

function renderVideos() {
  const videos = DATA.videos || {};
  const container = document.getElementById('videos-list');
  const entries = Object.entries(videos).sort((a,b)=>b[1].createdAt-a[1].createdAt);
  if (!entries.length) {
    container.innerHTML = '<div class="empty"><div class="ei">🎬</div><p>Hali video qo\'shilmagan</p></div>';
    return;
  }
  container.innerHTML = entries.map(([vid, v]) => `
    <div class="card" style="display:flex;align-items:center;gap:12px;padding:12px 14px">
      <div style="width:42px;height:42px;background:linear-gradient(135deg,#FF0000,#CC0000);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0">▶️</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:.9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${v.title}</div>
        <div style="font-size:.72rem;color:var(--text2);margin-top:2px">${new Date(v.createdAt).toLocaleDateString()}</div>
      </div>
      <button class="btn btn-xs btn-danger" onclick="deleteVideo('${vid}')">🗑️</button>
    </div>`).join('');
}

window.addVideo = async function() {
  const title = document.getElementById('vid-title').value.trim();
  const url = document.getElementById('vid-url').value.trim();
  if (!title || !url) { toast('❌ Nom va URL kiriting!'); return; }
  const vid = genId();
  const data = { title, url, createdAt: nowTs() };
  DATA.videos[vid] = data;
  saveLocal();
  document.getElementById('vid-title').value = '';
  document.getElementById('vid-url').value = '';
  renderVideos();
  toast('✅ Video qo\'shildi');
  fbSet(`videos/${vid}`, data).catch(e => console.warn('fb:', e));
};

window.deleteVideo = async function(vid) {
  if (!confirm('Videoni o\'chirmoqchimisiz?')) return;
  delete DATA.videos[vid];
  saveLocal();
  renderVideos();
  toast('🗑️ Video o\'chirildi');
  fbRemove(`videos/${vid}`).catch(e => console.warn('fb:', e));
};

// ============================================================
// STUDENT TRANSFER (GURUHLAR ORASIDA KO'CHIRISH)
// ============================================================
window.openTransferStudent = function(sid, gid) {
  const s = DATA.groups[gid]?.students?.[sid];
  if (!s) return;
  document.getElementById('mtr-stu-name').textContent = s.name;
  document.getElementById('mtr-sid').value = sid;
  document.getElementById('mtr-from-gid').value = gid;
  // Target guruh select — faqat boshqa guruhlar
  const groups = DATA.groups || {};
  const opts = Object.entries(groups)
    .filter(([k]) => k !== gid)
    .map(([k, g]) => `<option value="${k}">${g.name}</option>`)
    .join('');
  const sel = document.getElementById('mtr-to-gid');
  sel.innerHTML = opts || '<option value="">— Boshqa guruh yo\'q —</option>';
  // Reset radio
  document.getElementById('mtr-with-scores').checked = true;
  closeModal('m-editstu');
  openModal('m-transfer-stu');
};

window.doTransferStudent = async function() {
  const sid = document.getElementById('mtr-sid').value;
  const fromGid = document.getElementById('mtr-from-gid').value;
  const toGid = document.getElementById('mtr-to-gid').value;
  const withScores = document.getElementById('mtr-with-scores').checked;

  if (!sid || !fromGid || !toGid) { toast('❌ Guruh tanlang!'); return; }
  if (!DATA.groups[fromGid]?.students?.[sid]) { toast('❌ O\'quvchi topilmadi!'); return; }
  if (!DATA.groups[toGid]) { toast('❌ Maqsad guruh topilmadi!'); return; }

  // Check PIN uniqueness in target group
  const s = DATA.groups[fromGid].students[sid];
  for (const [s2id, s2] of Object.entries(DATA.groups[toGid].students || {})) {
    if (String(s2.pin) === String(s.pin)) {
      toast('❌ Bu PIN maqsad guruhda band!'); return;
    }
  }

  let newStuData;
  if (withScores) {
    // Barcha ma'lumotlar bilan ko'chirish
    newStuData = JSON.parse(JSON.stringify(s));
  } else {
    // Faqat asosiy ma'lumotlar: to'lov va ismi
    newStuData = {
      name: s.name,
      pin: s.pin,
      createdAt: nowTs(),
      payments: s.payments ? JSON.parse(JSON.stringify(s.payments)) : { amount:0, paid:false, date:'' },
      records: {}
    };
  }

  // New ID for the student in new group
  const newSid = genId();

  // Add to target group
  if (!DATA.groups[toGid].students) DATA.groups[toGid].students = {};
  DATA.groups[toGid].students[newSid] = newStuData;

  // Remove from source group
  delete DATA.groups[fromGid].students[sid];

  saveLocal();
  closeModal('m-transfer-stu');
  renderGroups();
  populateGroupSelects();
  renderTopStudents(_adminCurrentGid);

  const label = withScores ? 'ballari bilan' : 'ballarisiz';
  toast(`✅ ${s.name} — ${DATA.groups[toGid].name} guruhiga ko\'chirildi (${label})`);

  // Firebase
  const updates = {};
  updates[`groups/${toGid}/students/${newSid}`] = newStuData;
  updates[`groups/${fromGid}/students/${sid}`] = null;
  fbUpdate('/', updates).catch(e => console.warn('fb:', e));
};
