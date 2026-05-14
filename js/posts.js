// ============================================================
// GUEST POSTS
// ============================================================

// Mehmon bosh sahifasida yangiliklar
function renderGuestHomePosts() {
  const el = document.getElementById('guest-home-posts');
  if (!el) return;
  const posts = DATA.posts || {};
  const entries = Object.entries(posts)
    .filter(([,p]) => p.aud === 'guest' || p.aud === 'both')
    .sort((a,b) => b[1].createdAt - a[1].createdAt)
    .slice(0, 5);
  if (!entries.length) { el.innerHTML = ''; return; }
  el.innerHTML = `
  <div style="margin:0 0 16px">
    <div style="display:flex;align-items:center;gap:7px;margin-bottom:10px">
      <div style="width:3px;height:16px;background:linear-gradient(#8B5CF6,#3B82F6);border-radius:2px"></div>
      <span style="font-size:.78rem;font-weight:800;color:rgba(255,255,255,.55);text-transform:uppercase;letter-spacing:.7px">📢 E'lonlar</span>
    </div>
    ${entries.map(([,p]) => {
      const d = new Date(p.createdAt).toLocaleDateString('uz-UZ',{day:'2-digit',month:'short'});
      return `<div style="background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.25);border-radius:13px;padding:13px 14px;margin-bottom:8px;animation:fadeUp .3s ease">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:${p.text?'8px':'0'}">
          <div style="width:34px;height:34px;background:rgba(139,92,246,.2);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0">${p.icon||'📢'}</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;font-size:.88rem;color:rgba(255,255,255,.9)">${p.title||'Xabar'}</div>
            <div style="font-size:.68rem;color:rgba(255,255,255,.4);margin-top:2px">${d}</div>
          </div>
        </div>
        ${p.text ? `<div style="font-size:.83rem;color:rgba(255,255,255,.7);line-height:1.55;padding-left:44px">${p.text}</div>` : ''}
        ${p.img ? `<img src="${p.img}" style="width:100%;border-radius:9px;margin-top:9px;max-height:200px;object-fit:cover" alt="">` : ''}
      </div>`;
    }).join('')}
  </div>`;
}


// ============================================================
// GURUH JADVAL SOZLAMALARI
// ============================================================
function renderGroupScheduleSettings() {
  const el = document.getElementById('group-schedule-settings');
  if (!el) return;
  const groups = DATA.groups || {};
  const gids   = Object.keys(groups);
  if (!gids.length) {
    el.innerHTML = '<div style="font-size:.8rem;color:var(--text2);padding:8px 0">Hali guruh qo\'shilmagan</div>';
    return;
  }
  const dayNames = [
    {label:'Du',  val:1},{label:'Se',  val:2},{label:'Cho', val:3},
    {label:'Pay', val:4},{label:'Ju',  val:5},{label:'Sha', val:6},{label:'Ya',  val:0}
  ];
  el.innerHTML = gids.map(gid => {
    const g    = groups[gid];
    const sch  = g.schedule  || '';
    const time = g.classTime || '14:00';
    const days = g.classDays || [];  // [1,3,5] = Du,Cho,Ju
    return `<div class="card" style="margin-bottom:8px;padding:12px 14px">
      <div style="font-weight:700;font-size:.88rem;color:var(--text);margin-bottom:10px">📚 ${g.name}</div>

      <div style="margin-bottom:8px">
        <div style="font-size:.72rem;color:var(--text2);font-weight:600;margin-bottom:6px">DARS KUNLARI (tanlang)</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap" id="days-${gid}">
          ${dayNames.map(d => {
            const on = days.includes(d.val);
            return `<button onclick="toggleDay('${gid}',${d.val},this)"
              style="padding:5px 10px;border-radius:7px;border:1.5px solid ${on?'var(--blue)':'var(--border)'};
              background:${on?'rgba(59,130,246,.15)':'transparent'};color:${on?'var(--blue)':'var(--text2)'};
              font-size:.78rem;font-weight:700;cursor:pointer"
              data-on="${on}">${d.label}</button>`;
          }).join('')}
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <div style="flex:1">
          <div style="font-size:.72rem;color:var(--text2);font-weight:600;margin-bottom:4px">DARS VAQTI</div>
          <input type="time" class="sr-inp" id="time-${gid}" value="${time}" style="width:120px">
        </div>
        <div style="flex:1">
          <div style="font-size:.72rem;color:var(--text2);font-weight:600;margin-bottom:4px">MATN (ixtiyoriy)</div>
          <input class="sr-inp" id="sch-${gid}" value="${sch}" placeholder="Du,Cho,Ju 14:00" style="width:100%">
        </div>
      </div>

      <button class="btn btn-sm btn-success" onclick="saveGroupSchedule('${gid}')" style="width:100%;margin-top:4px">
        ✓ Saqlash — tizim keyingi darsni o'zi hisoblaydi
      </button>

      <div id="next-preview-${gid}" style="margin-top:6px;font-size:.75rem;color:var(--green)"></div>
    </div>`;
  }).join('');

  // Preview ko'rsatish
  gids.forEach(gid => computeAndPreviewNext(gid));
}

