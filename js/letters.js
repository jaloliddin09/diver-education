// ============================================================
// KURSGA YOZILISH — submitEnrollment
// ============================================================
window.submitEnrollment = async function() {
  const name  = (document.getElementById('enroll-name')?.value||'').trim();
  const grade = (document.getElementById('enroll-grade')?.value||'').trim();
  const phone = (document.getElementById('enroll-phone')?.value||'').trim();
  const msg   = document.getElementById('enroll-msg');
  if (!name || !phone) {
    if(msg){msg.style.display='block';msg.style.color='#F59E0B';msg.textContent="📤 Yuborildi — o'qituvchi ko'rib chiqmoqda...";}
    return;
  }
  const lid = genId();
  const data = { name, grade, phone, createdAt: nowTs(), read: false };
  if (!DATA.letters) DATA.letters = {};
  DATA.letters[lid] = data;
  saveLocal(); fbSet('letters/' + lid, data).catch(e => console.warn('fb:', e));
  // Lid ni localStorage ga saqla (status kuzatish uchun)
  localStorage.setItem('jm_sent_letter', lid);
  // UI
  ['enroll-name','enroll-grade','enroll-phone'].forEach(id => {
    const el = document.getElementById(id); if(el) el.value='';
  });
  if(msg){msg.style.display='block';msg.style.color='#F59E0B';msg.textContent="📤 Yuborildi — o'qituvchi ko'rib chiqmoqda...";}
  // Badge yangilash
  updateLettersBadge();
  // Status tekshirishni boshlash
  checkLetterStatus();
};

// ============================================================
// ADMIN — MAKTUBLAR
// ============================================================
function updateLettersBadge() {
  const letters = DATA.letters || {};
  const unread  = Object.values(letters).filter(l => !l.read).length;
  const badge   = document.getElementById('letters-badge');
  if (!badge) return;
  if (unread > 0) {
    badge.style.display = 'block';
    badge.textContent   = unread > 9 ? '9+' : unread;
  } else {
    badge.style.display = 'none';
  }
}

