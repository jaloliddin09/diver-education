'use strict';
// ============================================================
// CURRICULUM MODULE — Ish Reja
// Jaloliddin Math v2 — curriculum.js
// ============================================================

// ── CURRICULUM DATA (1–11 sinf) ─────────────────────────────
const CURR_DATA = {
  1: { title:"1-sinf", levels:[
    { id:"l1", name:"Sonlar asoslari", topics:[
      { id:"1-1-1", name:"1 dan 10 gacha sonlar" },
      { id:"1-1-2", name:"10 dan 20 gacha sonlar" },
      { id:"1-1-3", name:"20 ichida qo'shish va ayirish" },
      { id:"1-1-4", name:"Juft va toq sonlar" },
      { id:"1-1-5", name:"Son qatorini solishtirish (<,>,=)" },
      { id:"1-1-6", name:"Geometrik shakllar (uchburchak, kvadrat, doira)" },
      { id:"1-1-7", name:"O'lchov: uzun-qisqa, katta-kichik" },
      { id:"1-1-8", name:"Vaqt: kun, soat tushunchasi" },
    ]},
    { id:"l2", name:"Arifmetika kengaytirish", topics:[
      { id:"1-2-1", name:"1 dan 100 gacha sonlar" },
      { id:"1-2-2", name:"O'nlar va birlar (razryadlar)" },
      { id:"1-2-3", name:"Qo'shish (yig'indi 100 gacha)" },
      { id:"1-2-4", name:"Ayirish (farq 0 dan katta)" },
      { id:"1-2-5", name:"Og'irlik: kg, gramm tushunchasi" },
      { id:"1-2-6", name:"Uzunlik: sm, m" },
      { id:"1-2-7", name:"Oddiy masalalar (1 amal)" },
    ]},
  ]},
  2: { title:"2-sinf", levels:[
    { id:"l1", name:"Ko'paytirish va bo'lish (2–5 jadval)", topics:[
      { id:"2-1-1", name:"2 ga ko'paytirish jadvali" },
      { id:"2-1-2", name:"3 ga ko'paytirish jadvali" },
      { id:"2-1-3", name:"4 va 5 ga ko'paytirish jadvali" },
      { id:"2-1-4", name:"2,3,4,5 ga bo'lish" },
      { id:"2-1-5", name:"Ko'paytirish va bo'lish bog'liqligi" },
      { id:"2-1-6", name:"100 ichida qo'shish-ayirish (mustahkamlash)" },
      { id:"2-1-7", name:"2 ta raqamli sonni 1 xonalига qo'shish" },
    ]},
    { id:"l2", name:"Ko'paytirish jadvali (6–9) va tatbiq", topics:[
      { id:"2-2-1", name:"6,7,8,9 ga ko'paytirish jadvali" },
      { id:"2-2-2", name:"Jadval bo'yicha bo'lish" },
      { id:"2-2-3", name:"Qoldiqli bo'lish tushunchasi" },
      { id:"2-2-4", name:"Amallar tartibi (+ − × ÷)" },
      { id:"2-2-5", name:"2 bosqichli masalalar" },
      { id:"2-2-6", name:"O'lchov birliklari (km, m, sm, mm)" },
      { id:"2-2-7", name:"Pul hisobi (so'm)" },
    ]},
    { id:"l3", name:"Geometriya va o'lchash", topics:[
      { id:"2-3-1", name:"To'g'ri chiziq va nurlar" },
      { id:"2-3-2", name:"Burchak tushunchasi" },
      { id:"2-3-3", name:"To'rtburchak perimetri" },
      { id:"2-3-4", name:"Kvadrat perimetri" },
      { id:"2-3-5", name:"Og'irlik: t, kg, g" },
      { id:"2-3-6", name:"Hajm: l, ml" },
      { id:"2-3-7", name:"Vaqt: soat, daqiqa, soniya" },
    ]},
  ]},
  3: { title:"3-sinf", levels:[
    { id:"l1", name:"Kasrlar — birxil maxrajli", topics:[
      { id:"3-1-1", name:"Kasr tushunchasi (surat va maxraj)" },
      { id:"3-1-2", name:"Birxil maxrajli kasrlarni qo'shish" },
      { id:"3-1-3", name:"Birxil maxrajli kasrlarni ayirish" },
      { id:"3-1-4", name:"Noto'g'ri kasrni aralash songa aylantirish" },
      { id:"3-1-5", name:"Kasrlarni solishtirish (<,>,=)" },
      { id:"3-1-6", name:"Kasrlarni tartibga solish" },
      { id:"3-1-7", name:"Tushmaganning kasr qismini topish (?/n)" },
    ]},
    { id:"l2", name:"Butun qismli kasrlar", topics:[
      { id:"3-2-1", name:"Butun qismli kasrlarni qo'shish" },
      { id:"3-2-2", name:"Butun qismli kasrlarni ayirish (qarz olish)" },
      { id:"3-2-3", name:"Har xil maxrajli kasrlar (kirish)" },
      { id:"3-2-4", name:"4 amalli kasr masalalari" },
      { id:"3-2-5", name:"Sonning kasr qismini topish" },
    ]},
    { id:"l3", name:"Ko'p xonali sonlar", topics:[
      { id:"3-3-1", name:"Ming ichidagi sonlar" },
      { id:"3-3-2", name:"Ko'p xonali sonlarni qo'shish-ayirish" },
      { id:"3-3-3", name:"3 xonali × 1 xonali" },
      { id:"3-3-4", name:"Qoldiqli bo'lish (qiyinroq)" },
      { id:"3-3-5", name:"Aralash amallar va tenglamalar" },
    ]},
    { id:"l4", name:"Geometriya va o'lchov", topics:[
      { id:"3-4-1", name:"To'rtburchak va kvadrat yuzasi" },
      { id:"3-4-2", name:"Perimetr (barcha shakllar)" },
      { id:"3-4-3", name:"O'lchov birliklari (to'liq jadval)" },
      { id:"3-4-4", name:"Harakat masalalari (t=S/v)" },
      { id:"3-4-5", name:"2 bosqichli murakkab masalalar" },
    ]},
  ]},
  4: { title:"4-sinf", levels:[
    { id:"l1", name:"Har xil maxrajli kasrlar", topics:[
      { id:"4-1-1", name:"EKUB va EKUK tushunchasi" },
      { id:"4-1-2", name:"Kasrni qisqartirish" },
      { id:"4-1-3", name:"Har xil maxrajli kasrlarni qo'shish" },
      { id:"4-1-4", name:"Har xil maxrajli kasrlarni ayirish" },
      { id:"4-1-5", name:"Har xil maxrajli aralash sonlar" },
      { id:"4-1-6", name:"Kasr × butun son" },
      { id:"4-1-7", name:"Kasr ÷ butun son" },
    ]},
    { id:"l2", name:"Ko'p xonali arifmetika", topics:[
      { id:"4-2-1", name:"Million gacha bo'lgan sonlar" },
      { id:"4-2-2", name:"Ko'p xonali × ko'p xonali" },
      { id:"4-2-3", name:"Ko'p xonali ÷ 2 xonali" },
      { id:"4-2-4", name:"Murakkab tenglamalar" },
      { id:"4-2-5", name:"Amallar tartibi (qavslar bilan)" },
    ]},
    { id:"l3", name:"Foiz va nisbat", topics:[
      { id:"4-3-1", name:"Foiz tushunchasi (100 qism)" },
      { id:"4-3-2", name:"Sonning foizini topish" },
      { id:"4-3-3", name:"Foiz bo'yicha sonni topish" },
      { id:"4-3-4", name:"Nisbat va proporsiya (kirish)" },
      { id:"4-3-5", name:"Chegirma va ustama masalalari" },
    ]},
    { id:"l4", name:"Geometriya — kengaytirish", topics:[
      { id:"4-4-1", name:"Uchburchak turlari va xossalari" },
      { id:"4-4-2", name:"Doira va aylana (P = 2πr)" },
      { id:"4-4-3", name:"Doira yuzasi (S = πr²)" },
      { id:"4-4-4", name:"Ko'pburchak perimetri" },
      { id:"4-4-5", name:"3D shakllar: kub, parallelepiped" },
    ]},
  ]},
  5: { title:"5-sinf", levels:[
    { id:"l1", name:"Butun sonlar va bo'linuvchanlik", topics:[
      { id:"5-1-1", name:"Natural sonlar xossalari" },
      { id:"5-1-2", name:"Bo'linuvchanlik belgilari (2,3,5,9,10)" },
      { id:"5-1-3", name:"Tub va murakkab sonlar" },
      { id:"5-1-4", name:"EKUB va EKUK (chuqur)" },
      { id:"5-1-5", name:"Kasr × kasr, kasr ÷ kasr" },
    ]},
    { id:"l2", name:"O'nli kasrlar", topics:[
      { id:"5-2-1", name:"O'nli kasr tushunchasi" },
      { id:"5-2-2", name:"O'nli kasrlarni qo'shish-ayirish" },
      { id:"5-2-3", name:"O'nli kasrlarni ko'paytirish" },
      { id:"5-2-4", name:"O'nli kasrlarni bo'lish" },
      { id:"5-2-5", name:"Oddiy kasrni o'nli kasrga aylantirish" },
    ]},
    { id:"l3", name:"Foiz — chuqur", topics:[
      { id:"5-3-1", name:"Foiz masalalari (barcha turlari)" },
      { id:"5-3-2", name:"Oddiy foiz (bank hisoblash)" },
      { id:"5-3-3", name:"Proporsiya va miqyos" },
      { id:"5-3-4", name:"To'g'ri va teskari proporsiya" },
      { id:"5-3-5", name:"Konsentrasiya (aralashma) masalalari" },
    ]},
    { id:"l4", name:"Koordinatlar va grafik", topics:[
      { id:"5-4-1", name:"Koordinata tekisligi (x,y o'qlari)" },
      { id:"5-4-2", name:"Nuqtalarni belgilash va o'qish" },
      { id:"5-4-3", name:"Grafik bo'yicha masalalar" },
      { id:"5-4-4", name:"Chiziqli funksiya (kirish)" },
    ]},
  ]},
  6: { title:"6-sinf", levels:[
    { id:"l1", name:"Manfiy sonlar va modulь", topics:[
      { id:"6-1-1", name:"Manfiy sonlar tushunchasi" },
      { id:"6-1-2", name:"Butun sonlarni solishtirish" },
      { id:"6-1-3", name:"Butun sonlar ustida amallar" },
      { id:"6-1-4", name:"Sonning mutlaq qiymati (modulь)" },
      { id:"6-1-5", name:"Ratsional sonlar ustida amallar" },
    ]},
    { id:"l2", name:"Algebraik ifodalar", topics:[
      { id:"6-2-1", name:"O'zgaruvchi va algebraik ifoda" },
      { id:"6-2-2", name:"Ifodalarni soddalashtirish" },
      { id:"6-2-3", name:"1 noma'lumli chiziqli tenglama" },
      { id:"6-2-4", name:"Tenglama tuzish orqali masala yechish" },
      { id:"6-2-5", name:"O'xshash hadlarni qo'shish" },
    ]},
    { id:"l3", name:"Nisbat va proporsiya", topics:[
      { id:"6-3-1", name:"Nisbat (a:b)" },
      { id:"6-3-2", name:"Proporsiya xossalari" },
      { id:"6-3-3", name:"Miqyos va xarita" },
      { id:"6-3-4", name:"Tezlik, vaqt, masofa (chuqur)" },
      { id:"6-3-5", name:"Ish masalalari" },
    ]},
    { id:"l4", name:"Geometriya — Planimetriya", topics:[
      { id:"6-4-1", name:"Uchburchak burchaklari yig'indisi = 180°" },
      { id:"6-4-2", name:"To'g'ri burchakli uchburchak" },
      { id:"6-4-3", name:"To'g'ri to'rtburchak va romb" },
      { id:"6-4-4", name:"Trapetsiya yuzasi" },
      { id:"6-4-5", name:"Ko'pburchak yuzasi" },
    ]},
  ]},
  7: { title:"7-sinf", levels:[
    { id:"l1", name:"Algebra — chiziqli", topics:[
      { id:"7-1-1", name:"Chiziqli tenglama va uning grafigi" },
      { id:"7-1-2", name:"Chiziqli tengsizliklar" },
      { id:"7-1-3", name:"Ikkita tengsizlik sistemasi" },
      { id:"7-1-4", name:"Ikki noma'lumli tenglama sistemasi" },
      { id:"7-1-5", name:"Grafik va almashtirish usullari" },
    ]},
    { id:"l2", name:"Ko'phadlar", topics:[
      { id:"7-2-1", name:"Ko'phad tushunchasi va darajasi" },
      { id:"7-2-2", name:"Ko'phadlarni ko'paytirish" },
      { id:"7-2-3", name:"Ko'paytirish formulalari: (a±b)², (a+b)(a-b)" },
      { id:"7-2-4", name:"Ko'phadni ko'paytuvchilarga ajratish" },
    ]},
    { id:"l3", name:"Funksiyalar asosi", topics:[
      { id:"7-3-1", name:"Funksiya tushunchasi (f(x))" },
      { id:"7-3-2", name:"Chiziqli funksiya y=kx+b" },
      { id:"7-3-3", name:"Teskari proporsional y=k/x" },
      { id:"7-3-4", name:"Funksiya grafigi va uning xossalari" },
    ]},
    { id:"l4", name:"Geometriya — o'xshashlik", topics:[
      { id:"7-4-1", name:"Parallel to'g'ri chiziqlar va kesuvchi" },
      { id:"7-4-2", name:"Uchburchaklar o'xshashligi" },
      { id:"7-4-3", name:"Pifagor teoremasi" },
      { id:"7-4-4", name:"Sin, cos, tan (kirish)" },
    ]},
  ]},
  8: { title:"8-sinf", levels:[
    { id:"l1", name:"Kvadrat tenglama", topics:[
      { id:"8-1-1", name:"Kvadrat tenglama va discriminant" },
      { id:"8-1-2", name:"Vieta teoremasi" },
      { id:"8-1-3", name:"To'liq va to'liqsiz kvadrat tenglamalar" },
      { id:"8-1-4", name:"Kvadrat tenglama orqali masalalar" },
    ]},
    { id:"l2", name:"Kasr-ratsional ifodalar", topics:[
      { id:"8-2-1", name:"Algebraik kasr va soddalashtirish" },
      { id:"8-2-2", name:"Algebraik kasrlarni ko'paytirish-bo'lish" },
      { id:"8-2-3", name:"Algebraik kasrlarni qo'shish-ayirish" },
      { id:"8-2-4", name:"Kasr-ratsional tenglamalar" },
    ]},
    { id:"l3", name:"Kvadrat funksiya", topics:[
      { id:"8-3-1", name:"y=ax² grafigi (parabola)" },
      { id:"8-3-2", name:"y=ax²+bx+c grafigi" },
      { id:"8-3-3", name:"Parabolaning tepa nuqtasi" },
      { id:"8-3-4", name:"Funksiyaning o'sish/kamayish oraliqlari" },
    ]},
    { id:"l4", name:"Trigonometriya — asos", topics:[
      { id:"8-4-1", name:"Sin, cos, tan, cot ta'riflari" },
      { id:"8-4-2", name:"30°, 45°, 60° jadval qiymatlari" },
      { id:"8-4-3", name:"Asosiy trigonometrik tengliklar" },
      { id:"8-4-4", name:"Sin va Cos teoremalari" },
    ]},
  ]},
  9: { title:"9-sinf", levels:[
    { id:"l1", name:"Daraja va logarifm", topics:[
      { id:"9-1-1", name:"Daraja va uning xossalari" },
      { id:"9-1-2", name:"n-darajali ildiz" },
      { id:"9-1-3", name:"Ko'rsatkichli funksiya va grafik" },
      { id:"9-1-4", name:"Logarifm ta'rifi va xossalari" },
      { id:"9-1-5", name:"Ko'rsatkichli va log tenglamalar" },
    ]},
    { id:"l2", name:"Trigonometriya kengaytirish", topics:[
      { id:"9-2-1", name:"Birlik aylana va ixtiyoriy burchak" },
      { id:"9-2-2", name:"Qo'shish formulalari" },
      { id:"9-2-3", name:"Ikki burchak formulalari" },
      { id:"9-2-4", name:"Trigonometrik tenglamalar" },
    ]},
    { id:"l3", name:"Ketma-ketliklar va progressiyalar", topics:[
      { id:"9-3-1", name:"Arifmetik progressiya (a, d)" },
      { id:"9-3-2", name:"AP ning n-hadi va yig'indisi" },
      { id:"9-3-3", name:"Geometrik progressiya (b, q)" },
      { id:"9-3-4", name:"GP ning n-hadi va yig'indisi" },
      { id:"9-3-5", name:"Cheksiz GP yig'indisi" },
    ]},
    { id:"l4", name:"Stereometriya kirish", topics:[
      { id:"9-4-1", name:"Prizm: hajm va to'la sirt" },
      { id:"9-4-2", name:"Piramida: hajm va sirt" },
      { id:"9-4-3", name:"Silindr va konus" },
      { id:"9-4-4", name:"Shar: hajm va sirt" },
    ]},
  ]},
  10: { title:"10-sinf", levels:[
    { id:"l1", name:"Analizga kirish", topics:[
      { id:"10-1-1", name:"Funksiya chegarasi (limit)" },
      { id:"10-1-2", name:"Hosila tushunchasi va ta'rifi" },
      { id:"10-1-3", name:"Differensiallash qoidalari" },
      { id:"10-1-4", name:"Murakkab funksiya hosilasi" },
      { id:"10-1-5", name:"Ekstremum (max va min)" },
    ]},
    { id:"l2", name:"Integral", topics:[
      { id:"10-2-1", name:"Aniqlanmagan integral" },
      { id:"10-2-2", name:"Integrallash qoidalari" },
      { id:"10-2-3", name:"Nyuton-Leybnits formulasi" },
      { id:"10-2-4", name:"Aniqlangan integral (yuza)" },
    ]},
    { id:"l3", name:"Kombinatorika va ehtimollik", topics:[
      { id:"10-3-1", name:"Permutatsiya, kombinatsiya" },
      { id:"10-3-2", name:"Binom koeffitsientlar" },
      { id:"10-3-3", name:"Ehtimollik tushunchasi" },
      { id:"10-3-4", name:"Shartli ehtimollik" },
    ]},
  ]},
  11: { title:"11-sinf", levels:[
    { id:"l1", name:"Kompleks sonlar", topics:[
      { id:"11-1-1", name:"Kompleks son ta'rifi (a+bi)" },
      { id:"11-1-2", name:"Kompleks sonlar ustida amallar" },
      { id:"11-1-3", name:"Modul va argument" },
      { id:"11-1-4", name:"De Moivre formulasi" },
    ]},
    { id:"l2", name:"Chuqur analiz", topics:[
      { id:"11-2-1", name:"Yuqori tartibli hosilalar" },
      { id:"11-2-2", name:"Differensial tenglamalar asoslari" },
      { id:"11-2-3", name:"Tenglama sistemalari (matritsalar)" },
    ]},
    { id:"l3", name:"MMC — Maxsus tayyorlov", topics:[
      { id:"11-3-1", name:"Matematik mantiq va to'plamlar" },
      { id:"11-3-2", name:"Sonlar nazariyasi (olimpiada)" },
      { id:"11-3-3", name:"Kombinatorika — olimpiada masalalari" },
      { id:"11-3-4", name:"Tengsizliklar — AM-GM, Cauchy-Schwarz" },
      { id:"11-3-5", name:"O'tgan yillar MMC test tahlili" },
      { id:"11-3-6", name:"Tezkor masala yechish texnikasi" },
    ]},
    { id:"l4", name:"Yakuniy takrorlash", topics:[
      { id:"11-4-1", name:"Algebra — barcha mavzular takrorlash" },
      { id:"11-4-2", name:"Geometriya — barcha mavzular takrorlash" },
      { id:"11-4-3", name:"Analiz — takrorlash" },
      { id:"11-4-4", name:"Mock test — MMC format" },
      { id:"11-4-5", name:"Mock test — xalqaro olimpiada" },
    ]},
  ]},
};

