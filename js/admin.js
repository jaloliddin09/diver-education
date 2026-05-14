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
    const loginedToday = lastLoginAt && new Date(lastLoginAt).toISOString().split('T')[0] === todayKey;
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
  const sid = genId();
  const stuData = { name, pin, createdAt: nowTs(), payments: { amount:0, paid:false, date:'' }, records:{} };
  if (!DATA.groups[gid]) DATA.groups[gid] = { name:'', students:{} };
  if (!DATA.groups[gid].students) DATA.groups[gid].students = {};
  DATA.groups[gid].students[sid] = stuData;
  saveLocal();
  closeModal('m-addstu');
  renderGroups();
  toast('✅ O\'quvchi qo\'shildi');
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
      return dateStr.slice(0, 7) === now.toISOString().slice(0, 7);
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
  const date = document.getElementById('grade-date').value;
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
  const date = document.getElementById('grade-date').value;
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

// Guruh to'lov sozlamalarini to'g'ridan-to'g'ri saqlash
window.saveGroupPaySettings = async function(gid) {
  const g = DATA.groups[gid];
  if (!g) return;
  const priceEl = document.getElementById('gps-price');
  const dayEl   = document.getElementById('gps-day');
  const coursePrice = parseInt(priceEl && priceEl.value) || 0;
  const payDueDay   = parseInt(dayEl   && dayEl.value)   || 0;
  DATA.groups[gid].coursePrice = coursePrice || null;
  DATA.groups[gid].payDueDay   = payDueDay   || null;
  saveLocal();
  renderPayments();
  renderHisobKitob && renderHisobKitob();
  toast('✅ Saqlandi');
  fbUpdate('groups/' + gid, { coursePrice: coursePrice||null, payDueDay: payDueDay||null })
    .catch(function(e){ console.warn('fb:',e); });
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

  // ─── O'quvchilar ro'yxati ───────────────────────────────────
  const paidCount = students.filter(function(e){ return e[1].payments&&e[1].payments.paid; }).length;
  const totalCount = students.length;
  const summaryBar = `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding:0 2px">
    <span style="font-size:.75rem;font-weight:700;color:var(--text2)">${totalCount} ta o'quvchi</span>
    <span style="font-size:.75rem;font-weight:800;color:${paidCount===totalCount?'#10B981':paidCount>0?'#F59E0B':'#EF4444'}">
      ✅ ${paidCount} / ${totalCount} to'lagan</span>
  </div>`;

  const list = students.map(function(entry){
    const sid = entry[0], s = entry[1];
    const pay = s.payments || {};
    const discountInfo = (pay.discount && coursePrice) ? ' · '+pay.discount+'% chegirma' : '';
    const amountInfo = pay.amount ? pay.amount.toLocaleString()+' so\'m' : (coursePrice ? coursePrice.toLocaleString()+' so\'m (taxminiy)' : 'Summa kiritilmagan');
    const dateInfo = pay.date ? ' · ' + fmtDate(pay.date) : '';
    return `<div class="stu-item" onclick="openPayment('${sid}','${gid}')">
      <div class="stu-av">${s.name.charAt(0)}</div>
      <div class="stu-info">
        <div class="sn">${s.name}</div>
        <div class="sp">${amountInfo}${discountInfo}${dateInfo}</div>
      </div>
      <span class="pay-status ${pay.paid?'pay-paid':'pay-unpaid'}">${pay.paid?'✅':'❌'}</span>
    </div>`;
  }).join('');

  container.innerHTML = settingsCard + summaryBar + list;
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
  document.getElementById('pay-date').value = pay.date || today();
  const tog = document.getElementById('pay-toggle');
  if (pay.paid) tog.classList.add('on'); else tog.classList.remove('on');
  document.getElementById('pay-stu-id').value = sid;
  document.getElementById('pay-group-id').value = gid;
  openModal('m-payment');
};

