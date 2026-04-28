// ============================================================
// SETTINGS
// ============================================================
window.saveSettingName = async function() {
  const n = document.getElementById('set-name').value.trim();
  if (!n) return;
  DATA.settings.siteName = n;
  saveLocal();
  applySettings();
  const el = document.getElementById('pwa-app-name');
  if (el) el.textContent = n;
  toast('✅ Saqlandi');
  fbUpdate('settings', { siteName: n }).catch(e => console.warn('fb:', e));
};

window.saveBgUrl = async function() {
  const url = (document.getElementById('set-bg-url').value || '').trim();
  DATA.settings.bgUrl = url;
  DATA.settings.bgEnabled = true;
  saveLocal();
  applySettings();
  toast(url ? '🖼️ Fon rasmi qo\'yildi!' : '✅ Fon tozalandi');
  fbUpdate('settings', { bgUrl: url, bgEnabled: true }).catch(e => console.warn('fb:', e));
};
window.clearBgUrl = async function() {
  DATA.settings.bgUrl = '';
  DATA.settings.bgEnabled = false;
  document.getElementById('set-bg-url').value = '';
  saveLocal();
  applySettings();
  toast('✅ Fon rasmi o\'chirildi');
  fbUpdate('settings', { bgUrl: '', bgEnabled: false }).catch(e => console.warn('fb:', e));
};

// ── ICON UPLOAD ─────────────────────────────────────────────
window.handleIconUpload = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 512 * 1024) { toast('❌ Rasm 512KB dan kichik bo\'lsin!'); return; }
  const statusEl = document.getElementById('icon-upload-status');
  const preview = document.getElementById('icon-preview');
  if (statusEl) statusEl.textContent = '⏳ Yuklanmoqda...';
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64 = e.target.result;
    // Preview
    if (preview) { preview.src = base64; preview.style.display = 'block'; }
    // URL input ga ham qo'yamiz
    const urlInp = document.getElementById('set-icon-url');
    if (urlInp) urlInp.value = base64;
    if (statusEl) statusEl.textContent = '✅ Tayyor — "Saqlash" ni bosing';
  };
  reader.onerror = function() {
    if (statusEl) statusEl.textContent = '❌ Xato yuz berdi';
  };
  reader.readAsDataURL(file);
};

window.saveIconUrl = async function() {
  const url = (document.getElementById('set-icon-url').value || '').trim();
  if (!url) { toast('❌ Rasm tanlang yoki URL kiriting!'); return; }
  DATA.settings.iconUrl = url;
  saveLocal();
  applySettings();
  toast('✅ Ikonka saqlandi!');
  fbUpdate('settings', { iconUrl: url }).catch(e => console.warn('fb:', e));
};

window.clearIconUrl = async function() {
  DATA.settings.iconUrl = '';
  const urlInp = document.getElementById('set-icon-url');
  const preview = document.getElementById('icon-preview');
  const fileInp = document.getElementById('icon-file-input');
  if (urlInp) urlInp.value = '';
  if (preview) { preview.src = ''; preview.style.display = 'none'; }
  if (fileInp) fileInp.value = '';
  saveLocal();
  applySettings();
  toast('✅ Ikonka o\'chirildi');
  fbUpdate('settings', { iconUrl: '' }).catch(e => console.warn('fb:', e));
};
  const url = (document.getElementById('set-logo-url').value || '').trim();
  DATA.settings.logoUrl = url;
  saveLocal();
  applySettings();
  toast(url ? '🖼️ Logo qo\'yildi!' : '✅ Logo tozalandi');
  fbUpdate('settings', { logoUrl: url }).catch(e => console.warn('fb:', e));
};
window.clearLogoUrl = async function() {
  DATA.settings.logoUrl = '';
  const el = document.getElementById('set-logo-url');
  if (el) el.value = '';
  saveLocal();
  applySettings();
  toast('✅ Logo o\'chirildi');
  fbUpdate('settings', { logoUrl: '' }).catch(e => console.warn('fb:', e));
};
window.saveBgEnabled = async function() {
  var val = document.getElementById('set-bg-enabled').checked;
  DATA.settings.bgEnabled = val;
  saveLocal();
  applySettings();
  toast(val ? '🖼️ Fon yoqildi' : '⏹️ Fon o\'chirildi');
  fbUpdate('settings', { bgEnabled: val }).catch(e => console.warn('fb:', e));
};

