function applySettings() {
  var s = DATA.settings || {};
  var n = s.siteName || 'Jaloliddin Math';
  var loginTitle = s.loginTitle || n;
  var ver = s.appVersion || 'v1.4';

  document.title = n;
  ['admin-site-name','parent-site-name','guest-site-name','guest-site-name2'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.textContent=n;
  });
  var lt=document.getElementById('login-title');   if(lt) lt.textContent=loginTitle;
  var lv=document.getElementById('login-version'); if(lv) lv.textContent='Baholash tizimi '+ver;
  var si=document.getElementById('set-name');      if(si) si.value=n;
  var ss=document.getElementById('set-schedule');  if(ss) ss.value=s.schedule||'';
  var sn=document.getElementById('set-nextdt');    if(sn) sn.value=s.nextClassDt||'';
  renderGroupScheduleSettings();
  var slt=document.getElementById('set-login-title'); if(slt) slt.value=s.loginTitle||'';
  var sv=document.getElementById('set-version');      if(sv)  sv.value=s.appVersion||'';
  var pan=document.getElementById('pwa-app-name');    if(pan) pan.textContent=n;

  var uvMax=s.uvMax||50, mtMax=s.mtMax||25, faolMax=s.faolMax||25;
  var suv=document.getElementById('set-uv-max');   if(suv) suv.value=uvMax;
  var smt=document.getElementById('set-mt-max');   if(smt) smt.value=mtMax;
  var sfa=document.getElementById('set-faol-max'); if(sfa) sfa.value=faolMax;
  var du=document.getElementById('set-uv-desc');   if(du) du.textContent='Hozir: '+uvMax+' ball';
  var dm=document.getElementById('set-mt-desc');   if(dm) dm.textContent='Hozir: '+mtMax+' ball';
  var df=document.getElementById('set-faol-desc'); if(df) df.textContent='Hozir: '+faolMax+' ball \xb7 Jami: '+(uvMax+mtMax+faolMax);

  // ── LOGO ── preload qilib keyin qo'yamiz
  var logoUrl = s.logoUrl || '';
  var root = document.documentElement;
  if(logoUrl){
    // Preload
    var logoPreload = new Image();
    logoPreload.src = logoUrl;
    root.style.setProperty('--logo-url', 'url('+logoUrl+')');
    root.style.setProperty('--logo-url-raw', logoUrl);
  } else {
    root.style.removeProperty('--logo-url');
    root.style.removeProperty('--logo-url-raw');
  }
  ['login-icon','admin-logo-icon','parent-logo-icon','guest-logo-icon'].forEach(function(id){
    var el=document.getElementById(id); if(!el) return;
    if(logoUrl) el.setAttribute('data-logo','1');
    else        el.removeAttribute('data-logo');
  });
  var slgo=document.getElementById('set-logo-url'); if(slgo) slgo.value=logoUrl;

  // ── FON + ANIMATSIYA ──
  // bgEnabled: fon rasmini ko'rsatish (100% yoki animatsiya bilan 40%)
  // bgAnim:    animatsiyani ko'rsatish (100% yoki fon bilan 40% overlay)
  // Ikkalasi yoniq → 40% overlay (uyg'un)
  // Faqat fon  → 100% fon, canvas yo'q
  // Faqat anim → 100% animatsiya (canvas o'zi fon chizadi)
  // Ikkalasi o'chiq → qoramtir fon

  var bgUrl      = s.bgUrl      || '';
  var bgEnabled  = (s.bgEnabled === true);
  var bgAnim     = (s.bgAnim    === true);
  var animStyle  = s.animStyle  || 1;
  var bgImg      = document.getElementById('bg-img');
  var canvas     = document.getElementById('bg-canvas');

  // bg-img — mobil uchun to'g'ri yuklash
  if(bgImg){
    if(bgUrl && bgEnabled){
      // Hozirgi URL bilan bir xil bo'lsa qayta yuklamaymiz
      var current = bgImg.getAttribute('data-bg-loaded');
      if(current !== bgUrl){
        bgImg.setAttribute('data-bg-loaded', bgUrl);
        // Darhol qo'yamiz (keshdan kelsa tez ko'rinadi)
        bgImg.style.backgroundImage = 'url('+bgUrl+')';
        bgImg.style.opacity = '0';
        // Preload
        var img = new Image();
        img.onload = function(){
          bgImg.style.backgroundImage = 'url('+bgUrl+')';
          bgImg.style.opacity = '1';
          bgImg.style.transition = 'opacity 0.4s ease';
        };
        img.onerror = function(){
          bgImg.style.backgroundImage = 'url('+bgUrl+')';
          bgImg.style.opacity = '1';
        };
        img.src = bgUrl;
      } else {
        bgImg.style.opacity = '1';
      }
    } else {
      bgImg.style.backgroundImage = '';
      bgImg.style.opacity = '1';
      bgImg.removeAttribute('data-bg-loaded');
    }
  }

  // canvas
  if(canvas){
    var wasHidden = canvas.style.display === 'none';
    canvas.style.display = bgAnim ? 'block' : 'none';
    canvas.dataset.style = animStyle;
    // Animatsiya uslubi o'zgarganda yoki canvas endi ko'ringanda qayta qurish
    if(bgAnim && (wasHidden || canvas._lastStyle != animStyle)) {
      canvas._lastStyle = animStyle;
      if(window.bgAnimRestart) setTimeout(window.bgAnimRestart, 50);
    }
  }

  // Body va ekranlar shaffof
  document.body.style.background = 'transparent';
  document.body.style.backgroundColor = 'transparent';
  ['login','guest-app','admin-app','parent-app'].forEach(function(id){
    var el=document.getElementById(id); if(!el) return;
    el.style.background = 'transparent';
    el.style.backgroundColor = 'transparent';
  });

  // Agar ikkalasi o'chiq bo'lsa bg-img ga rang
  if(bgImg && !bgEnabled && !bgAnim){
    bgImg.style.backgroundImage = '';
    bgImg.style.backgroundColor = '#0F172A';
  } else if(bgImg) {
    bgImg.style.backgroundColor = '#0F172A'; // fallback rang
  }

  // UI yangilash
  var bgChk = document.getElementById('set-bg-enabled');
  if(bgChk) bgChk.checked = bgEnabled;
  var bgLbl = document.getElementById('bg-enabled-label');
  if(bgLbl) bgLbl.textContent = bgEnabled ? 'Yoqiq \u2014 fon ko\u02bcrinadi' : 'O\u02bcchiq';

  var animChk = document.getElementById('set-bg-anim');
  if(animChk) animChk.checked = bgAnim;
  var animLbl = document.getElementById('anim-label');
  if(animLbl) animLbl.textContent = bgAnim ? 'Yoqiq' : 'O\u02bcchiq';

  // Animatsiya style wrap ko'rsatish
  var wrap = document.getElementById('anim-style-wrap');
  if(wrap) wrap.style.display = bgAnim ? 'flex' : 'none';

  // Active style tugmasi
  document.querySelectorAll('.anim-style-btn').forEach(function(btn){
    btn.classList.toggle('active', parseInt(btn.dataset.style) === animStyle);
  });

  var sbg = document.getElementById('set-bg-url'); if(sbg) sbg.value = bgUrl;

  // ── ICON URL ── favicon, manifest va PWA icon
  var iconUrl = s.iconUrl || '';
  if(iconUrl) {
    // 1. Favicon
    var favicon = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
    if(!favicon) { favicon = document.createElement('link'); favicon.rel = 'icon'; document.head.appendChild(favicon); }
    favicon.href = iconUrl;
    // 2. Apple touch icon
    var apple = document.querySelector('link[rel="apple-touch-icon"]');
    if(!apple) { apple = document.createElement('link'); apple.rel = 'apple-touch-icon'; document.head.appendChild(apple); }
    apple.href = iconUrl;
    // 3. Header iconlarini rasm bilan almashtirish
    ['login-icon','admin-logo-icon','parent-logo-icon','guest-logo-icon'].forEach(function(id){
      var el = document.getElementById(id);
      if(!el) return;
      el.style.backgroundImage = 'url('+iconUrl+')';
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.textContent = '';
    });
    // 4. PWA manifest — dinamik yangilash (o'rnatishda ham ko'rinadi)
    try {
      var siteName = s.siteName || 'Jaloliddin Math';
      var manifestData = {
        name: siteName,
        short_name: siteName.split(' ')[0],
        description: "O'quvchilar baholash tizimi",
        start_url: './index.html',
        display: 'standalone',
        background_color: '#0F172A',
        theme_color: '#1E293B',
        orientation: 'portrait',
        icons: [
          { src: iconUrl, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: iconUrl, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: iconUrl, sizes: 'any', type: iconUrl.startsWith('data:image/svg') ? 'image/svg+xml' : 'image/png', purpose: 'any maskable' }
        ]
      };
      var blob = new Blob([JSON.stringify(manifestData)], {type:'application/json'});
      var blobUrl = URL.createObjectURL(blob);
      var manifestLink = document.querySelector('link[rel="manifest"]');
      if(manifestLink) {
        // Eski blob URL ni tozalaymiz
        if(manifestLink._blobUrl) URL.revokeObjectURL(manifestLink._blobUrl);
        manifestLink._blobUrl = blobUrl;
        manifestLink.href = blobUrl;
      }
    } catch(e) { console.warn('Manifest update:', e); }
    // 5. Admin preview
    var prev = document.getElementById('icon-preview');
    if(prev) { prev.src = iconUrl; prev.style.display = 'block'; }
    var iconInp = document.getElementById('set-icon-url');
    if(iconInp && !iconInp.value) iconInp.value = iconUrl;
  } else {
    // Default SVG ga qaytish
    var manifestLink2 = document.querySelector('link[rel='+"'manifest'"+']');
    if(manifestLink2 && manifestLink2._blobUrl) {
      URL.revokeObjectURL(manifestLink2._blobUrl);
      manifestLink2._blobUrl = null;
      manifestLink2.href = 'manifest.json';
    }
  }

  if(typeof applyLabels==='function') applyLabels();
}