window.savePayment = async function() {
  const sid = document.getElementById('pay-stu-id').value;
  const gid = document.getElementById('pay-group-id').value;
  const amount = parseInt(document.getElementById('pay-amount').value)||0;
  const date = document.getElementById('pay-date').value;
  const paid = document.getElementById('pay-toggle').classList.contains('on');
  const discount = parseFloat(document.getElementById('pay-discount').value)||0;
  const payData = { amount, date, paid, discount };
  if (DATA.groups[gid]?.students?.[sid]) DATA.groups[gid].students[sid].payments = payData;
  saveLocal();
  closeModal('m-payment');
  renderPayments();
  toast('✅ To\'lov saqlandi');
  fbSet(`groups/${gid}/students/${sid}/payments`, payData).catch(e => console.warn('fb:', e));
};

// ============================================================
// PAYMENTS — HISOB-KITOB
// ============================================================
const _OY = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
function _fmtMonth(ym) {
  const [y, m] = ym.split('-');
  return _OY[parseInt(m, 10) - 1] + ' ' + y;
}

window.switchPayTab = function(tab, btn) {
  document.querySelectorAll('.pay-tab-btn').forEach(b => {
    b.classList.remove('btn-primary');
  });
  if (btn) btn.classList.add('btn-primary');
  document.getElementById('pay-tab-list').style.display       = tab === 'list' ? '' : 'none';
  document.getElementById('pay-tab-hisobkitob').style.display = tab === 'hisobkitob' ? '' : 'none';
  if (tab === 'hisobkitob') renderHisobKitob();
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
  const groups = DATA.groups || {};
  const mode   = window._hisobMode || 'month'; // 'month' | 'all'
  const nowYM  = new Date().toISOString().slice(0, 7);   // e.g. "2026-05"
  const nowMonthName = _fmtMonth(nowYM);

  // ─── Mode toggle ─────────────────────────────────────────
  const modeToggle = `
  <div style="display:flex;gap:6px;margin-bottom:14px;background:var(--bg2);padding:4px;border-radius:12px">
    <button onclick="window._hisobMode='month';renderHisobKitob()"
      style="flex:1;padding:8px 4px;border:none;border-radius:9px;font-size:.8rem;font-weight:700;cursor:pointer;font-family:inherit;
             background:${mode==='month'?'var(--blue)':'transparent'};color:${mode==='month'?'#fff':'var(--text2)'}">
      📅 Bu oy (${nowMonthName})
    </button>
    <button onclick="window._hisobMode='all';renderHisobKitob()"
      style="flex:1;padding:8px 4px;border:none;border-radius:9px;font-size:.8rem;font-weight:700;cursor:pointer;font-family:inherit;
             background:${mode==='all'?'var(--blue)':'transparent'};color:${mode==='all'?'#fff':'var(--text2)'}">
      📊 Umumiy (jami)
    </button>
  </div>`;

  // ─── Har bir guruhni hisoblash ───────────────────────────
  let grandTotal=0, grandPaid=0, grandCollected=0, grandExpected=0, grandDebt=0;

  const groupCards = Object.entries(groups).map(function(entry) {
    const gid = entry[0], g = entry[1];
    const coursePrice = getEffectivePrice(g);
    const allStudents = Object.values(g.students || {});

    // Mode bo'yicha filtrlash
    let students;
    if (mode === 'month') {
      // Faqat shu oyda to'lov sanasi bo'lgan yoki hali to'lamagan barcha o'quvchilar
      students = allStudents;
      // "Bu oy" hisobida: paidCount = shu oyda paid=true bo'lganlar
      // unpaidCount = paid=false yoki boshqa oy to'laganlar
    } else {
      students = allStudents;
    }

    const count      = students.length;
    if (!count) return '';

    const paidStudents = students.filter(function(s) {
      if (!s.payments || !s.payments.paid) return false;
      if (mode === 'month') return s.payments.date && s.payments.date.slice(0,7) === nowYM;
      return true; // 'all' modeda barchasi
    });
    const paidCount   = paidStudents.length;
    const unpaidCount = count - paidCount;
    // Faqat to'langan o'quvchilarning summasi
    const collected   = paidStudents.reduce(function(acc,s){ return acc+(s.payments.amount||0); }, 0);
    const expected    = coursePrice * count;
    const debt        = coursePrice ? Math.max(0, expected - collected) : 0;
    const pctPaid     = count ? Math.round(paidCount / count * 100) : 0;
    const barColor    = pctPaid >= 80 ? '#10B981' : pctPaid >= 50 ? '#F59E0B' : '#EF4444';

    grandTotal     += count;
    grandPaid      += paidCount;
    grandCollected += collected;
    grandExpected  += expected;
    grandDebt      += debt;

    // Keyingi to'lov sanasi (agar payDueDay belgilangan bo'lsa)
    let dueDateRow = '';
    if (g.payDueDay) {
      const now = new Date();
      let dueDate = new Date(now.getFullYear(), now.getMonth(), g.payDueDay);
      if (dueDate < now) dueDate = new Date(now.getFullYear(), now.getMonth()+1, g.payDueDay);
      const daysLeft = Math.ceil((dueDate - now) / 86400000);
      const dueTxt = dueDate.toLocaleDateString('uz-UZ', {day:'numeric',month:'long'});
      const dueColor = daysLeft <= 3 ? '#EF4444' : daysLeft <= 7 ? '#F59E0B' : '#10B981';
      dueDateRow = `<div style="margin-top:6px;display:flex;justify-content:space-between;font-size:.7rem;padding:6px 10px;background:rgba(0,0,0,.1);border-radius:8px">
        <span style="color:var(--text2)">📅 Keyingi to'lov</span>
        <span style="font-weight:700;color:${dueColor}">${dueTxt} (${daysLeft} kun)</span>
      </div>`;
    }

    const debtRow = coursePrice ? (
      debt > 0
        ? `<div style="display:flex;justify-content:space-between;font-size:.7rem;padding:7px 10px;background:rgba(239,68,68,.08);border-radius:8px;border:1px solid rgba(239,68,68,.2)">
            <span style="color:#EF4444;font-weight:600">❌ Qarzdorlik (${unpaidCount} kishi)</span>
            <span style="font-weight:800;color:#EF4444">${_fmtSomFull(debt)} so'm</span>
           </div>`
        : paidCount === count
          ? `<div style="font-size:.7rem;padding:7px 10px;background:rgba(16,185,129,.08);border-radius:8px;border:1px solid rgba(16,185,129,.2);color:#10B981;font-weight:700;text-align:center">✅ Barcha ${count} kishi to'lagan!</div>`
          : ''
    ) : '';

    return `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px">
        <div>
          <div style="font-weight:700;font-size:.92rem">${g.name}</div>
          <div style="font-size:.7rem;color:var(--text2);margin-top:2px">${count} ta o'quvchi</div>
        </div>
        ${coursePrice ? `<div style="font-size:.72rem;font-weight:700;color:var(--blue);background:rgba(59,130,246,.1);padding:3px 9px;border-radius:8px;flex-shrink:0">${coursePrice.toLocaleString()} so'm</div>` : '<div style="font-size:.68rem;color:#F59E0B;font-weight:600">narx yo\'q</div>'}
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <div style="flex:1;height:7px;background:var(--bg3);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${pctPaid}%;background:${barColor};border-radius:4px"></div>
        </div>
        <span style="font-size:.72rem;font-weight:800;color:${barColor};min-width:34px;text-align:right">${pctPaid}%</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:8px">
        <div style="text-align:center;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2);border-radius:9px;padding:8px 4px">
          <div style="font-size:1rem;font-weight:800;color:#10B981">${paidCount}</div>
          <div style="font-size:.6rem;font-weight:600;color:var(--text2);margin-top:2px">✅ To'lagan</div>
        </div>
        <div style="text-align:center;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:9px;padding:8px 4px">
          <div style="font-size:1rem;font-weight:800;color:#EF4444">${unpaidCount}</div>
          <div style="font-size:.6rem;font-weight:600;color:var(--text2);margin-top:2px">❌ To'lamagan</div>
        </div>
        <div style="text-align:center;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2);border-radius:9px;padding:8px 4px">
          <div style="font-size:.82rem;font-weight:800;color:var(--blue)">${_fmtSom(collected)}</div>
          <div style="font-size:.6rem;font-weight:600;color:var(--text2);margin-top:2px">💰 Yig'ilgan</div>
        </div>
      </div>
      ${coursePrice ? `<div style="display:flex;justify-content:space-between;font-size:.7rem;padding:7px 10px;background:var(--bg3);border-radius:8px;margin-bottom:${debtRow?'5px':'0'}">
        <span style="color:var(--text2)">Kutilgan jami (${count}×${(coursePrice/1000).toFixed(0)}K)</span>
        <span style="font-weight:700">${_fmtSomFull(expected)} so'm</span>
      </div>` : ''}
      ${debtRow}
      ${dueDateRow}
    </div>`;
  }).join('');

  // ─── Grand total ─────────────────────────────────────────
  const grandPct = grandTotal ? Math.round(grandPaid/grandTotal*100) : 0;
  const grandBarColor = grandPct>=80?'#10B981':grandPct>=50?'#F59E0B':'#EF4444';
  const modeLabel = mode === 'month' ? `📅 ${nowMonthName} — joriy oy` : '📊 Barcha vaqt — umumiy';

  const grandCard = `
  <div style="background:linear-gradient(135deg,rgba(59,130,246,.18),rgba(139,92,246,.12));border:1px solid rgba(59,130,246,.35);border-radius:14px;padding:16px;margin-bottom:14px">
    <div style="font-weight:800;font-size:.9rem;margin-bottom:4px">${modeLabel}</div>
    <div style="font-size:.68rem;color:var(--text2);margin-bottom:12px">${grandTotal} ta o'quvchi — barcha guruhlar</div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
      <div style="flex:1;height:10px;background:rgba(0,0,0,.2);border-radius:5px;overflow:hidden">
        <div style="height:100%;width:${grandPct}%;background:${grandBarColor};border-radius:5px;transition:width .5s"></div>
      </div>
      <span style="font-size:.82rem;font-weight:800;color:${grandBarColor};min-width:38px;text-align:right">${grandPct}%</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:8px">
      <div style="background:rgba(16,185,129,.15);border-radius:10px;padding:10px;text-align:center">
        <div style="font-size:1.1rem;font-weight:800;color:#10B981">${grandPaid}<span style="font-size:.7rem;opacity:.7"> / ${grandTotal}</span></div>
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
        <div style="font-size:.9rem;font-weight:800;color:var(--text1)">${_fmtSomFull(grandExpected)}</div>
        <div style="font-size:.62rem;font-weight:600;color:var(--text2);margin-top:2px">📋 Kutilgan jami</div>
      </div>
      <div style="background:${grandDebt?'rgba(239,68,68,.15)':'rgba(16,185,129,.12)'};border-radius:10px;padding:10px;text-align:center">
        <div style="font-size:.9rem;font-weight:800;color:${grandDebt?'#EF4444':'#10B981'}">${grandDebt?_fmtSomFull(grandDebt)+' so\'m':'✅ Yo\'q'}</div>
        <div style="font-size:.62rem;font-weight:600;color:var(--text2);margin-top:2px">${grandDebt?'❌ Umumiy qarzdorlik':'✅ Qarzdorlik'}</div>
      </div>
    </div>` : ''}
  </div>`;

  // ─── Oylik tarix (faqat "Umumiy" modeda) ─────────────────
  let monthSection = '';
  if (mode === 'all') {
    const byMonth = {};
    Object.entries(groups).forEach(function(ge) {
      const g2 = ge[1];
      Object.values(g2.students||{}).forEach(function(st) {
        const pay = st.payments||{};
        if (!pay.date) return;
        const ym = pay.date.slice(0,7);
        if (!byMonth[ym]) byMonth[ym] = { collected:0, pendingAmt:0, paidCount:0, unpaidCount:0, paidList:[], pendingList:[] };
        if (pay.paid) {
          byMonth[ym].collected  += pay.amount||0;
          byMonth[ym].paidCount  += 1;
          byMonth[ym].paidList.push({ name:st.name||'—', group:g2.name, amount:pay.amount||0 });
        } else {
          byMonth[ym].unpaidCount += 1;
          byMonth[ym].pendingList.push({ name:st.name||'—', group:g2.name, amount:pay.amount||0 });
        }
      });
    });
    window._payMonthData = byMonth;
    const monthEntries = Object.entries(byMonth).sort(function(a,b){ return b[0].localeCompare(a[0]); });
    const monthCards = monthEntries.map(function(me) {
      const ym2=me[0], d=me[1];
      const tot = d.paidCount+d.unpaidCount;
      return `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div style="font-weight:800;font-size:.9rem">${_fmtMonth(ym2)}</div>
          <div style="font-size:.7rem;color:var(--text2)">${tot} ta yozuv</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div onclick="showPayMonth('${ym2}','paid')"
            style="background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2);border-radius:9px;padding:9px;text-align:center;cursor:pointer">
            <div style="font-size:.88rem;font-weight:800;color:#10B981">${_fmtSomFull(d.collected)} so'm</div>
            <div style="font-size:.6rem;color:var(--text2);margin-top:3px">✅ To'langan · ${d.paidCount} kishi → ko'rish</div>
          </div>
          <div onclick="showPayMonth('${ym2}','pending')"
            style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:9px;padding:9px;text-align:center;cursor:pointer">
            <div style="font-size:.88rem;font-weight:800;color:#EF4444">${d.unpaidCount} ta</div>
            <div style="font-size:.6rem;color:var(--text2);margin-top:3px">❌ To'lamagan → ko'rish</div>
          </div>
        </div>
      </div>`;
    }).join('') || `<div class="empty"><div class="ei">📅</div><p>Ma'lumot yo'q</p></div>`;

    monthSection = `<div style="font-size:.7rem;font-weight:800;color:var(--text2);text-transform:uppercase;letter-spacing:.6px;margin:14px 0 8px">🗓 Oylar bo'yicha tarix</div>${monthCards}`;
  }

  window.showPayMonth = function(ym, type) {
    const d = (window._payMonthData||{})[ym]; if(!d) return;
    const list  = type==='paid' ? d.paidList : d.pendingList;
    const title = type==='paid' ? "✅ To'laganlar" : "❌ To'lamaganlar";
    const color = type==='paid' ? '#10B981' : '#EF4444';
    const rows  = list.length ? list.map(function(s){
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--border)">
        <div><div style="font-weight:700;font-size:.85rem">${s.name}</div><div style="font-size:.7rem;color:var(--text2)">${s.group}</div></div>
        <div style="font-weight:800;color:${color}">${_fmtSomFull(s.amount)} so'm</div>
      </div>`;
    }).join('') : `<div style="text-align:center;padding:20px;color:var(--text2)">Hech kim yo'q</div>`;
    const m = document.createElement('div');
    m.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(6px);z-index:9999;display:flex;align-items:flex-end;justify-content:center';
    m.innerHTML=`<div style="background:var(--bg1);border-radius:18px 18px 0 0;width:100%;max-width:480px;max-height:75vh;display:flex;flex-direction:column">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 18px;border-bottom:1px solid var(--border)">
        <div><div style="font-weight:800;font-size:.95rem;color:${color}">${title}</div>
        <div style="font-size:.72rem;color:var(--text2);margin-top:2px">${_fmtMonth(ym)} — ${list.length} ta</div></div>
        <button onclick="this.closest('[style*=fixed]').remove()" style="background:var(--bg2);border:none;color:var(--text1);width:32px;height:32px;border-radius:50%;font-size:1.1rem;cursor:pointer">✕</button>
      </div>
      <div style="overflow-y:auto;padding:0 18px 20px">${rows}</div></div>`;
    m.addEventListener('click',function(e){if(e.target===m)m.remove();});
    document.body.appendChild(m);
  };

  el.innerHTML = modeToggle + grandCard +
    `<div style="font-size:.7rem;font-weight:800;color:var(--text2);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px">👥 Guruhlar bo'yicha</div>` +
    (groupCards || `<div class="empty"><div class="ei">👥</div><p>Guruh yo'q</p></div>`) +
    monthSection;
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
