# ຢືມກະແຈຫ້ອງຄອມ (Room Borrowing)

- **Date:** 2026-07-30
- **Status:** implemented (frontend + backend code written; `clasp push` + redeploy still needed)
- **Project:** IT Masters (kittisayst.github.io/it-masters)

## ເປົ້າໝາຍ (Goal)

ເພີ່ມໂມດູນໃໝ່ໃຫ້ບັນທຶກການຢືມ-ສົ່ງກະແຈຫ້ອງຄອມ: ໃຜ (`Employee`) ຢືມຫ້ອງ (`Room`) ໃດ, ຢືມ/ສົ່ງເມື່ອໃດ, ໃຜເປັນຄົນບັນທຶກ. ອອກແບບ ແລະ ຕັດສິນໃຈ domain ແລ້ວຢູ່ [CONTEXT.md](../../CONTEXT.md) ແລະ [ADR 0001](../adr/0001-no-key-entity-for-room-borrowing.md).

ສະຫຼຸບການຕັດສິນໃຈຈາກ grill session:
- **ບໍ່ມີ `Key` entity** — track `Room` ໂດຍກົງ (ADR 0001)
- `Room` ເປັນ sheet ແຍກຕ່າງຫາກ: `code`, `name`, `location`, `computerCount`, `responsiblePerson` (→ `Employee.id`)
- ທຸລະກຳການຢືມ = sheet ດຽວ flat (ບໍ່ແມ່ນ header+items ຄືກັນກັບ `Borrowing`/`Disbursement`) ເພາະ 1 ຄັ້ງ = 1 ຄົນ ຢືມ 1 ຫ້ອງ
- ຫ້າມຢືມຊ້ອນ: `Room` ທີ່ status `ກຳລັງຢືມ` ຈະບໍ່ຢູ່ໃນລາຍການໃຫ້ຢືມ
- ບໍ່ມີ `approvedBy` (ບໍ່ຕ້ອງອະນຸມັດ), ໃຊ້ພຽງ `recordedBy`
- ຜູ້ຢືມຈຳກັດສະເພາະ `Employee` (ບໍ່ຮອງຮັບຄົນນອກລະບົບ)
- ມີ `dueDate`/overdue logic (ຄືກັນກັບ `Borrowing`) ເພາະບາງຄັ້ງຢືມໄປໃຊ້ໃນການປະຊຸມຫຼາຍມື້

## Context ປັດຈຸບັນ

ອ່ານ codebase ແລ້ວ ພົບ pattern ຂອງໂມດູນ `Borrowing` (ຢືມອຸປະກອນ) ທີ່ໃກ້ຄຽງທີ່ສຸດ, ໃຊ້ເປັນຕົ້ນແບບ:

- **Backend** — `gs_backend/schema.gs` ນິຍາມ table ຜ່ານ `getDb().table(name).schema({...})` + migration ໃນ `runMigrations()` array (`SheetORM.migrate`). Handler ຢູ່ `gs_backend/Borrowing.gs` (`handleBorrowing`), ລົງທະບຽນໃນ `Code.gs:30-43` (`handlers` object). Dashboard stats ຢູ່ `gs_backend/dashboard.gs` (`handleDashboard` → `stats`/`overdueBorrowing`).
- **Frontend types** — `src/types/index.ts` ມີ `BorrowingHeader`/`BorrowingItem`/`BorrowingDetail`, ບໍ່ມີ `Room`/`RoomBorrowing` ຢູ່.
- **API layer** — `src/services/api.ts` ມີ `borrowingApi` object ດຽວທີ່ wrap `callApi('borrowing', method, params)`.
- **Reference data hooks** — `src/hooks/useReferenceData.ts` ມີ `useDepartments`/`useEmployees`/`useAvailableEquipment` ຮູບແບບ `useQuery` + `unwrap()`.
- **Pages** — `src/pages/Borrowing/` ມີ `index.tsx` (list+filter+export), `BorrowingForm.tsx` (Modal ບັນທຶກ), `BorrowingReturnPage.tsx` (ໜ້າສົ່ງຄືນແຍກຕ່າງຫາກ, route `/borrowing/return/:id`), `BorrowingPrintPage.tsx`+`BorrowingSlip.tsx` (ໃບພິມ). `src/pages/Settings/Departments.tsx` ເປັນຕົ້ນແບບ CRUD settings page ທຳມະດາ (ໃຊ້ສຳລັບ `Rooms`).
- **Routing** — `src/App.tsx` ລົງທະບຽນ route ໃນ `<Routes>`, ມີ route ນອກ `AppLayout` ສຳລັບ print/return pages (`/borrowing/:id/print`, `/borrowing/return/:id`).
- **Menu** — `src/components/Layout/AppLayout.tsx:30-52` (`navItems`) ມີ icon `KeyOutlined` ຖືກໃຊ້ໄປແລ້ວກັບ `/it-info` — ຕ້ອງເລືອກ icon ອື່ນ. `BottomNav.tsx` ເຕັມແລ້ວ, ຫ້າມເພີ່ມ (per CLAUDE.md).
- **Status colors** — `src/components/common/StatusBadge.tsx` ມີ map ຄົງທີ່ຂອງ status→ສີ, ຕ້ອງເພີ່ມ status ໃໝ່ (`ສົ່ງແລ້ວ`) ເຂົ້າໄປ (`ເກີນກຳນົດ`/`ກຳລັງຢືມ` ໃຊ້ຄືນຂອງເກົ່າໄດ້ເລີຍ).

## ແນວທາງ (Approach)

ນຳ pattern ຂອງ `Equipment`/`Borrowing` ມາໃຊ້ຄືນ ແຕ່ປັບໃຫ້ງ່າຍກວ່າ (flat sheet, ບໍ່ມີ header+items, ບໍ່ມີ approval). ສ້າງ 2 sheet ໃໝ່: `Rooms` (master data, ຄືກັນກັບ `Departments`/`Categories`) ແລະ `RoomBorrowings` (transaction, ຄືກັນກັບ `WorkRecords` — flat, ບໍ່ແມ່ນ header+items).

## ຂັ້ນຕອນ (Steps)

### Backend (`gs_backend/`)

1. `schema.gs` — ເພີ່ມ `getRoomsTable()` ແລະ `getRoomBorrowingsTable()`, ນິຍາມ field ຕາມ CONTEXT.md
2. `schema.gs` — ເພີ່ມ migration `011: create_rooms` ແລະ `012: create_room_borrowings` ເຂົ້າໃນ `runMigrations()` array
3. ສ້າງ `gs_backend/Rooms.gs` — `handleRooms(method, params)` (findAll/find/insert/update/delete — CRUD ທຳມະດາ ຄືກັນກັບ `settings.gs`)
4. ສ້າງ `gs_backend/RoomBorrowing.gs` — `handleRoomBorrowing(method, params)`:
   - `findAll`/`find` (filter by status/employeeId) — attach `room`/`employee` name ຄືກັນກັບ `attachEquipmentList` pattern
   - `insert` — ກວດສອບ `Room.status` ບໍ່ແມ່ນ `ກຳລັງຢືມ` ກ່ອນ (ຫ້າມຢືມຊ້ອນ), insert record, update `Room.status = 'ກຳລັງຢືມ'`
   - `return` — update `returnedAt`, `status = 'ສົ່ງແລ້ວ'`, update `Room.status = 'ປົກກະຕິ'`
   - `checkOverdue` — ຄືກັນກັບ `handleBorrowing.checkOverdue` (loop `dueDate < today` ແລະ status `ກຳລັງຢືມ` → `ເກີນກຳນົດ`)
   - `stats` — total/active/overdue count
