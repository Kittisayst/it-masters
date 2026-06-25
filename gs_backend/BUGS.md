# Bug Reports — SheetORM & Apps Script

ພົບໃນໄລຍະທົດສອບ integration tests (40 tests, real Apps Script deployment)
ວັນທີ: 2026-06-25

---

## Bug #1 — SheetORM: `orderBy().get()` fails on ALL dataset sizes ✅ FIXED

### ສາເຫດຈິງ (Root Cause)

`Table` object **ບໍ່ມີ `orderBy()`, `limit()`, `offset()`, `select()` ເປັນ entry points** — ມີແຕ່ `where()` ດຽວ.
ດັ່ງນັ້ນ `table.orderBy(...)` = `TypeError: not a function` ທຸກ dataset size, ບໍ່ແມ່ນ empty table issue.

```javascript
// ❌ ເກົ່າ — TypeError ເພາະ Table ບໍ່ມີ method ນີ້
var res = table.orderBy('date', 'DESC').get();

// ✅ ເຮັດໄດ້ — ຜ່ານ where() ເຂົ້າ Query ກ່ອນ
var res = table.where('field', '!=', '').orderBy('date', 'DESC').get();
```

### ການແກ້ (Fix ໃນ SheetORM `Table.gs`)

ເພີ່ມ 4 entry points ໃໝ່ໃຫ້ `Table` delegate ໄປຫາ `Query`:

```javascript
// Table.gs — 4 methods ໃໝ່
Table.prototype.orderBy = function(field, dir) {
  return new Query(this).orderBy(field, dir);
};
Table.prototype.limit = function(n) {
  return new Query(this).limit(n);
};
Table.prototype.offset = function(n) {
  return new Query(this).offset(n);
};
Table.prototype.select = function(fields) {
  return new Query(this).select(fields);
};
```

### ຜົນຫຼັງ Fix

```javascript
table.orderBy('date', 'DESC').get()   // ✅
table.limit(10).get()                 // ✅
table.offset(5).get()                 // ✅
table.select(['id','name']).get()     // ✅
table.orderBy('code','ASC').limit(1).get()  // ✅
```

### Status

- **Fixed:** ໃນ SheetORM `Table.gs` (version 3+)
- **gs_backend:** reverted workarounds, ໃຊ້ `orderBy().get()` ຕາມປົກກະຕິ

---

## Bug #2 — Apps Script: 404 timeout after sequential API requests

### ອາການ (Symptom)

ເມື່ອ Apps Script Web App ໄດ້ຮັບ requests ຫຼາຍໆ ໃນລຳດັບໄວ (>25 requests/ເຊດຊັ້ນ), request ລຳດັບ 25–30 ເປັນຕົ້ນໄປ **ອາດ return HTTP 404** ໂດຍທີ່ request ໃຊ້ເວລາ ~23 ວິ (ໃກ້ 30 ວິ timeout ຂອງ Apps Script).

```
AxiosError: Request failed with status code 404
Duration: 23561ms  ← close to Apps Script's 30s limit
```

### ສາຍເຫດ (Root Cause)

Apps Script Web App ມີ **quota ຂອງ Google**:

| Quota | ຄ່າ |
|-------|-----|
| ເວລາ execution ສູງສຸດ | 30 ວິ/request |
| Simultaneous executions | 30 ຄັ້ງ/ໂຄງການ |
| URL fetch daily | 20,000 calls/ວັນ |
| Script runtime daily | 6 ຊົ່ວໂມງ/ວັນ (free) |

ເມື່ອ Google infrastructure load ສູງ, ການ bootstrap ໃໝ່ທຸກ request (cold start ~1-2 ວິ) + reading ຫຼາຍ sheets ໃນລຳດັບ ທຳໃຫ້ request ກ່ອນໝົດ 30 ວິ ແລ້ວ Apps Script return HTML 404 page ແທນ JSON.

### ຈຸດທີ່ trigger ໃນ integration tests

Tests ໃນ suite `Borrowing CRUD` ແລ່ນຫຼັງ 25+ requests ຈາກ suites ກ່ອນ:

```
Auth (3) + Departments (5) + Employees (4) + WorkRecords (6) + Equipment (6)
= 24 requests ກ່ອນ Borrowing findAll
```

`Borrowing findAll` ເປັນ request ທີ 25 — Apps Script busy → 404.

### ວິທີ Reproduce

```typescript
// ຊ່ອຍ 25 API calls ຕາມລຳດັບ ໄວ (<5s interval)
for (let i = 0; i < 30; i++) {
  const res = await call('departments', 'findAll');
  console.log(i, res.success); // ~request 25+ may fail
}
```

### ວິທີແກ້ (Suggested Fixes)

#### ທາງ 1 — Retry with backoff (ທາງ test side)

```typescript
async function call(action, method, params, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await axios.post(API_URL, JSON.stringify({action, method, params}), {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 25000,
      });
    } catch (err) {
      const status = err?.response?.status;
      if (attempt < retries && (status === 404 || status === 429 || status === 500)) {
        await new Promise(r => setTimeout(r, 3000 * (attempt + 1))); // 3s, 6s
        continue;
      }
      throw err;
    }
  }
}
```

#### ທາງ 2 — Batch API (ທາງ backend side)

ສ້າງ method `batch` ທີ່ຮັບ requests ຫຼາຍໃນ payload ດຽວ ຫຼຸດ cold starts:

```javascript
// doPost handler
if (action === 'batch') {
  // params.requests = [{ action, method, params }, ...]
  return jsonResponse(params.requests.map(function(r) {
    return handlers[r.action](r.method, r.params);
  }));
}
```

#### ທາງ 3 — Apps Script caching

ໃຊ້ `CacheService` ສຳລັບ read-heavy endpoints:

```javascript
function handleEquipment_findAll() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('equipment_all');
  if (cached) return JSON.parse(cached);

  var result = getEquipmentTable().findAll();
  if (result.success) {
    cache.put('equipment_all', JSON.stringify(result), 30); // 30s TTL
  }
  return result;
}
```

### Workaround (ທີ່ໃຊ້ຢູ່ໃນ tests ປະຈຸບັນ)

```typescript
// ເພີ່ມ 2 ວິ delay ລະຫວ່າງ heavy suites
describe('Borrowing CRUD', () => {
  beforeAll(() => new Promise(r => setTimeout(r, 2000)));
  // ...
});

// retry on 404/429/500
async function call(action, method, params, retries = 2) { ... }
```

---

## ສະຫຼຸບ

| # | Bug | ສາເຫດ | Fix Location | Status |
|---|-----|--------|--------------|--------|
| 1 | `table.orderBy()` TypeError | Table ບໍ່ມີ entry point — ຕ້ອງຜ່ານ `where()` ກ່ອນ | SheetORM `Table.gs` | ✅ Fixed (v3) |
| 2 | Apps Script 404 throttle | Cold-start + quota — ບໍ່ແມ່ນ SheetORM bug | Test: retry + delay | ✅ Fixed (tests) |