// ── GLOBAL TOPIC NUMBERING ───────────────────────────────────
// Har bir sinfdan oldin nechta mavzu bo'lganini hisoblaydi
// Masalan: 3-sinf uchun 1-sinf + 2-sinf mavzulari soni qaytaradi
function getGlobalTopicOffset(grade) {
  var offset = 0;
  var grades = Object.keys(CURR_DATA).map(Number).sort(function(a,b){return a-b;});
  for (var i = 0; i < grades.length; i++) {
    if (grades[i] >= grade) break;
    var gd = CURR_DATA[grades[i]];
    (gd.levels || []).forEach(function(lv){ offset += lv.topics.length; });
  }
  return offset;
}

// ── HELPERS ─────────────────────────────────────────────────
function currPath(gid) { return 'curriculum/' + gid; }

function getCurrState(gid) {
  return (DATA.curriculum && DATA.curriculum[gid]) || {};
}

// All topics for a grade (standard + custom)
function getAllTopics(gid) {
  const state = getCurrState(gid);
  const grade = state.grade || 3;
  const gradeData = CURR_DATA[grade] || CURR_DATA[3];
  const standard = [];
  (gradeData.levels || []).forEach(function(lv) {
    lv.topics.forEach(function(tp) {
      standard.push({ id: tp.id, name: tp.name, level: lv.name, custom: false });
    });
  });
  // Custom topics
  const custom = state.custom || {};
  Object.entries(custom).forEach(function([cid, ct]) {
    standard.push({ id: cid, name: ct.name, level: ct.level || 'Qo\'shimcha', custom: true, order: ct.order || 9999 });
  });
  standard.sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
  return standard;
}

