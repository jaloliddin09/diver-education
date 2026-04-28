// ============================================================
// SAMARA (PERFORMANCE) — YANGI DIZAYN
// ============================================================

// Mini donut SVG helper
function miniDonut(pct, color, size=52, stroke=6) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(1, pct/100)) * circ;
  const cx = size/2, cy = size/2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="${stroke}"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
      stroke-dasharray="${filled.toFixed(2)} ${circ.toFixed(2)}"
      stroke-linecap="round"
      transform="rotate(-90 ${cx} ${cy})"/>
    <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
      fill="white" font-size="${size<44?'9':'11'}" font-weight="700" font-family="Inter">${Math.round(pct)}%</text>
  </svg>`;
}

// Advice generator
function getSamaraAdvice(uvAvg, mtAvg, faolAvg) {
  const parts = [
    { label: 'Uy vazifasi', val: uvAvg, color: '#3B82F6', icon: '📘' },
    { label: 'Mini test',   val: mtAvg, color: '#8B5CF6', icon: '📝' },
    { label: 'Faollik',     val: faolAvg, color: '#F59E0B', icon: '⚡' },
  ];
  const weakest = [...parts].sort((a,b) => a.val - b.val)[0];
  const total = Math.round((uvAvg + mtAvg + faolAvg) / 3);

  let cls, icon, text;
  if (total >= 85) {
    cls='adv-green'; icon='🏆';
    text=`Ajoyib natija! Barcha bo'limlarda yuqori ko'rsatkich. Shunday davom eting!`;
  } else if (total >= 60) {
    cls='adv-yellow'; icon='💡';
    text=`<b>${weakest.label}</b> bo'limida ko'rsatkich pastroq (${Math.round(weakest.val)}%). Shu bo'limga ko'proq e'tibor bering.`;
  } else {
    cls='adv-red'; icon='⚠️';
    text=`<b>${weakest.label}</b> eng past ko'rsatkich (${Math.round(weakest.val)}%). Dars jadvaliga qat'iy rioya qiling va mustaqil mashq ko'paytiring.`;
  }
  return `<div class="sam-advice ${cls}"><div class="adv-icon">${icon}</div><div>${text}</div></div>`;
}

// Build summary rings + advice block
function buildSamaraHeader(records, uvMax, mtMax) {
  if (!records.length) return { summary: '', advice: '' };
  const faolMax = DATA.settings.faolMax || 25;

  const uvAvg   = records.reduce((s,r)=>(s + ((r.uv||0)/uvMax)*100),   0) / records.length;
  const mtAvg   = records.reduce((s,r)=>(s + ((r.mt||0)/mtMax)*100),   0) / records.length;
  const faolAvg = records.reduce((s,r)=>(s + ((r.faol||0)/faolMax)*100), 0) / records.length;
  const davAvg  = records.reduce((s,r)=>(s + (r.qatnashdi ? 100 : 0)), 0) / records.length;

  // 3 ball beruvchi ustun uchun "eng past" aniqlash
  const scoreParts = [uvAvg, mtAvg, faolAvg];
  const minScoreVal = Math.min(...scoreParts);

  const parts = [
    { label:'VAZIFA',   shortLabel:`o'rt: ${(records.reduce((s,r)=>s+(r.uv||0),0)/records.length).toFixed(1)}/${uvMax}`,   val:uvAvg,   color:'#3B82F6', isScore:true },
    { label:'TEST',     shortLabel:`o'rt: ${(records.reduce((s,r)=>s+(r.mt||0),0)/records.length).toFixed(1)}/${mtMax}`,   val:mtAvg,   color:'#8B5CF6', isScore:true },
    { label:'FAOLLIK',  shortLabel:`o'rt: ${(records.reduce((s,r)=>s+(r.faol||0),0)/records.length).toFixed(1)}/${faolMax}`,val:faolAvg, color:'#F59E0B', isScore:true },
    { label:'DAVOMAT',  shortLabel:`${Math.round(davAvg)}% keldi`,                                                          val:davAvg,  color:'#10B981', isScore:false },
  ];

  const summary = `<div class="samara-summary">
    ${parts.map(p => {
      const isWeak = p.isScore && Math.abs(p.val - minScoreVal) < 0.1 && minScoreVal < 70;
      return `
      <div class="sam-ring-box${isWeak ? ' weak-box' : ''}">
        ${miniDonut(p.val, p.color, 68, 8)}
        <div class="sam-ring-label" style="color:${isWeak?'var(--red)':'var(--text2)'}">${p.label}${!p.isScore?' 📌':''}</div>
        <div class="sam-ring-val" style="color:${p.color};font-size:.68rem">${p.shortLabel}</div>
      </div>`;
    }).join('')}
  </div>`;

  return { summary, advice: getSamaraAdvice(uvAvg, mtAvg, faolAvg) };
}

