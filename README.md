# IT Masters — ລະບົບຄຸ້ມຄອງ IT ວິທະຍາໄລ

ລະບົບຄຸ້ມຄອງອຸປະກອນ IT ແລະ ວຽກງານໄອທີ ສຳລັບ **ວິທະຍາໄລ ເຕັກນິກ-ວິຊາຊີບ ຫຼວງພະບາງ**

> React 19 + TypeScript + Vite · Ant Design v6 · Google Apps Script + SheetORM · PWA

---

## ໂມດູນ (Modules)

| ໂມດູນ | ລາຍລະອຽດ |
|---|---|
| Dashboard | ສະຫຼຸບສະຖິຕິ, ວຽກລ່າສຸດ, ອຸປະກອນເກີນກຳນົດ |
| ໜ້າວຽກປະຈຳວັນ | ບັນທຶກ ແລະ ຕິດຕາມວຽກຊ່ອມ/ຕິດຕັ້ງ/ສະໜັບສະໜູນ |
| ອຸປະກອນ IT | ທະບຽນອຸປະກອນ, QR code, ຊອກຫາ/ກອງ |
| ຢືມອຸປະກອນ | ໃບຢືມ, ຕິດຕາມ, ຮັບຄືນ |
| ເບີກຈ່າຍ | ໃບເບີກ, ການໂອນອຸປະກອນ |
| ລາຍງານ | ກຣາຟສະຖິຕິ, Export Excel |
| ຂໍ້ມູນ IT | WiFi, IP Camera, IP Printer, ລະຫັດລະບົບ, Server |
| Print QR | ພິມ QR code ສຳລັບຕິດລາຍການ |
| Scan QR | ສະແກນ QR ເພື່ອດູຂໍ້ມູນອຸປະກອນ |
| ຕັ້ງຄ່າ | ຜູ້ໃຊ້, ປະເພດ, ຫ້ອງການ, ພະນັກງານ |

---

## ການຕິດຕັ້ງ (Setup)

### 1. Frontend

```bash
npm install
cp .env.example .env.local   # ຕື່ມ VITE_APPS_SCRIPT_URL
npm run dev
```

`.env.local` ຕ້ອງມີ:
```
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
```

### 2. Google Apps Script Backend

1. ສ້າງ Google Sheet ໃໝ່ → ຄັດລອກ Spreadsheet ID
2. ເຂົ້າ [script.google.com](https://script.google.com) → ສ້າງ project ໃໝ່
3. ໄປ Libraries → ເພີ່ມ SheetORM (Script ID ຂໍ້ໃນ `gs_backend/Code.gs`)
4. ໄປ Project Settings → Script Properties → ເພີ່ມ `SPREADSHEET_ID`
5. `cd gs_backend && clasp push`
6. ສ້າງ `deploy > New deployment > Web app` (Execute as: Me, Who: Anyone)
7. ຄັດລອກ URL ໄປໃສ່ `VITE_APPS_SCRIPT_URL` ໃນ `.env.local`
8. Run migration ໃນ Apps Script editor: `runMigrations()`

---

## Commands

```bash
npm run dev        # dev server → http://localhost:5173/it-masters/
npm run build      # build for production (output: dist/)
npm run lint       # ESLint check
npm run test       # run tests once
npm run preview    # preview production build locally
```

```bash
cd gs_backend
clasp push         # push backend changes to Apps Script
```

---

## ໂຄງສ້າງ (Architecture)

```
it-masters/
├── src/
│   ├── pages/          # ໂໝດູນ (ແຕ່ລະໂໝດູນມີ index.tsx + Form.tsx)
│   ├── components/
│   │   ├── Layout/     # AppLayout, BottomNav
│   │   └── common/     # ResponsiveTable, PageHeader, StatusBadge, ...
│   ├── services/api.ts  # callApi() + named api objects ທຸກໂໝດູນ
│   ├── store/          # useAuthStore (Zustand + persist)
│   └── types/index.ts  # TypeScript interfaces ທຸກ entity
├── gs_backend/
│   ├── Code.gs         # doPost() dispatcher
│   ├── schema.gs       # table schemas + migrations
│   └── *.gs            # handler ສຳລັບແຕ່ລະ module
└── public/icons/       # PWA icons (192, 512)
```

**Backend:** Google Sheets ເປັນ database ຜ່ານ SheetORM library. `doPost()` ໃນ `Code.gs` ຮັບ `{ action, method, params }` ແລ້ວ route ໄປຫາ handler ທີ່ກ່ຽວຂ້ອງ.

**Frontend:** ທຸກ request ຜ່ານ `callApi(action, method, params)` ດ້ວຍ `Content-Type: text/plain` (ເພື່ອຫຼີກລ່ຽງ CORS preflight). Server state ໃຊ້ TanStack React Query.

---

## Deployment

ໂຄງການ deploy ຢູ່ GitHub Pages:
**https://kittisayst.github.io/it-masters/**

```bash
npm run build
# push dist/ ຫຼື ໃຊ້ GitHub Actions
```

---

## PWA

ລະບົບຮອງຮັບ Progressive Web App — ສາມາດຕິດຕັ້ງໃນ mobile ໄດ້ (Add to Home Screen). GAS API ຖືກຕັ້ງ `NetworkOnly` (ບໍ່ cache) ເພາະຕ້ອງການຂໍ້ມູນ real-time.