function getTopicsDone(gid) {
  const state = getCurrState(gid);
  return state.done || {};
}

function getCurrentTopicId(gid) {
  const state = getCurrState(gid);
  const done = state.done || {};
  const all = getAllTopics(gid);
  // First not-done topic is current
  for (var i = 0; i < all.length; i++) {
    if (!done[all[i].id]) return all[i].id;
  }
  return all.length ? all[all.length-1].id : null;
}

function getCurrentTopicName(gid) {
  const cid = getCurrentTopicId(gid);
  if (!cid) return '—';
  const all = getAllTopics(gid);
  const found = all.find(function(t) { return t.id === cid; });
  return found ? found.name : '—';
}

function getDoneCount(gid) {
  const done = getTopicsDone(gid);
  const all = getAllTopics(gid);
  const allIds = new Set(all.map(function(t) { return t.id; }));
  return Object.keys(done).filter(function(k) { return done[k] && allIds.has(k); }).length;
}

function getTotalCount(gid) {
  return getAllTopics(gid).length;
}

// ── MARK TOPIC DONE/UNDONE ───────────────────────────────────
function currMarkDone(gid, topicId, isDone) {
  window._suppressForceReload = true;
  const path = currPath(gid) + '/done/' + topicId;
  if (isDone) {
    fbSet(path, true).then(function() { renderCurrAdmin(); });
  } else {
    fbRemove(path).then(function() { renderCurrAdmin(); });
  }
}