window.saveBgAnim = async function() {
  var val = document.getElementById('set-bg-anim').checked;
  DATA.settings.bgAnim = val;
  saveLocal();
  applySettings();
  toast(val ? '🎉 Animatsiya yoqildi' : '⏹️ Animatsiya o\'chirildi');
  fbUpdate('settings', { bgAnim: val }).catch(e => console.warn('fb:', e));
};

window.saveAnimStyle = async function(n) {
  DATA.settings.animStyle = n;
  saveLocal();
  applySettings();
  var names = {1:'🌊 To\'lqin', 2:'✨ Zarrachalar', 3:'🏅 Shahar', 4:'🔮 Matrix'};
  toast(names[n] || 'Uslub almashdi');
  fbUpdate('settings', { animStyle: n }).catch(e => console.warn('fb:', e));
};

window.saveLoginTitle = async function() {
  const n = document.getElementById('set-login-title').value.trim();
  DATA.settings.loginTitle = n;
  saveLocal();
  applySettings();
  toast('✅ Kirish sarlavhasi saqlandi');
  fbUpdate('settings', { loginTitle: n }).catch(e => console.warn('fb:', e));
};

window.saveScoringLimits = async function() {
  const uvMax   = parseInt(document.getElementById('set-uv-max').value)   || 50;
  const mtMax   = parseInt(document.getElementById('set-mt-max').value)   || 25;
  const faolMax = parseInt(document.getElementById('set-faol-max').value) || 25;
  if (uvMax < 1 || mtMax < 1 || faolMax < 1) { toast('❌ Minimal qiymat 1!'); return; }
  DATA.settings.uvMax   = uvMax;
  DATA.settings.mtMax   = mtMax;
  DATA.settings.faolMax = faolMax;
  saveLocal();
  applySettings();
  if (typeof buildGradeForm === 'function') buildGradeForm();
  toast(`✅ UV: ${uvMax} · MT: ${mtMax} · Faollik: ${faolMax} · Jami: ${uvMax+mtMax+faolMax}`);
  fbUpdate('settings', { uvMax, mtMax, faolMax }).catch(e => console.warn('fb:', e));
};

window.saveVersion = async function() {
  const v = document.getElementById('set-version').value.trim();
  if (!v) return;
  DATA.settings.appVersion = v;
  saveLocal();
  applySettings();
  toast('✅ Versiya saqlandi');
  fbUpdate('settings', { appVersion: v }).catch(e => console.warn('fb:', e));
};
window.saveSettingPass = async function() {
  const p = document.getElementById('set-pass').value;
  if (!p || p.length < 3) { toast('❌ Kamida 3 belgi!'); return; }
  DATA.settings.adminPass = p;
  saveLocal();
  document.getElementById('set-pass').value = '';
  toast('✅ Parol o\'zgartirildi');
  fbUpdate('settings', { adminPass: p }).catch(e => console.warn('fb:', e));
};
window.saveSettingSchedule = async function() {
  const s = document.getElementById('set-schedule').value.trim();
  DATA.settings.schedule = s;
  saveLocal();
  toast('✅ Saqlandi');
  fbUpdate('settings', { schedule: s }).catch(e => console.warn('fb:', e));
};
window.clearAllData = async function() {
  if (!confirm('BARCHA ma\'lumotlar o\'chadi!')) return;
  if (!confirm('Haqiqatan ham?')) return;
  DATA = { groups:{}, videos:{}, notifications:{}, posts:{}, apps:{}, letters:{}, settings:{ adminPass:'sara', siteName:'Jaloliddin Math', schedule:'', uvMax:50, mtMax:25, faolMax:25 } };
  saveLocal();
  toast('🗑️ Tozalandi');
  fbSet('/', DATA).catch(e => console.warn('fb:', e));
  logout();
};