// Build day-by-day cards
function buildSamaraDayList(allRecords, days, uvMax, mtMax, hideCancel) {
  const faolMax = DATA.settings.faolMax || 25;
  const slice = days > 0 ? allRecords.slice(0, days) : allRecords;
  // hideCancel=true (ota-ona): bekor kunlar yashiriladi
  const filtered = hideCancel ? slice.filter(([,r]) => r.isCounted !== false) : slice;
  if (!filtered.length) return '<div class="empty"><div class="ei">📊</div><p>Natija yo\'q</p></div>';
  return filtered.map(([dateKey, r]) => {
    const uvPct   = uvMax   ? Math.round(((r.uv||0)   / uvMax)   * 100) : 0;
    const mtPct   = mtMax   ? Math.round(((r.mt||0)   / mtMax)   * 100) : 0;
    const faolPct = faolMax ? Math.round(((r.faol||0) / faolMax) * 100) : 0;
    const davPct  = r.qatnashdi ? 100 : 0;
    const col = pctColor(r.percent);
    return `
    <div class="sam-day-card${!r.isCounted?' cancelled':''}">
      <div class="sam-day-top">
        <div>
          <div class="sam-day-date">${fmtDate(dateKey)}</div>
          ${!r.isCounted ? '<span class="cancelled-badge">bekor</span>' : ''}
        </div>
        <div style="text-align:right">
          <div style="font-size:.6rem;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.4px">${getLbl('total','Umumiy')}</div>
          <div class="sam-day-total" style="color:${col}">${r.percent}%</div>
        </div>
      </div>
      <div class="sam-day-rings">
        <div class="sam-mini-ring">
          ${miniDonut(uvPct, '#3B82F6', 44, 5)}
          <div class="sam-mini-label" style="color:#3B82F6">Vazifa ${r.uv||0}/${uvMax}</div>
        </div>
        <div class="sam-mini-ring">
          ${miniDonut(mtPct, '#8B5CF6', 44, 5)}
          <div class="sam-mini-label" style="color:#8B5CF6">Test ${r.mt||0}/${mtMax}</div>
        </div>
        <div class="sam-mini-ring">
          ${miniDonut(faolPct, '#F59E0B', 44, 5)}
          <div class="sam-mini-label" style="color:#F59E0B">Faollik ${r.faol||0}/${faolMax}</div>
        </div>
        <div class="sam-mini-ring">
          ${miniDonut(davPct, '#10B981', 44, 5)}
          <div class="sam-mini-label" style="color:${r.qatnashdi?'#10B981':'#EF4444'}">Davomat ${r.qatnashdi?'✅':'❌'}</div>
        </div>
      </div>
    </div>`;
  }).join('');
}

