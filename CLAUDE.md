# Jaloliddin Math — Claude Memory

## Loyiha ma'lumotlari

- **Loyiha nomi**: Diver Education (Jaloliddin Math)
- **GitHub repo**: https://github.com/jaloliddin09/diver-education
- **GitHub username**: jaloliddin09
- **Repo nomi**: diver-education
- **Deploy**: Vercel (vercel.json mavjud)
- **Asosiy branch**: `main`

## Git workflow

```bash
# O'zgarishlarni push qilish:
git add -A
git commit -m "..."
git push origin main
```

## Texnik arxitektura

- **Frontend**: Vanilla JS SPA (Single Page App)
- **Backend**: Firebase Realtime Database
- **PWA**: Service Worker (`sw.js`) — yangilanishda `CACHE_NAME` raqamini o'zgartir
- **CSS cache busting**: `sw.js` ichida `CACHE_NAME = 'jm-vYYYYMMDDHHMM'` formatida

## Muhim fayl strukturasi

```
index.html          — Asosiy HTML (barcha tab/modal shu yerda)
sw.js               — Service Worker (CACHE_NAME'ni har yangilanishda bump qil)
js/admin.js         — Admin panel logikasi (to'lovlar, guruhlar, o'quvchilar)
js/profile.js       — O'quvchi/ota-ona profil (sp-edit selector — ap-edit EMAS!)
js/auth.js          — Login, enterParent, enterAdmin
js/settings.js      — Sozlamalar (globalCoursePrice va boshqalar)
js/curriculum.js    — O'quv reja (CURR_DATA, getGlobalTopicOffset)
js/core.js          — Umumiy utils (saveLocal, fbSet, fbUpdate, fbRemove, today)
css/main.css        — Asosiy stil
```

## Ma'lumotlar strukturasi (Firebase)

```
DATA.groups[gid]
  .name, .schedule
  .coursePrice        — guruh uchun maxsus narx (bo'lmasa globalCoursePrice ishlatiladi)
  .payDueDay          — oylik to'lov kuni (1-31)
  .students[sid]
    .name, .phone
    .payments
      .amount         — oylik to'lov miqdori
      .date           — oxirgi to'lov sanasi (YYYY-MM-DD)
      .paid           — true/false
      .discount       — chegirma
    .records[dateStr] — kunlik natijalar

DATA.settings
  .globalCoursePrice  — barcha guruhlar uchun standart narx
  .adminPassword
  .bgImage, .bgStyle, .animEnabled, ...
```

## Muhim funksiyalar

- `getEffectivePrice(g)` — guruh narxi yoki global narxni qaytaradi
- `renderPayments()` — to'lovlar paneli (inline guruh sozlamalari bilan)
- `renderHisobKitob()` — hisob-kitob (Bu oy / Umumiy toggle)
- `getGlobalTopicOffset(grade)` — mavzular uchun global raqam offset
- `_tryPaymentNotification(daysLeft, fmtDue, isoDate)` — push bildirishnoma

## Eslatmalar

- Edit panel: `#sp-edit .editable[data-key]` — `#ap-edit` EMAS!
- Service worker cache: har deploy'da `CACHE_NAME` ni yangilash shart
- To'lov ogohlantirish: 3 kun qolsa ota-ona profilida ko'rsatiladi + push notification
- Mavzular raqami: 1-sinfdan ketma-ket (Grade 1 = 1-15, Grade 2 = 16-36, ...)