// ============================================================
// PARENT HOME
// ============================================================
function renderParentHome() {
  if (!CU || CU.role !== 'parent') return;
  const { sid, gid, name } = CU;
  // Safe checks — don't return early, show placeholder instead
  const group = (DATA.groups && DATA.groups[gid]) ? DATA.groups[gid] : null;
  const stu   = group ? (group.students && group.students[sid] ? group.students[sid] : null) : null;

  // Student name hello + countdown — guruh asosida
  const grpSchedule = (group && group.schedule) ? group.schedule
                    : (DATA.settings && DATA.settings.schedule) ? DATA.settings.schedule : '';
  // nextClassDt: guruhdan ol, kerak bo'lsa classDays+classTime dan hisobla
  let grpNextDt = (group && group.nextClassDt) ? group.nextClassDt
                : (DATA.settings && DATA.settings.nextClassDt) ? DATA.settings.nextClassDt : '';
  if (!grpNextDt && group && group.classDays && group.classDays.length && group.classTime) {
    const auto = computeNextClassDt(group.classDays, group.classTime);
    if (auto) grpNextDt = toLocalISOStr(auto);
  }
  const scheduleLabel = grpSchedule || (group && group.classTime ?
    `${(group.classDays||[]).map(d=>['Ya','Du','Se','Cho','Pay','Ju','Sha'][d]).join(',')} ${group.classTime}` :
    'Belgilanmagan');

  let countdownHtml = '';
  if (grpNextDt) {
    const diff = new Date(grpNextDt) - new Date();
    if (diff > 0) {
      const days = Math.floor(diff / 86400000);
      const h  = Math.floor((diff % 86400000) / 3600000);
      const m2 = Math.floor((diff % 3600000) / 60000);
      const timeStr = days > 0 ? `${days} kun ${h} soat` : `${h} soat ${m2} daqiqa`;
      countdownHtml = `<div class="countdown-box"><div class="cd-icon">⏱️</div><div>
        <div class="cd-label">Darsga qoldi</div>
        <div class="cd-time" id="live-countdown">${timeStr}</div>
      </div></div>`;
    }
  }
  const helloEl = document.getElementById('parent-hello-box');
  if (helloEl) {
    helloEl.innerHTML = `
    <div class="parent-hello">
      <div class="ph-name">👋 ${getLbl('hello','Xush kelibsiz')}, ${name ? name.split(' ')[0] : ''}!</div>
      <div class="ph-group">📚 ${group ? group.name : '—'} · Dars: ${scheduleLabel}</div>
      ${countdownHtml}
    </div>`;
  }

  // Notifications for parent
  renderNotifsParent();

  // Stories (videos) — always render
  const videos = Object.entries(DATA.videos || {}).sort((a,b) => b[1].createdAt - a[1].createdAt).slice(0,10);
  const storiesEl = document.getElementById('stories-box');
  if (storiesEl) {
    storiesEl.innerHTML = videos.length ? `
      <div class="card" style="padding:12px 16px">
        <div class="card-title">🎬 Videolar</div>
        <div class="stories-row">
          ${videos.map(([vid,v]) => `
            <div class="story-item" onclick="watchVideo('${vid}')">
              <div class="story-ring"><div class="story-inner">▶️</div></div>
              <div class="story-lbl">${v.title}</div>
            </div>`).join('')}
        </div>
      </div>` : '';
  }

  // If no student data yet, show placeholder for score sections
  if (!stu) {
    const circEl = document.getElementById('circ-progress-wrap');
    if (circEl) circEl.innerHTML = '<div style="padding:20px;color:var(--text2);font-size:.85rem">Ma\'lumot yuklanmoqda...</div>';
    const statsEl = document.getElementById('parent-home-stats');
    if (statsEl) statsEl.innerHTML = '';
    const recentEl = document.getElementById('parent-recent');
    if (recentEl) recentEl.innerHTML = '<div class="empty" style="padding:16px 0"><div class="ei">📅</div><p>Hali natija yo\'q</p></div>';
    return;
  }

  // Circular progress — yangi chiroyli dizayn
  const allAvg = getAvg(sid, gid, 'all') ?? 0;
  renderCircularProgress(allAvg);

  // Stats
  const todayR    = stu.records ? stu.records[today()] : null;
  const monthAvg  = getAvg(sid, gid, 'month');
  const totalDays = getValidRecords(sid, gid).length;
  const statsEl = document.getElementById('parent-home-stats');
  if (statsEl) {
    statsEl.innerHTML = `
    <div class="stat-box"><div class="sv" style="color:var(--green)">${todayR ? todayR.percent+'%' : '—'}</div><div class="sl">Bugun</div></div>
    <div class="stat-box"><div class="sv" style="color:var(--blue)">${monthAvg!==null?monthAvg+'%':'—'}</div><div class="sl">Bu oy</div></div>
    <div class="stat-box"><div class="sv" style="color:var(--yellow)">${totalDays}</div><div class="sl">Darslar</div></div>`;
  }

  // Recent 5 records
  const recent = getValidRecords(sid, gid).reverse().slice(0,5);
  const recentEl = document.getElementById('parent-recent');
  if (recentEl) {
    recentEl.innerHTML = !recent.length
      ? '<div class="empty" style="padding:16px 0"><div class="ei">📅</div><p>Hali natija yo\'q</p></div>'
      : recent.map(rec => `
        <div class="hist-row">
          <div style="flex:1">
            <div class="hist-date">${fmtDate(rec.dateKey)}</div>
            <div class="hist-sub">UV:${rec.uv}/50 · MT:${rec.mt}/25 · ${rec.qatnashdi?'✅':'❌'}</div>
          </div>
          <span class="score-badge ${scoreClass(rec.percent)}">${rec.percent}%</span>
        </div>`).join('');
  }
}