// Build Chart.js line chart
function buildSamaraChart(canvasId, records) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!records.length || !ctx) return;
  _charts[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: records.map(r => fmtDate(r.dateKey)),
      datasets: [
        { label: 'Umumiy %', data: records.map(r=>r.percent),
          borderColor:'#3B82F6', backgroundColor:'rgba(59,130,246,.10)',
          borderWidth:2.5, pointBackgroundColor: records.map(r=>pctColor(r.percent)),
          pointRadius:5, tension:.4, fill:true },
        { label: getLbl('uv','Vazifa'), data: records.map(r=>{const uvMax=(DATA.settings&&DATA.settings.uvMax)||50;return Math.round((r.uv||0)/uvMax*100);}),
          borderColor:'rgba(99,102,241,.7)', backgroundColor:'transparent',
          borderWidth:1.5, pointRadius:3, tension:.4, fill:false, borderDash:[4,3] },
        { label: getLbl('att','Faollik'), data: records.map(r=>r.qatnashdi?100:0),
          borderColor:'rgba(16,185,129,.6)', backgroundColor:'transparent',
          borderWidth:1.5, pointRadius:3, tension:.0, fill:false, borderDash:[2,4], stepped:true },
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false} },
      scales:{
        y:{min:0,max:100,ticks:{color:'#94A3B8',font:{family:'Inter'}},grid:{color:'rgba(255,255,255,.05)'}},
        x:{ticks:{color:'#94A3B8',font:{family:'Inter',size:10}},grid:{display:false}}
      }
    }
  });
}