// Kun tugmasini bosish
window.toggleDay = function(gid, dayNum, btn) {
  const g = DATA.groups[gid];
  if (!g) return;
  if (!g.classDays) g.classDays = [];
  const idx = g.classDays.indexOf(dayNum);
  if (idx >= 0) {
    g.classDays.splice(idx, 1);
    btn.style.background = 'transparent';
    btn.style.borderColor = 'var(--border)';
    btn.style.color = 'var(--text2)';
    btn.dataset.on = 'false';
  } else {
    g.classDays.push(dayNum);
    btn.style.background = 'rgba(59,130,246,.15)';
    btn.style.borderColor = 'var(--blue)';
    btn.style.color = 'var(--blue)';
    btn.dataset.on = 'true';
  }
  computeAndPreviewNext(gid);
};

// Keyingi dars sanasini hisoblash (classDays + classTime asosida)
function toLocalISOStr(d) {
  const p = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function computeNextClassDt(classDays, classTime) {
  if (!classDays || !classDays.length || !classTime) return null;
  const [hh, mm] = classTime.split(':').map(Number);
  const now = new Date();
  // Keyingi 14 kun ichida eng yaqin kun topiladi
  for (let offset = 0; offset <= 14; offset++) {
    const d = new Date(now);
    d.setDate(now.getDate() + offset);
    d.setHours(hh, mm, 0, 0);
    const weekday = d.getDay(); // 0=Yak,1=Du,...6=Sha
    if (classDays.includes(weekday)) {
      // Bugun bo'lsa, dars vaqti o'tib ketmaganmi tekshir
      if (offset === 0 && d <= now) continue;
      return d;
    }
  }
  return null;
}

function computeAndPreviewNext(gid) {
  const g = DATA.groups[gid];
  if (!g) return;
  const days = g.classDays || [];
  const timeEl = document.getElementById('time-' + gid);
  const time = timeEl ? timeEl.value : (g.classTime || '14:00');
  const prevEl = document.getElementById('next-preview-' + gid);
  if (!prevEl) return;

  const nextDt = computeNextClassDt(days, time);
  if (!nextDt) {
    prevEl.textContent = '';
    return;
  }
  const opts = {weekday:'long', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'};
  prevEl.innerHTML = `⏰ Keyingi dars: <b>${nextDt.toLocaleDateString('uz-UZ', opts)}</b>`;
}

window.saveGroupSchedule = async function(gid) {
  const schEl  = document.getElementById('sch-' + gid);
  const timeEl = document.getElementById('time-' + gid);
  if (!DATA.groups[gid]) return;

  const sch  = schEl  ? schEl.value.trim()  : '';
  const time = timeEl ? timeEl.value.trim() : '14:00';
  const days = DATA.groups[gid].classDays || [];

  // Avtomatik keyingi dars hisoblash
  const nextDt = computeNextClassDt(days, time);
  const nextDtStr = nextDt ? toLocalISOStr(nextDt) : '';

  DATA.groups[gid].schedule    = sch;
  DATA.groups[gid].classTime   = time;
  DATA.groups[gid].nextClassDt = nextDtStr;

  saveLocal();
  computeAndPreviewNext(gid);
  toast('✅ Jadval saqlandi — keyingi dars avtomatik hisoblandi');
  fbUpdate('groups/' + gid, {
    schedule:    sch,
    classTime:   time,
    classDays:   days,
    nextClassDt: nextDtStr
  }).catch(e => console.warn('fb:', e));
};

// ============================================================
// E'LONLAR SAHIFASI (Mehmon)
// ============================================================
function renderGuestPostsPage() {
  const el = document.getElementById('gp-posts-list');
  if (!el) return;
  const posts = DATA.posts || {};
  const entries = Object.entries(posts)
    .filter(([,p]) => p.aud === 'guest' || p.aud === 'both')
    .sort((a,b) => b[1].createdAt - a[1].createdAt);
  if (!entries.length) {
    el.innerHTML = '<div style="text-align:center;padding:40px 20px;color:rgba(255,255,255,.4)"><div style="font-size:2.5rem;margin-bottom:10px">📭</div><div style="font-size:.88rem">Hali e\'lon yo\'q</div></div>';
    return;
  }
  el.innerHTML = entries.map(([,p]) => {
    const d = new Date(p.createdAt).toLocaleDateString('uz-UZ',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
    return `<div class="guest-post" style="margin-bottom:10px">
      <div class="guest-post-header">
        <div class="guest-post-icon">${p.icon||'📢'}</div>
        <div>
          <div class="guest-post-title">${p.title||'Xabar'}</div>
          <div class="guest-post-date">${d}</div>
        </div>
      </div>
      ${p.text ? `<div class="guest-post-body">${p.text}</div>` : ''}
      ${p.img ? `<img class="guest-post-img" src="${p.img}" alt="">` : ''}
    </div>`;
  }).join('');
  // Dot yashirish
  const dot = document.getElementById('gnav-posts-dot');
  if (dot) dot.style.display = 'none';
}

// E'lonlar dot ko'rsatish (yangi post kelganda)
function checkGuestPostsDot() {
  const posts = DATA.posts || {};
  const hasPosts = Object.values(posts).some(p => p.aud === 'guest' || p.aud === 'both');
  const dot = document.getElementById('gnav-posts-dot');
  if (!dot) return;
  // Agar joriy sahifa posts emas va postlar bor bo'lsa
  const activePage = document.querySelector('.guest-page.active');
  const isPostsPage = activePage && activePage.id === 'gp-posts';
  dot.style.display = (hasPosts && !isPostsPage) ? 'block' : 'none';
}

// ============================================================
// ════════════════════════════════════════════════════════════
// AUTO COUNTDOWN — har daqiqada yangilanadi, o'tib ketsa keyingisini topadi
// ════════════════════════════════════════════════════════════
(function startCountdownTimer() {
  let _interval = null;

  function _refreshNextDt(gid) {
    // Agar nextClassDt o'tib ketgan bo'lsa, yangi hisobla va Firebasega yoz
    const group = DATA.groups && DATA.groups[gid];
    if (!group) return;
    const days = group.classDays || [];
    const time = group.classTime || '';
    if (!days.length || !time) return;
    const existing = group.nextClassDt ? new Date(group.nextClassDt) : null;
    if (existing && existing > new Date()) return; // hali o'tmagan
    // Yangi hisobla
    const next = computeNextClassDt(days, time);
    if (!next) return;
    const nextStr = toLocalISOStr(next);
    group.nextClassDt = nextStr;
    try { fbUpdate('groups/' + gid, { nextClassDt: nextStr }); } catch(e) {}
  }

  function _formatCountdown(diff) {
    if (diff <= 0) return null;
    const days = Math.floor(diff / 86400000);
    const h    = Math.floor((diff % 86400000) / 3600000);
    const m    = Math.floor((diff % 3600000) / 60000);
    const s    = Math.floor((diff % 60000) / 1000);
    if (days > 0) return `${days} kun ${h} soat`;
    return `${h} soat ${m} daqiqa ${s} soniya`;
  }

  function _makeCountdownHtml(label, timeStr) {
    return `<div class="countdown-box">
      <div class="cd-icon">⏱️</div>
      <div><div class="cd-label">${label}</div>
      <div class="cd-time" id="live-countdown">${timeStr}</div></div>
    </div>`;
  }

  function _tick() {
    // ── Ota-ona uchun ────────────────────────────────────
    if (CU && CU.role === 'parent') {
      const gid   = CU.gid;
      _refreshNextDt(gid);
      const group = DATA.groups && DATA.groups[gid];
      const ndt   = group && group.nextClassDt ? group.nextClassDt : '';
      if (ndt) {
        const diff = new Date(ndt) - new Date();
        const cdEl = document.getElementById('live-countdown');
        if (cdEl) {
          if (diff <= 0) {
            _refreshNextDt(gid);
          } else {
            cdEl.textContent = _formatCountdown(diff);
          }
        }
      }
    }

    // ── Admin uchun (bosh sahifada barcha guruhlar) ───────
    if (CU && CU.role === 'admin') {
      const groups = DATA.groups || {};
      Object.keys(groups).forEach(gid => {
        _refreshNextDt(gid);
        const el = document.getElementById('admin-cd-' + gid);
        if (!el) return;
        const ndt = groups[gid].nextClassDt || '';
        if (!ndt) { el.textContent = 'Jadval kiritilmagan'; return; }
        const diff = new Date(ndt) - new Date();
        el.textContent = diff > 0 ? _formatCountdown(diff) : 'Dars boshlandi!';
      });
    }
  }

  if (_interval) clearInterval(_interval);
  _interval = setInterval(_tick, 1000);
  window._countdownTick = _tick; // tashqaridan chaqirish uchun
})();



// Habar status kuzatish — Yuborildi → Yetkazildi ✓
function checkLetterStatus() {
  const lid = localStorage.getItem('jm_sent_letter');
  if (!lid) return;
  const msgEl = document.getElementById('enroll-msg');
  if (!msgEl) return;
  // Real-time: DATA dan tekshirish (onValue orqali yangilanadi)
  function checkOnce() {
    const letter = DATA.letters && DATA.letters[lid];
    if (!letter) return; // o'chirilgan
    if (letter.acknowledged) {
      msgEl.style.display = 'block';
      msgEl.style.color = '#10B981';
      msgEl.innerHTML = "✅✅ <b>Yetkazildi</b> — o'qituvchi ko'rdi!";
      localStorage.removeItem('jm_sent_letter'); // bir marta ko'rsatildi
    } else {
      msgEl.style.display = 'block';
      msgEl.style.color = '#F59E0B';
      msgEl.textContent = "📤 Yuborildi — o'qituvchi ko'rib chiqmoqda...";
    }
  }
  checkOnce();
  // Sahifa ochilganda ham tekshirish uchun global hook
  window._pendingLetterCheck = checkOnce;
}

// Sahifa har ochilganda pending letter check
function initLetterStatusCheck() {
  const lid = localStorage.getItem('jm_sent_letter');
  if (!lid) return;
  // DATA yangilanganda tekshiriladi
  const orig = window._onDataRefresh;
  window._onDataRefresh = function() {
    if (orig) orig();
    if (window._pendingLetterCheck) window._pendingLetterCheck();
  };
  checkLetterStatus();
}