// ============================================================
// VIDEO MODAL
// ============================================================
window.watchVideo = function(vid) {
  const v = DATA.videos[vid];
  if (!v) return;
  document.getElementById('vid-modal-title').textContent = v.title;
  const embed = getYoutubeEmbedUrl(v.url);
  document.getElementById('vid-container').innerHTML = embed
    ? `<iframe src="${embed}" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin"></iframe>`
    : `<div style="padding:20px;color:var(--text2);text-align:center">Noto'g'ri YouTube URL</div>`;
  openModal('m-video');
};

window.closeVideoModal = function() {
  document.getElementById('vid-container').innerHTML = '';
  closeModal('m-video');
};

window.saveSettingNextDt = async function() {
  const v = document.getElementById('set-nextdt').value;
  DATA.settings.nextClassDt = v;
  saveLocal(); fbUpdate('settings', { nextClassDt: v }).catch(e => console.warn('fb:', e));
  toast('✅ Dars vaqti saqlandi');
};

// ============================================================
// POSTS & NOTIFICATIONS (7-reja)
// ============================================================
window._audParent = true;
window._audGuest  = true;

window.toggleAud = function(type) {
  try {
    if (type === 'parent') {
      window._audParent = !window._audParent;
      var b = document.getElementById('aud-parent');
      if (b) { b.classList.toggle('on', window._audParent); }
    } else {
      window._audGuest = !window._audGuest;
      var b2 = document.getElementById('aud-guest');
      if (b2) { b2.classList.toggle('on', window._audGuest); }
    }
  } catch(e) { console.error('toggleAud error:', e); }
};

window.addPost = function() {
  try {
    var titleEl = document.getElementById('post-title');
    var textEl  = document.getElementById('post-text');
    var imgEl   = document.getElementById('post-img');
    var iconEl  = document.getElementById('post-icon');
    var title = titleEl ? titleEl.value.trim() : '';
    var text  = textEl  ? textEl.value.trim()  : '';
    var img   = imgEl   ? imgEl.value.trim()   : '';
    var icon  = iconEl  ? iconEl.value         : '📢';
    if (!title && !text) { toast('❌ Sarlavha yoki matn kiriting!'); return; }
    if (!window._audParent && !window._audGuest) { toast('❌ Kamida bitta tanlang!'); return; }
    var aud = (window._audParent && window._audGuest) ? 'both'
            : (window._audParent ? 'parent' : 'guest');
    var pid = genId();
    if (!DATA.posts) DATA.posts = {};
    if (!DATA.notifications) DATA.notifications = {};
    var postData = { title: title, text: text, img: img, icon: icon, aud: aud, createdAt: nowTs() };
    DATA.posts[pid] = postData;
    // Ota-onalarga bildirishnoma ham yuborish
    if (window._audParent) {
      var notifData = { text: (title ? title + ': ' : '') + text, icon: icon, createdAt: nowTs() };
      DATA.notifications[pid] = notifData;
      fbSet('notifications/' + pid, notifData).catch(function(e){ console.warn('notif err',e); });
    }
    fbSet('posts/' + pid, postData).catch(function(){ saveLocal(); });
    if (titleEl) titleEl.value = '';
    if (textEl)  textEl.value  = '';
    if (imgEl)   imgEl.value   = '';
    renderNotifsAdmin();
    renderGuestPosts();
    renderNotifsParent();
    toast('✅ Post yuborildi!');
  } catch(e) { console.error('addPost error:', e); toast('❌ Xatolik: ' + e.message); }
};

window.deletePost = function(pid) {
  if (!confirm('Postni o\'chirmoqchimisiz?')) return;
  delete DATA.posts[pid];
  delete DATA.notifications[pid];
  // UI ni darhol yangilaymiz
  renderNotifsAdmin();
  renderGuestPosts();
  renderNotifsParent();
  renderGuestHomePosts();
  toast('🗑️ O\'chirildi');
  // Firebase ga async yuboramiz
  Promise.all([
    fbRemove('posts/' + pid),
    fbRemove('notifications/' + pid)
  ]).catch(function(e){ console.warn('delete err',e); });
};