// ── SAVE GRADE ────────────────────────────────────────────────
function currSaveGrade(gid, grade) {
  window._suppressForceReload = true;
  fbSet(currPath(gid) + '/grade', parseInt(grade)).then(function() {
    toast('Sinf saqlandi ✓');
    renderCurrAdmin();
  });
}

// ── ADD CUSTOM TOPIC ─────────────────────────────────────────
function currAddCustomTopic(gid) {
  const nameEl = document.getElementById('curr-custom-name');
  const levelEl = document.getElementById('curr-custom-level');
  const name = (nameEl ? nameEl.value.trim() : '');
  const level = (levelEl ? levelEl.value.trim() : '') || 'Qo\'shimcha';
  if (!name) { toast('Mavzu nomini kiriting'); return; }
  const id = 'c_' + genId();
  const all = getAllTopics(gid);
  const order = all.length + 1;
  window._suppressForceReload = true;
  fbSet(currPath(gid) + '/custom/' + id, { name: name, level: level, order: order })
    .then(function() {
      if (nameEl) nameEl.value = '';
      toast('Mavzu qo\'shildi ✓');
      renderCurrAdmin();
    });
}

// ── DELETE CUSTOM TOPIC ───────────────────────────────────────
function currDeleteTopic(gid, topicId) {
  if (!topicId.startsWith('c_')) { toast('Standart mavzuni o\'chirib bo\'lmaydi'); return; }
  if (!confirm('Ushbu mavzuni o\'chirasizmi?')) return;
  window._suppressForceReload = true;
  fbRemove(currPath(gid) + '/custom/' + topicId).then(function() {
    fbRemove(currPath(gid) + '/done/' + topicId);
    toast('O\'chirildi');
    renderCurrAdmin();
  });
}