5. `schema.gs` — ເພີ່ມ `status` enum ໃນ `Room` schema: `['ປົກກະຕິ', 'ຖືກຢືມ']` (ຄືກັນກັບ Equipment ແຕ່ຫຼຸດ option ລົງ ເພາະ Room ບໍ່ມີ "ສ້ອມແປງ"/"ປົດລຶບ")
6. `Code.gs:30-43` — ລົງທະບຽນ `rooms: handleRooms` ແລະ `roomBorrowing: handleRoomBorrowing` ໃນ `handlers` object
7. `clasp push` ຈາກ `gs_backend/` → deploy ໃໝ່ໃນ Apps Script editor

### Frontend types + API

8. `src/types/index.ts` — ເພີ່ມ `interface Room` ແລະ `interface RoomBorrowing` (ຕາມ field ໃນ CONTEXT.md), ຂະຫຍາຍ `status` union: `'ກຳລັງຢືມ' | 'ສົ່ງແລ້ວ' | 'ເກີນກຳນົດ'`
9. `src/services/api.ts` — ເພີ່ມ `roomsApi` (CRUD) ແລະ `roomBorrowingApi` (findAll/find/insert/return/stats) ຄືກັນກັບ pattern `borrowingApi`
10. `src/hooks/useReferenceData.ts` — ເພີ່ມ `useRooms()` (all rooms), `useAvailableRooms()` (status = `ປົກກະຕິ`, ຄືກັນກັບ `useAvailableEquipment`)
11. `src/components/common/StatusBadge.tsx` — ເພີ່ມ `'ສົ່ງແລ້ວ': 'success'` ເຂົ້າໃນ `statusColors`

### Frontend pages

12. ສ້າງ `src/pages/Settings/Rooms.tsx` — CRUD ຫ້ອງຄອມ (ຕົ້ນແບບຈາກ `Settings/Departments.tsx`), field: `code`, `name`, `location`, `computerCount`, `responsiblePerson` (Select ຈາກ `useEmployees`)
13. ສ້າງ `src/pages/RoomBorrowing/index.tsx` — list+filter status, ຄືກັນກັບ `Borrowing/index.tsx` ແຕ່ບໍ່ມີ print/multi-item column
14. ສ້າງ `src/pages/RoomBorrowing/RoomBorrowingForm.tsx` — Modal ຟອມຢືມ: `employeeId` (Select), `roomId` (Select, ຈາກ `useAvailableRooms`), `borrowedAt` (DatePicker+TimePicker ຫຼື DateTimePicker), `dueDate`, `purpose` (optional). ບໍ່ມີ `approvedBy` field (ຕ່າງຈາກ `BorrowingForm`)
15. ຟັງຊັນ "ສົ່ງຄືນ" — ເນື່ອງຈາກບໍ່ມີ header+items ຄວນເປັນ inline action (ປຸ່ມ "ສົ່ງຄືນ" ໃນແຖວ table ຄື `BorrowingPage` ແຕ່ບໍ່ຕ້ອງແຍກໜ້າ route ຄື `BorrowingReturnPage` — confirm ກັບຜູ້ໃຊ້ວ່າຕ້ອງການແບບໃດກ່ອນຂຽນ code)

### Routing + Menu

16. `src/App.tsx` — ເພີ່ມ route `room-borrowing` (list) ພາຍໃນ `<AppLayout>`, ບວກ `settings/rooms`
17. `src/components/Layout/AppLayout.tsx` — ເພີ່ມ `navItems` ລາຍການໃໝ່ `{ key: '/room-borrowing', icon: <???>, label: 'ຢືມກະແຈຫ້ອງຄອມ' }` (ຕ້ອງເລືອກ icon ໃໝ່ ເພາະ `KeyOutlined` ຖືກໃຊ້ໄປແລ້ວ — ສະເໜີ `LockOutlined` ຫຼື `HomeOutlined`) ແລະ `settings/rooms` ໃນ children ຂອງ `settings`
18. ບໍ່ແຕະ `BottomNav.tsx` (ເຕັມແລ້ວ)