window.setSamaraPeriod = function(days, btn) {
  _samaraPeriod = days;
  if (btn) { document.querySelectorAll('#samara-tabs .tab-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); }
  renderSamara(days);
};

function renderSamara(days) {
  if (!CU || CU.role !== 'parent') return;
  const { sid, gid } = CU;
  const uvMax   = DATA.settings.uvMax   || 50;
  const mtMax   = DATA.settings.mtMax   || 25;

  let records = getValidRecords(sid, gid);
  if (days > 0) {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate()-days);
    records = records.filter(r => r.dateKey >= cutoff.toISOString().split('T')[0]);
  }

  const { summary, advice } = buildSamaraHeader(records, uvMax, mtMax);
  document.getElementById('samara-summary-wrap').innerHTML = summary;
  document.getElementById('samara-advice-wrap').innerHTML  = advice;

  buildSamaraChart('samara-chart', records);

  const stu = DATA.groups[gid]?.students?.[sid];
  const allRecords = Object.entries(stu?.records||{}).sort((a,b)=>b[0].localeCompare(a[0]));
  document.getElementById('samara-list').innerHTML = buildSamaraDayList(allRecords, days, uvMax, mtMax, CU && CU.role==='parent');
}

// ============================================================
// ADMIN STUDENT SAMARA
// ============================================================
let _adminSamaraCtx = { sid:null, gid:null, days:7 };

window.openAdminSamara = function(sid, gid) {
  _adminSamaraCtx = { sid, gid, days:7 };
  const stu = DATA.groups[gid]?.students?.[sid];
  const group = DATA.groups[gid];
  document.getElementById('stu-samara-title').textContent = `📊 ${stu?.name || ''}`;
  document.getElementById('stu-samara-sub').textContent = group?.name || '';
  document.querySelectorAll('#admin-samara-tabs .tab-btn').forEach((b,i)=>b.classList.toggle('active',i===0));
  openModal('m-stu-samara');
  renderAdminSamara(7);
};

window.setAdminSamara = function(days, btn) {
  _adminSamaraCtx.days = days;
  if (btn) { document.querySelectorAll('#admin-samara-tabs .tab-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); }
  renderAdminSamara(days);
};

function renderAdminSamara(days) {
  const { sid, gid } = _adminSamaraCtx;
  const uvMax = DATA.settings.uvMax || 50;
  const mtMax = DATA.settings.mtMax || 25;

  let records = getValidRecords(sid, gid);
  if (days > 0) {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate()-days);
    records = records.filter(r => r.dateKey >= cutoff.toISOString().split('T')[0]);
  }

  const { summary, advice } = buildSamaraHeader(records, uvMax, mtMax);
  document.getElementById('admin-samara-summary').innerHTML = summary;
  document.getElementById('admin-samara-advice').innerHTML  = advice;
  buildSamaraChart('admin-samara-chart', records);

  const stu = DATA.groups[gid]?.students?.[sid];
  const allRecords = Object.entries(stu?.records||{}).sort((a,b)=>b[0].localeCompare(a[0]));
  document.getElementById('admin-samara-list').innerHTML = buildSamaraDayList(allRecords, days, uvMax, mtMax);
}

// ============================================================
// RANKING
// ============================================================
window.loadRanking = function(period, btn) {
  if (btn) { document.querySelectorAll('#pp-ranking .tab-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); }
  if (!CU || CU.role !== 'parent') return;
  const { sid, gid } = CU;
  const listEl = document.getElementById('ranking-list');
  if (!DATA.groups || !DATA.groups[gid]) {
    listEl.innerHTML = '<div class="empty"><div class="ei">👥</div><p>Guruh topilmadi</p></div>';
    return;
  }
  const group = DATA.groups[gid];
  const rnEl = document.getElementById('rank-group-name');
  if (rnEl) rnEl.textContent = group.name + ' · guruh reytingi';

  const students = Object.entries(group.students || {}).map(([s2id, s]) => ({
    s2id, name: s.name, avg: getAvg(s2id, gid, period)
  })).sort((a,b) => (b.avg ?? -1) - (a.avg ?? -1));

  const withData = students.filter(s => s.avg !== null);
  if (!withData.length) {
    listEl.innerHTML = '<div class="empty"><div class="ei">🏆</div><p>Natija yo\'q</p></div>';
    return;
  }

  const medals = ['gold','silver','bronze'];
  const medalEmoji = ['🥇','🥈','🥉'];
  const podColors = ['#F59E0B','#94A3B8','#CD7F32'];
  const top3 = withData.slice(0, 3);

  // Podium: always 3 columns, empty div if student missing
  let podOrder;
  if (top3.length === 1) podOrder = [null, top3[0], null];
  else if (top3.length === 2) podOrder = [top3[1], top3[0], null];
  else podOrder = [top3[1], top3[0], top3[2]];

  let html = '<div class="top3-row">';
  podOrder.forEach(s => {
    if (!s) { html += '<div></div>'; return; }
    const rank = withData.indexOf(s);
    const cls = medals[rank] || '';
    const isMe = s.s2id === sid;
    html += `<div class="top3-pod ${cls}${isMe?' top3-mine':''}">
      <div class="top3-medal">${medalEmoji[rank] || ''}</div>
      <div class="top3-av ${cls}">${s.name.charAt(0).toUpperCase()}</div>
      <div class="top3-name">${s.name}${isMe ? ' 👈' : ''}</div>
      <div class="top3-score" style="color:${podColors[rank] || '#888'}">${s.avg}%</div>
    </div>`;
  });
  html += '</div>';

  // 4th place and below
  withData.slice(3).forEach(s => {
    const rank = withData.indexOf(s) + 1;
    const isMe = s.s2id === sid;
    html += `<div class="rank-item${isMe ? ' mine' : ''}">
      <div class="rnum rother">${rank}</div>
      <div class="stu-av" style="width:32px;height:32px;font-size:.82rem;${isMe?'background:linear-gradient(135deg,#3B82F6,#8B5CF6)':''}">${s.name.charAt(0)}</div>
      <div style="flex:1"><div style="font-weight:600;font-size:.88rem">${s.name}${isMe?' 👈':''}</div></div>
      <div style="text-align:right">
        <span class="score-badge ${scoreClass(s.avg)}">${s.avg}%</span>
        <div class="pbar" style="width:72px;margin-top:4px"><div class="pbar-fill" style="width:${s.avg}%"></div></div>
      </div>
    </div>`;
  });

  const noData = students.filter(s => s.avg === null);
  if (noData.length) {
    html += `<div style="font-size:.73rem;color:var(--text3);margin-top:10px;padding:8px 0;border-top:1px solid var(--border)">${noData.map(s=>s.name).join(', ')} — natija yo'q</div>`;
  }

  listEl.innerHTML = html;
};