window.deleteNotif = function(nid) {
  delete DATA.notifications[nid];
  delete DATA.posts[nid];
  renderNotifsAdmin();
  renderGuestPosts();
  renderGuestHomePosts();
  toast('🗑️ O\'chirildi');
  Promise.all([
    fbRemove('notifications/' + nid),
    fbRemove('posts/' + nid)
  ]).catch(function(){});
};

function buildPostCard(p, pid, showDel, showAud) {
  var audLabel = { both: '👨‍👩‍👧 + 👥 Ikkalasiga', parent: '👨‍👩‍👧 Ota-onaga', guest: '👥 Mehmonga' };
  var audClass = { both: 'aud-both', parent: 'aud-parent', guest: 'aud-guest' };
  var ac = audClass[p.aud] || 'aud-both';
  var al = audLabel[p.aud] || 'Ikkalasiga';
  var date = new Date(p.createdAt).toLocaleDateString('uz-UZ',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
  return '<div class="post-card">'
    + (showDel && pid ? '<button class="post-card-del" onclick="deletePost(&quot;'+pid+'&quot;)">🗑️</button>' : '')
    + (p.img ? '<div class="post-card-img-wrap"><img class="post-card-img" src="'+p.img+'"><div class="post-card-img-overlay"></div></div>' : '')
    + '<div class="post-card-body-wrap">'
    + '<div class="post-card-header">'
    + '<div class="post-card-icon">'+(p.icon||'📢')+'</div>'
    + '<div class="post-card-meta">'
    + (p.title ? '<div class="post-card-title">'+p.title+'</div>' : '')
    + '<div class="post-card-date">'+date+'</div>'
    + (showAud ? '<span class="post-card-audience '+ac+'">'+al+'</span>' : '')
    + '</div></div>'
    + (p.text ? '<div class="post-card-body">'+p.text+'</div>' : '')
    + '</div></div>';
}

function renderNotifsAdmin() {
  var posts = DATA.posts || {};
  var container = document.getElementById('notifs-admin-list');
  if (!container) return;
  var entries = Object.entries(posts).sort(function(a,b){ return b[1].createdAt - a[1].createdAt; });
  if (!entries.length) {
    container.innerHTML = '<div class="empty"><div class="ei">📣</div><p>Hali post yo\'q</p></div>';
    return;
  }
  var audLabel = { both: '👨‍👩‍👧 + 👥 Ikkalasiga', parent: '👨‍👩‍👧 Ota-onaga', guest: '👥 Mehmonga' };
  var audClass = { both: 'aud-both', parent: 'aud-parent', guest: 'aud-guest' };
  var html = '';
  entries.forEach(function(entry) {
    var pid = entry[0]; var p = entry[1];
    var ac = audClass[p.aud] || 'aud-both';
    var al = audLabel[p.aud] || 'Ikkalasiga';
    html += buildPostCard(p, pid, true, true);
  });
  container.innerHTML = html;
}

function renderNotifsParent() {
  var posts = DATA.posts || {};
  var box = document.getElementById('notifs-parent-box');
  if (!box) return;
  var entries = Object.entries(posts)
    .filter(function(e){ return e[1].aud === 'parent' || e[1].aud === 'both'; })
    .sort(function(a,b){ return b[1].createdAt - a[1].createdAt; })
    .slice(0, 8);
  // fallback: old notifications without posts
  if (!entries.length) {
    var notifs = DATA.notifications || {};
    var ne = Object.entries(notifs).sort(function(a,b){ return b[1].createdAt - a[1].createdAt; }).slice(0,5);
    if (!ne.length) { box.innerHTML = ''; return; }
    var nhtml = '<div class="card" style="padding:14px 16px;margin-bottom:12px"><div class="card-title">🔔 Xabarlar</div>';
    ne.forEach(function(en){ var n=en[1];
      nhtml += '<div class="notif-item"><div class="ni-icon">'+(n.icon||'📢')+'</div><div class="ni-body"><div class="ni-text">'+n.text+'</div><div class="ni-date">'+new Date(n.createdAt).toLocaleDateString('uz-UZ',{day:'2-digit',month:'short'})+'</div></div></div>';
    });
    box.innerHTML = nhtml + '</div>';
    return;
  }
  var html = '';
  entries.forEach(function(entry){ var p = entry[1];
    html += buildPostCard(p, null, false, false);
  });
  box.innerHTML = html;
}
