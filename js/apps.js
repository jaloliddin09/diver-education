// ============================================================
// APPS / DASTURLAR
// ============================================================
function renderAdminApps() {
  const apps = DATA.apps || {};
  const el = document.getElementById('admin-apps-list');
  if (!el) return;
  const entries = Object.entries(apps).sort((a,b) => b[1].createdAt - a[1].createdAt);
  if (!entries.length) {
    el.innerHTML = "<div class=\"empty\"><div class=\"ei\">📱</div><p>Hali dastur qo'shilmagan</p></div>";
    return;
  }
  let html = '<div class="apps-grid">';
  entries.forEach(function(entry) {
    const id = entry[0]; const a = entry[1];
    const ot = a.openType || 'tab';
    const typeLabel = ot === 'iframe' ? '📱 Ichida' : '🔗 Yangi tab';
    html += '<div class="app-card" onclick="openApp(this)"' + ' data-url="' + (a.url||'').replace(/"/g,'&quot;') + '"' + ' data-name="' + (a.name||'').replace(/"/g,'&quot;') + '"' + ' data-type="' + ot + '">'
      + '<button class="ac-del" onclick="event.stopPropagation();deleteApp(&quot;' + id + '&quot;)">✕</button>'
      + '<div class="ac-icon">' + (a.icon || '📱') + '</div>'
      + '<div class="ac-name">' + a.name + '</div>'
      + (a.desc ? '<div class="ac-desc">' + a.desc + '</div>' : '')
      + '<div class="ac-type">' + typeLabel + '</div>'
      + '</div>';
  });
  html += '</div>';
  el.innerHTML = html;
}

function renderParentApps() {
  const apps = DATA.apps || {};
  const el = document.getElementById('parent-apps-grid');
  if (!el) return;
  const entries = Object.entries(apps).sort((a,b) => b[1].createdAt - a[1].createdAt);
  if (!entries.length) {
    el.innerHTML = "<div class=\"empty\" style=\"grid-column:1/-1\"><div class=\"ei\">📱</div><p>Hali dastur qo'shilmagan</p></div>";
    return;
  }
  let html = '';
  entries.forEach(function(entry) {
    const id = entry[0]; const a = entry[1];
    const ot = a.openType || 'tab';
    html += '<div class="parent-app-card" onclick="openApp(this)"' + ' data-url="' + (a.url||'').replace(/"/g,'&quot;') + '"' + ' data-name="' + (a.name||'').replace(/"/g,'&quot;') + '"' + ' data-type="' + ot + '">'
      + '<div class="pac-icon">' + (a.icon || '📱') + '</div>'
      + '<div class="pac-name">' + a.name + '</div>'
      + (a.desc ? '<div class="pac-desc">' + a.desc + '</div>' : '')
      + '</div>';
  });
  el.innerHTML = html;
}

function renderGuestApps() {
  const apps = DATA.apps || {};
  const el = document.getElementById('guest-apps-section');
  if (!el) return;
  const entries = Object.entries(apps).sort((a,b) => b[1].createdAt - a[1].createdAt);
  if (!entries.length) {
    el.innerHTML = '<div class="guest-empty"><div class="ei">📱</div><p>Hali dastur qo\'shilmagan</p></div>';
    return;
  }
  let cards = '';
  entries.forEach(function(entry) {
    const a = entry[1];
    const ot = a.openType || 'tab';
    cards += '<div class="guest-app-card" onclick="openApp(this)"'
      + ' data-url="' + (a.url||'').replace(/"/g,'&quot;') + '"'
      + ' data-name="' + (a.name||'').replace(/"/g,'&quot;') + '"'
      + ' data-type="' + ot + '">'
      + '<div class="gac-icon">' + (a.icon || '📱') + '</div>'
      + '<div class="gac-name">' + a.name + '</div>'
      + (a.desc ? '<div class="gac-desc">' + a.desc + '</div>' : '')
      + '</div>';
  });
  el.innerHTML = '<div class="guest-apps-grid">' + cards + '</div>';
}

window.openApp = function(el, n2, t2) {
  var url, name, openType;
  if (typeof el === 'string') { url=el; name=n2; openType=t2; }
  else { url=el.dataset.url; name=el.dataset.name; openType=el.dataset.type; }
  if (!url) return;

  // Mahalliy /apps/ fayllar — har doim iframe (bir xil domen, xavfsiz)
  var isLocal = url.startsWith('./') || url.startsWith('/apps/') || (!url.startsWith('http') && !url.startsWith('//'));
  var useIframe = (openType === 'iframe') || isLocal;

  if (useIframe) {
    var m = document.getElementById('app-iframe-modal');
    var t = document.getElementById('aim-title');
    var f = document.getElementById('app-iframe');
    if (m && t && f) {
      t.textContent = name || 'Dastur';
      f.src = url;
      m.style.display = 'flex';
      // Sahifa sarlavhasini o'zgartirish
      document.title = name || 'Dastur';
    } else {
      window.open(url, '_blank');
    }
  } else {
    window.open(url, '_blank');
  }
};
window.closeAppModal = function() {
  var m = document.getElementById('app-iframe-modal');
  var f = document.getElementById('app-iframe');
  if (m) m.style.display = 'none';
  if (f) f.src = '';
  // Sarlavhani qaytarish
  var siteName = (DATA && DATA.settings && DATA.settings.siteName) || 'Jaloliddin Math';
  document.title = siteName;
};
// backward compat
window.openAppUrl = function(url) { window.open(url, '_blank'); };

window.addApp = async function() {
  const name = document.getElementById('app-name').value.trim();
  const icon = document.getElementById('app-icon').value.trim() || '📱';
  const url  = document.getElementById('app-url').value.trim();
  const desc = document.getElementById('app-desc').value.trim();
  const typeEl = document.querySelector('input[name="app-open-type"]:checked');
  const openType = typeEl ? typeEl.value : 'tab';
  if (!name) { toast('❌ Nom kiriting!'); return; }
  if (!url)  { toast('❌ Havola kiriting!'); return; }
  const id = genId();
  const appData = { name, icon, url, desc, openType, createdAt: nowTs() };
  if (!DATA.apps) DATA.apps = {};
  DATA.apps[id] = appData;
  saveLocal(); fbSet('apps/' + id, appData).catch(e => console.warn('fb:', e));
  document.getElementById('app-name').value = '';
  document.getElementById('app-icon').value = '';
  document.getElementById('app-url').value = '';
  document.getElementById('app-desc').value = '';
  renderAdminApps();
  toast("✅ Dastur qo'shildi");
};

window.deleteApp = async function(id) {
  if (!confirm('Dasturni o\'chirmoqchimisiz?')) return;
  delete DATA.apps[id];
  renderAdminApps(); // darhol UI yangilansin
  toast('🗑️ O\'chirildi');
  saveLocal(); fbRemove(`apps/${id}`).catch(e => console.warn('fb:', e));
};