// ── MARK ALL DONE UP TO (inclusive) ──────────────────────────
function currMarkAllUpTo(gid, topicId) {
  const all = getAllTopics(gid);
  const idx = all.findIndex(function(t) { return t.id === topicId; });
  if (idx < 0) return;
  const updates = {};
  for (var i = 0; i <= idx; i++) {
    updates[all[i].id] = true;
  }
  window._suppressForceReload = true;
  fbSet(currPath(gid) + '/done', updates).then(function() {
    toast('O\'tildi deb belgilandi ✓');
    renderCurrAdmin();
  });
}

// ============================================================
// ADMIN RENDER
// ============================================================
let _currGid = null;

function renderCurrAdmin() {
  const el = document.getElementById('ap-curriculum');
  if (!el) return;
  const groups = DATA.groups || {};
  const gids = Object.keys(groups);
  if (!gids.length) {
    el.innerHTML = '<div class="ph"><h2>📋 Ish Reja</h2></div><div class="empty"><div class="ei">👥</div><p>Guruh mavjud emas. Avval guruh qo\'shing.</p></div>';
    return;
  }
  if (!_currGid || !groups[_currGid]) _currGid = gids[0];
  const gid = _currGid;
  const state = getCurrState(gid);
  const grade = state.grade || 3;
  const done = getTopicsDone(gid);
  const allTopics = getAllTopics(gid);
  const currentId = getCurrentTopicId(gid);
  const doneCount = getDoneCount(gid);
  const totalCount = allTopics.length;
  const pct = totalCount ? Math.min(100, Math.round(doneCount / totalCount * 100)) : 0;

  // Group tabs
  const tabs = gids.map(function(id) {
    return '<button class="agt' + (id === gid ? ' on' : '') + '" onclick="currSelectGroup(\'' + id + '\')">' +
      groups[id].name + '</button>';
  }).join('');

  // Grade selector
  const gradeSel = Object.keys(CURR_DATA).map(function(g) {
    return '<option value="' + g + '"' + (parseInt(g) === grade ? ' selected' : '') + '>' + CURR_DATA[g].title + '</option>';
  }).join('');

  // Topics by level
  const gradeData = CURR_DATA[grade] || CURR_DATA[3];
  let topicsHTML = '';

  // Global raqam — bu sinf boshlanishidan oldingi mavzular soni
  var globalOffset = getGlobalTopicOffset(grade);
  var topicCounter = globalOffset; // har bir mavzu uchun ++

  // Standard levels
  (gradeData.levels || []).forEach(function(lv) {
    const lvTopics = lv.topics;
    const lvDone = lvTopics.filter(function(t) { return done[t.id]; }).length;
    topicsHTML += '<div class="curr-level-block">' +
      '<div class="curr-level-hdr">' +
        '<span class="curr-level-name">' + lv.name + '</span>' +
        '<span class="curr-level-prog">' + lvDone + '/' + lvTopics.length + '</span>' +
      '</div>' +
      lvTopics.map(function(tp) {
        topicCounter++;
        const isDone = !!done[tp.id];
        const isCurrent = tp.id === currentId;
        const numBadge = '<span style="min-width:26px;font-size:.68rem;font-weight:800;color:' +
          (isDone ? '#10B981' : 'var(--text3)') +
          ';flex-shrink:0;text-align:right;padding-right:4px">' + topicCounter + '</span>';
        return '<div class="curr-topic-row' + (isDone ? ' done' : '') + (isCurrent ? ' current' : '') + '">' +
          '<label class="curr-check-wrap" onclick="currMarkDone(\'' + gid + '\',\'' + tp.id + '\',' + (!isDone) + ')">' +
            '<div class="curr-check">' + (isDone ? '✓' : '') + '</div>' +
          '</label>' +
          numBadge +
          '<span class="curr-topic-name">' + tp.name + '</span>' +
          (isCurrent ? '<span class="curr-now-badge">Joriy</span>' : '') +
          '<button class="curr-upto-btn" title="Shu mavzugacha barchasini o\'tildi qil" onclick="currMarkAllUpTo(\'' + gid + '\',\'' + tp.id + '\')\">↓✓</button>' +
        '</div>';
      }).join('') +
      '</div>';
  });

  // Custom topics
  const customTopics = allTopics.filter(function(t) { return t.custom; });
  if (customTopics.length) {
    topicsHTML += '<div class="curr-level-block">' +
      '<div class="curr-level-hdr"><span class="curr-level-name">➕ Qo\'shimcha mavzular</span></div>' +
      customTopics.map(function(tp) {
        topicCounter++;
        const isDone = !!done[tp.id];
        const isCurrent = tp.id === currentId;
        const numBadge = '<span style="min-width:26px;font-size:.68rem;font-weight:800;color:' +
          (isDone ? '#10B981' : 'var(--text3)') +
          ';flex-shrink:0;text-align:right;padding-right:4px">' + topicCounter + '</span>';
        return '<div class="curr-topic-row' + (isDone ? ' done' : '') + (isCurrent ? ' current' : '') + '">' +
          '<label class="curr-check-wrap" onclick="currMarkDone(\'' + gid + '\',\'' + tp.id + '\',' + (!isDone) + ')">' +
            '<div class="curr-check">' + (isDone ? '✓' : '') + '</div>' +
          '</label>' +
          numBadge +
          '<span class="curr-topic-name">' + tp.name + '<em style="color:var(--text3);font-size:.72rem;margin-left:4px">(' + tp.level + ')</em></span>' +
          (isCurrent ? '<span class="curr-now-badge">Joriy</span>' : '') +
          '<button class="curr-del-btn" onclick="currDeleteTopic(\'' + gid + '\',\'' + tp.id + '\')" title="O\'chirish">✕</button>' +
        '</div>';
      }).join('') +
      '</div>';
  }

  el.innerHTML =
    '<div class="ph"><h2>📋 Ish Reja</h2><p>Guruh bo\'yicha mavzu rejasi</p></div>' +

    // Group tabs
    '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:12px;scrollbar-width:none">' + tabs + '</div>' +

    // Progress bar
    '<div class="card" style="margin-bottom:12px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '<span style="font-size:.85rem;font-weight:700">' + groups[gid].name + ' — ' + CURR_DATA[grade].title + '</span>' +
        '<span style="font-size:1.1rem;font-weight:800;color:var(--blue)">' + pct + '%</span>' +
      '</div>' +
      '<div style="height:6px;background:var(--bg3);border-radius:3px;overflow:hidden;margin-bottom:8px">' +
        '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--blue),#06b6d4);border-radius:3px;transition:width .4s"></div>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between">' +
        '<span style="font-size:.78rem;color:var(--text3)">O\'tildi: ' + doneCount + ' / ' + totalCount + '</span>' +
        '<span style="font-size:.78rem;color:var(--green)">Joriy: ' + getCurrentTopicName(gid) + '</span>' +
      '</div>' +
    '</div>' +

    // Grade selector
    '<div class="card" style="margin-bottom:12px">' +
      '<div style="display:flex;align-items:center;gap:8px">' +
        '<span style="font-size:.82rem;font-weight:700;color:var(--text2)">Sinf:</span>' +
        '<select class="inp" style="flex:1" onchange="currSaveGrade(\'' + gid + '\',this.value)">' + gradeSel + '</select>' +
      '</div>' +
    '</div>' +

    // Topics
    '<div class="card" style="margin-bottom:12px;padding:0">' +
      '<div style="padding:12px 14px 6px;font-size:.82rem;font-weight:700;color:var(--text2);border-bottom:1px solid var(--border)">Mavzular ro\'yxati</div>' +
      topicsHTML +
    '</div>' +

    // Add custom topic
    '<div class="card" style="margin-bottom:12px">' +
      '<div class="card-title">➕ Yangi mavzu qo\'shish</div>' +
      '<div class="form-group">' +
        '<input class="inp" id="curr-custom-name" placeholder="Mavzu nomi">' +
      '</div>' +
      '<div class="form-group">' +
        '<input class="inp" id="curr-custom-level" placeholder="Bo\'lim nomi (ixtiyoriy)">' +
      '</div>' +
      '<button class="btn btn-primary btn-full" onclick="currAddCustomTopic(\'' + gid + '\')">➕ Qo\'shish</button>' +
    '</div>' +

    // Copy topics button
    '<div class="card" style="margin-bottom:80px">' +
      '<div class="card-title">📋 Mavzularni nusxalash</div>' +
      '<div style="font-size:.8rem;color:var(--text3);margin-bottom:10px">O\'tilgan va joriy mavzularni clipboard ga nusxalang</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button class="btn btn-primary" style="flex:1" onclick="currCopyTopics(\'' + gid + '\',false)">📋 Barcha mavzular</button>' +
        '<button class="btn btn-success" style="flex:1" onclick="currCopyTopics(\'' + gid + '\',true)">✅ Faqat o\'tilganlar</button>' +
      '</div>' +
    '</div>';
}