### Dashboard (optional — ຢືນຢັນ scope ກ່ອນ)

19. `gs_backend/dashboard.gs` — ຖ້າຕ້ອງການ, ເພີ່ມ `roomBorrowing: { active, overdue }` ເຂົ້າໃນ `stats()`
20. `src/types/index.ts` `DashboardStats` — ເພີ່ມ field `roomBorrowing` ຖ້າເຮັດຂໍ້ 19

## Files ທີ່ຈະຖືກກະທົບ

- `gs_backend/schema.gs` — schema + migration ໃໝ່
- `gs_backend/Rooms.gs` — ໃໝ່, CRUD handler
- `gs_backend/RoomBorrowing.gs` — ໃໝ່, transaction handler
- `gs_backend/Code.gs` — ລົງທະບຽນ handler ໃໝ່
- `gs_backend/dashboard.gs` — (optional) stats
- `src/types/index.ts` — `Room`, `RoomBorrowing` interfaces
- `src/services/api.ts` — `roomsApi`, `roomBorrowingApi`
- `src/hooks/useReferenceData.ts` — `useRooms`, `useAvailableRooms`
- `src/components/common/StatusBadge.tsx` — status color ໃໝ່
- `src/pages/Settings/Rooms.tsx` — ໃໝ່
- `src/pages/RoomBorrowing/index.tsx` — ໃໝ່
- `src/pages/RoomBorrowing/RoomBorrowingForm.tsx` — ໃໝ່
- `src/App.tsx` — route ໃໝ່
- `src/components/Layout/AppLayout.tsx` — menu item ໃໝ່

## ຄວາມສ່ຽງ / ຄຳຖາມທີ່ຍັງເປີດ (Risks / Open Questions)

- **ໜ້າ "ສົ່ງຄືນ"**: `Borrowing` ໃຊ້ໜ້າແຍກຕ່າງຫາກ (`BorrowingReturnPage`, route `/borrowing/return/:id`). ເນື່ອງຈາກ `RoomBorrowing` ບໍ່ມີ items ໃຫ້ກວດ (1 record = 1 ຫ້ອງ), inline modal/confirm ໃນ list ອາດພຽງພໍ — ຄວນຢືນຢັນກັບຜູ້ໃຊ້ກ່ອນ implement (ຂໍ້ 15)
- **ໃບພິມ**: `Borrowing` ມີ `BorrowingPrintPage`+`BorrowingSlip` (ໃບຢືມພິມໄດ້). ຍັງບໍ່ໄດ້ຖາມວ່າ `RoomBorrowing` ຕ້ອງການໃບພິມບໍ່ — ບໍ່ໄດ້ລວມຢູ່ໃນ scope ຂອງແຜນນີ້
- **Dashboard**: ຍັງບໍ່ໄດ້ຢືນຢັນວ່າຕ້ອງການ stats ຂອງ `RoomBorrowing` ຢູ່ໃນ `Dashboard.tsx` ບໍ່ (ຂໍ້ 19-20 ເປັນ optional)
- **Icon ໃໝ່ໃນ menu**: `KeyOutlined` ຖືກໃຊ້ໄປແລ້ວກັບ `/it-info` — ຕ້ອງເລືອກ icon ອື່ນສຳລັບ `ຢືມກະແຈຫ້ອງຄອມ`
- **`computerCount`/`responsiblePerson`** ໃນ `Room` — ຍັງບໍ່ໄດ້ຖືກນຳໃຊ້ໃນ business logic ໃດໆ (ເປັນພຽງ metadata ສະແດງຜົນ), ຢືນຢັນວ່າພຽງພໍແລ້ວ ບໍ່ຕ້ອງມີ validation ເພີ່ມ
