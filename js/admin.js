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

  // Top all-time
  const allStudents = [];
  Object.entries(groups).forEach(([gid, g]) => {
    Object.entries(g.students || {}).forEach(([sid, s]) => {
      const avg = getAvg(sid, gid, 'all');
      if (avg !== null) allStudents.push({ name: s.name, avg, group: g.name });
    });
  });
  allStudents.sort((a,b) => b.avg - a.avg);
  const top = allStudents.slice(0, 5);
  document.getElementById('top-students').innerHTML = !top.length
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
  document.getElementById('meg-id').value = gid;
  openModal('m-editgroup');
};

window.updateGroup = async function() {
  const gid = document.getElementById('meg-id').value;
  const name = document.getElementById('meg-name').value.trim();
  if (!name) return;
  DATA.groups[gid].name = name;
  saveLocal();
  closeModal('m-editgroup');
  renderGroups();
  populateGroupSelects();
  toast('✅ Yangilandi');
  fbUpdate('groups/' + gid, { name }).catch(e => console.warn('fb:', e));
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
window.renderPayments = function() {
  const gid = document.getElementById('pay-group').value;
  const container = document.getElementById('payments-list');
  if (!gid || !DATA.groups[gid]) { container.innerHTML=''; return; }
  const students = Object.entries(DATA.groups[gid].students||{}).sort((a,b)=>a[1].name.localeCompare(b[1].name));
  if (!students.length) { container.innerHTML='<div class="empty"><div class="ei">👤</div><p>O\'quvchi yo\'q</p></div>'; return; }
  container.innerHTML = students.map(([sid,s]) => {
    const pay = s.payments || {};
    return `
    <div class="stu-item" onclick="openPayment('${sid}','${gid}')">
      <div class="stu-av">${s.name.charAt(0)}</div>
      <div class="stu-info">
        <div class="sn">${s.name}</div>
        <div class="sp">${pay.amount ? (pay.amount).toLocaleString()+' so\'m' : 'Summa kiritilmagan'} ${pay.date?'· '+fmtDate(pay.date):''}</div>
      </div>
      <span class="pay-status ${pay.paid?'pay-paid':'pay-unpaid'}">${pay.paid?'✅ To\'landi':'❌ To\'lanmadi'}</span>
    </div>`;
  }).join('');
};

window.openPayment = function(sid, gid) {
  const s = DATA.groups[gid]?.students?.[sid];
  if (!s) return;
  const pay = s.payments || {};
  document.getElementById('pay-modal-title').textContent = s.name + ' — To\'lov';
  document.getElementById('pay-amount').value = pay.amount || '';
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
  const payData = { amount, date, paid };
  if (DATA.groups[gid]?.students?.[sid]) DATA.groups[gid].students[sid].payments = payData;
  saveLocal();
  closeModal('m-payment');
  renderPayments();
  toast('✅ To\'lov saqlandi');
  fbSet(`groups/${gid}/students/${sid}/payments`, payData).catch(e => console.warn('fb:', e));
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