function currSelectGroup(gid) {
  _currGid = gid;
  renderCurrAdmin();
}

// ── PARENT VIEW ─────────────────────────────────────────────
function renderParentCurriculum(gid) {
  const el = document.getElementById('parent-curr-card');
  if (!el || !gid) return;
  const currentName = getCurrentTopicName(gid);
  const done = getDoneCount(gid);
  const total = getTotalCount(gid);
  const pct = total ? Math.round(done / total * 100) : 0;
  const state = getCurrState(gid);
  const grade = state.grade || 3;
  el.innerHTML =
    '<div class="card-title">📚 Joriy mavzu</div>' +
    '<div style="font-size:1rem;font-weight:700;color:var(--text);margin-bottom:10px;line-height:1.4">' + currentName + '</div>' +
    '<div style="font-size:.78rem;color:var(--text3);margin-bottom:6px">' + CURR_DATA[grade].title + ' &nbsp;·&nbsp; O\'tildi: ' + done + '/' + total + '</div>' +
    '<div style="height:5px;background:var(--bg3);border-radius:3px;overflow:hidden">' +
      '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--blue),#06b6d4);border-radius:3px"></div>' +
    '</div>';
}

// ── COPY TOPICS ───────────────────────────────────────────────
function currCopyTopics(gid, onlyDone) {
  const groups = DATA.groups || {};
  const groupName = (groups[gid] && groups[gid].name) || 'Guruh';
  const state = getCurrState(gid);
  const grade = state.grade || 3;
  const gradeTitle = (CURR_DATA[grade] && CURR_DATA[grade].title) || (grade + '-sinf');
  const all = getAllTopics(gid);
  const done = getTopicsDone(gid);
  const currentId = getCurrentTopicId(gid);

  // Global offset — bu sinfdan oldingi mavzular soni
  var globalOffset = getGlobalTopicOffset(grade);
  // Har bir mavzu uchun global raqamini topish: all ichida indexi + offset + 1
  // (custom topiclar standard topiclardan keyin keladi)
  var standardCount = 0;
  (CURR_DATA[grade] && CURR_DATA[grade].levels || []).forEach(function(lv){ standardCount += lv.topics.length; });
  // Mavzu → global raqam map
  var numMap = {};
  all.forEach(function(t, i) { numMap[t.id] = globalOffset + i + 1; });

  const lines = [];
  lines.push(groupName + ' — ' + gradeTitle);
  lines.push('');

  const byLevel = {};
  all.forEach(function(t) {
    const lv = t.level || 'Qo\'shimcha';
    if (!byLevel[lv]) byLevel[lv] = [];
    byLevel[lv].push(t);
  });

  Object.entries(byLevel).forEach(function(entry) {
    const lvName = entry[0];
    const topics = entry[1];
    const filtered = onlyDone ? topics.filter(function(t) { return done[t.id]; }) : topics;
    if (!filtered.length) return;
    lines.push('[ ' + lvName + ' ]');
    filtered.forEach(function(t) {
      const isDone = !!done[t.id];
      const isCurrent = t.id === currentId;
      const mark = isDone ? '✓' : '○';
      const tag = isCurrent ? ' ← JORIY' : '';
      const num = numMap[t.id] || '';
      lines.push(num + '. ' + mark + ' ' + t.name + tag);
    });
    lines.push('');
  });

  const text = lines.join('\n').trim();
  navigator.clipboard.writeText(text).then(function() {
    toast('✅ Nusxalandi! (' + (onlyDone ? 'faqat o\'tilganlar' : 'barcha mavzular') + ')');
  }).catch(function() {
    toast('❌ Nusxalash xatosi');
  });
}
