// Firebase compat — CDN dan yuklangan, bu faqat init qiladi
(function() {
  var firebaseConfig = {
    apiKey: "AIzaSyBVPFhLtIps-PAJ4qMcj4WStCXF6kcZ7ZU",
    authDomain: "jaloliddin-kurs.firebaseapp.com",
    databaseURL: "https://jaloliddin-kurs-default-rtdb.firebaseio.com",
    projectId: "jaloliddin-kurs",
    storageBucket: "jaloliddin-kurs.firebasestorage.app",
    messagingSenderId: "182277939257",
    appId: "1:182277939257:web:d4f50ff3a6b186aba96de8"
  };
  firebase.initializeApp(firebaseConfig);
  var db = firebase.database();
  var auth = firebase.auth();

  window._fb = {
    db: db,
    ref: function(dbOrPath, path) {
      if (typeof dbOrPath === 'string') return db.ref(dbOrPath);
      return db.ref(path);
    },
    onValue: function(refObj, cb, errCb) { refObj.on('value', cb, errCb); },
    set:    function(refObj, data) { return refObj.set(data); },
    get:    function(refObj)       { return refObj.once('value'); },
    update: function(refObj, data) { return refObj.update(data); },
    remove: function(refObj)       { return refObj.remove(); },
    push:   function(refObj, data) { return refObj.push(data); }
  };

  // ── ANONYMOUS AUTH ─────────────────────────────────────────
  // Ilova avtomatik "ko'rinmas" foydalanuvchi sifatida Firebase ga kiradi.
  // Bu 30 kunlik test mode muammosini butunlay hal qiladi.
  // Ota-onalar va admin hech narsani sezishmaydi — PIN tizimi o'zgarmaydi.
  auth.onAuthStateChanged(function(user) {
    if (user) {
      // Allaqachon autentifikatsiya qilingan — tayyor
      window._fbReady = true;
      window.dispatchEvent(new Event('fbReady'));
    } else {
      // Anonim kirish
      auth.signInAnonymously().catch(function(err) {
        console.warn('Anonymous auth xato:', err.message);
        // Auth ishlamasa ham DB ga ulanishga harakat qilamiz
        window._fbReady = true;
        window.dispatchEvent(new Event('fbReady'));
      });
    }
  });
})();