function renderAdminLetters() {
  var el = document.getElementById('letters-list');
  if (!el) return;
  var letters = DATA.letters || {};
  var entries = Object.entries(letters).sort(function(a,b){ return b[1].createdAt - a[1].createdAt; });
  if (!entries.length) {
    el.innerHTML = '<div class="empty"><div class="ei">✉️</div><p>Hali maktub yo\'q</p></div>';
    return;
  }
  var html = '';
  entries.forEach(function(entry) {
    var lid = entry[0]; var l = entry[1];
    var d = new Date(l.createdAt).toLocaleString('uz-UZ',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
    var bs = l.read ? 'opacity:.65' : 'border-left:3px solid #3B82F6';
    var rb = l.read
      ? '<span style="font-size:.7rem;color:var(--green)">✅ Qabul qilindi</span>'
      : '<button class="btn btn-xs btn-success" onclick="markLetterRead(\''+lid+'\')">✓ Qabul qilindi</button>';
    html += '<div class="card" style="margin-bottom:8px;display:flex;align-items:flex-start;gap:12px;padding:13px 14px;'+bs+'">'
      +'<div style="font-size:1.4rem;flex-shrink:0">✉️</div>'
      +'<div style="flex:1;min-width:0">'
      +'<div style="font-weight:700;font-size:.9rem">'+l.name+'</div>'
      +'<div style="font-size:.78rem;color:var(--text2);margin-top:3px">📚 '+(l.grade||'—')+' &nbsp;|&nbsp; 📞 '+l.phone+'</div>'
      +'<div style="font-size:.7rem;color:var(--text3);margin-top:3px">'+d+'</div>'
      +'</div><div style="display:flex;gap:6px;flex-shrink:0">'+rb
      +'<button class="btn btn-xs btn-danger" onclick="deleteLetter(\''+lid+'\')">🗑️</button>'
      +'</div></div>';
  });
  el.innerHTML = html;
}

window.markLetterRead = async function(lid) {
  if (!DATA.letters?.[lid]) return;
  DATA.letters[lid].read = true;
  DATA.letters[lid].acknowledged = true;
  DATA.letters[lid].acknowledgedAt = nowTs();
  saveLocal(); fbUpdate('letters/' + lid, { read: true, acknowledged: true, acknowledgedAt: nowTs() }).catch(e => console.warn('fb:', e));
  updateLettersBadge();
  renderAdminLetters();
  toast('✅ Qabul qilindi — yuboruvchiga xabar ketdi');
};

window.deleteLetter = async function(lid) {
  if (!confirm("Bu maktubni o'chirmoqchimisiz?")) return;
  delete DATA.letters[lid];
  saveLocal(); fbRemove('letters/' + lid).catch(e => console.warn('fb:', e));
  updateLettersBadge();
  renderAdminLetters();
};

function renderGuestPosts() {
  var posts = DATA.posts || {};
  var entries = Object.entries(posts)
    .filter(function(e){ return e[1].aud === 'guest' || e[1].aud === 'both'; })
    .sort(function(a,b){ return b[1].createdAt - a[1].createdAt; });
  var html = '';
  if (entries.length) {
    html = entries.map(function(entry){ return buildPostCard(entry[1], null, false, false); }).join('');
  }
  // Bosh sahifadagi habarlar (doim ko'rinadi)
  var homeEl = document.getElementById('guest-home-posts');
  if (homeEl) homeEl.innerHTML = html;
  // Bog'lanishdagi eski joy (olib tashlangan, shunchaki null check)
  var el = document.getElementById('guest-posts-section');
  if (el) el.innerHTML = html;
}

// ============================================================
// IMPROVED CIRCULAR PROGRESS (parent home)
// ============================================================
function renderCircularProgress(allAvg) {
  const circEl = document.getElementById('circ-progress-wrap');
  if (!circEl) return;
  const r = 52, cx = 70, cy = 70, stroke = 10;
  const circ = 2 * Math.PI * r;
  const offset = circ - (allAvg / 100) * circ;
  const color = pctColor(allAvg);
  const label = allAvg>=90?'A\'lo':allAvg>=70?'Yaxshi':allAvg>=50?'Qoniqarli':'Past';
  // UV, MT, Att breakdown — AVERAGE across all valid records (to match the big circle)
  const { sid, gid } = CU;
  const recs = getValidRecords(sid, gid);
  const uvMax = DATA.settings?.uvMax || 50;
  const mtMax = DATA.settings?.mtMax || 25;
  let uvPct = 0, mtPct = 0, attPct = 0;
  if (recs.length) {
    uvPct  = Math.round(recs.reduce((s,r) => s + ((r.uv||0)/uvMax)*100, 0) / recs.length);
    mtPct  = Math.round(recs.reduce((s,r) => s + ((r.mt||0)/mtMax)*100, 0) / recs.length);
    attPct = Math.round(recs.filter(r => r.qatnashdi).length / recs.length * 100);
  }

  circEl.innerHTML = `
  <div style="display:flex;flex-direction:column;align-items:center;gap:14px">
    <div style="position:relative;width:140px;height:140px">
      <svg width="140" height="140" viewBox="0 0 140 140" style="transform:rotate(-90deg)">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="${stroke}"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
          stroke-linecap="round"
          stroke-dasharray="${circ.toFixed(1)}"
          stroke-dashoffset="${offset.toFixed(1)}"
          style="transition:stroke-dashoffset 1s ease,stroke .5s"/>
      </svg>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div style="font-size:1.9rem;font-weight:800;color:${color};line-height:1">${allAvg}%</div>
        <div style="font-size:.72rem;font-weight:600;color:var(--text2);margin-top:3px">${label}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;width:100%;max-width:320px">
      <div style="text-align:center;background:rgba(59,130,246,.08);border-radius:10px;padding:8px 4px">
        <div style="font-size:1rem;font-weight:800;color:${pctColor(uvPct)}">${uvPct}%</div>
        <div style="font-size:.58rem;font-weight:600;color:var(--text2);margin-top:2px">${getLbl("uv","Vazifa").toUpperCase()}</div>
      </div>
      <div style="text-align:center;background:rgba(139,92,246,.08);border-radius:10px;padding:8px 4px">
        <div style="font-size:1rem;font-weight:800;color:${pctColor(mtPct)}">${mtPct}%</div>
        <div style="font-size:.58rem;font-weight:600;color:var(--text2);margin-top:2px">${getLbl("mt","Test").toUpperCase()}</div>
      </div>
      <div style="text-align:center;background:rgba(245,158,11,.08);border-radius:10px;padding:8px 4px">
        <div style="font-size:1rem;font-weight:800;color:${pctColor(attPct)}">${attPct}%</div>
        <div style="font-size:.58rem;font-weight:600;color:var(--text2);margin-top:2px">${getLbl("att","Faollik").toUpperCase()}</div>
      </div>
      <div style="text-align:center;background:rgba(16,185,129,.08);border-radius:10px;padding:8px 4px">
        <div style="font-size:1rem;font-weight:800;color:#10B981">${Math.round(recs.length ? recs.filter(r=>r.qatnashdi).length/recs.length*100 : 0)}%</div>
        <div style="font-size:.58rem;font-weight:600;color:var(--text2);margin-top:2px">DAVOMAT</div>
      </div>
    </div>
  </div>`;
}

// ============================================================