// ====================================================
// Borrowing handler (header + items)
// ====================================================

function generateBorrowCode() {
  var all = getBorrowingHeaderTable().findAll();
  if (!all.success || all.data.length === 0) return 'B-001';
  var codes = all.data.map(function(h) { return parseInt((h.borrowCode || 'B-000').replace('B-', ''), 10); });
  var max = Math.max.apply(null, codes);
  return 'B-' + String(max + 1).padStart(3, '0');
}

function handleBorrowing(method, params) {
  var headers = getBorrowingHeaderTable();
  var items   = getBorrowingItemsTable();
  var equip   = getEquipmentTable();

  // ------ READ ------
  if (method === 'findAll') {
    var all = headers.findAll();
    if (all.success) all.data.sort(function(a, b) { return b.borrowDate > a.borrowDate ? 1 : -1; });
    return all;
  }

  if (method === 'find') {
    var all = headers.findAll();
    if (!all.success) return all;
    var filtered = all.data.filter(function(h) {
      if (params.status     && h.status     !== params.status)     return false;
      if (params.borrowerId && h.borrowerId !== params.borrowerId) return false;
      return true;
    });
    filtered.sort(function(a, b) { return b.borrowDate > a.borrowDate ? 1 : -1; });
    return { success: true, data: filtered };
  }

  if (method === 'findById') {
    var header = headers.findById(params.id);
    if (!header.success) return header;
    var allItems = items.findAll();
    var borrowItems = allItems.success
      ? allItems.data.filter(function(i) { return i.borrowingId === params.id; })
      : [];
    return { success: true, data: { header: header.data, items: borrowItems } };
  }

  if (method === 'getItems') {
    var allItems = items.findAll();
    if (!allItems.success) return allItems;
    return { success: true, data: allItems.data.filter(function(i) { return i.borrowingId === params.borrowingId; }) };
  }

  // ------ CREATE ------
  if (method === 'insert') {
    var headerData = params.header;
    headerData.borrowCode = generateBorrowCode();
    headerData.status = 'ກຳລັງຢືມ';
    var headerResult = headers.insert(headerData);
    if (!headerResult.success) return headerResult;

    var borrowingId = headerResult.data.id;
    var itemErrors = [];

    (params.items || []).forEach(function(item) {
      var inserted = items.insert({ borrowingId: borrowingId, equipmentId: item.equipmentId, note: item.note || '' });
      if (inserted.success) {
        equip.update(item.equipmentId, { status: 'ຖືກຢືມ' });
      } else {
        itemErrors.push(item.equipmentId);
      }
    });

    return { success: true, data: { id: borrowingId, borrowCode: headerData.borrowCode, itemErrors: itemErrors } };
  }

  // ------ UPDATE ------
  if (method === 'update') {
    return headers.update(params.id, params.data);
  }

  // ------ RETURN ------
  if (method === 'return') {
    var updateResult = headers.update(params.id, {
      returnDate: params.returnDate || new Date().toISOString().split('T')[0],
      status: 'ຄືນແລ້ວ'
    });
    if (!updateResult.success) return updateResult;

    var allItems = items.findAll();
    if (allItems.success) {
      allItems.data
        .filter(function(i) { return i.borrowingId === params.id; })
        .forEach(function(item) { equip.update(item.equipmentId, { status: 'ປົກກະຕິ' }); });
    }
    return updateResult;
  }

  // ------ OVERDUE ------
  if (method === 'checkOverdue') {
    var today = new Date().toISOString().split('T')[0];
    var all = headers.findAll();
    var updated = 0;
    if (all.success) {
      all.data
        .filter(function(h) { return h.status === 'ກຳລັງຢືມ' && h.dueDate < today; })
        .forEach(function(h) { headers.update(h.id, { status: 'ເກີນກຳນົດ' }); updated++; });
    }
    return { success: true, data: { updated: updated } };
  }

  // ------ DELETE ------
  if (method === 'delete') {
    var allItems = items.findAll();
    if (allItems.success) {
      allItems.data
        .filter(function(i) { return i.borrowingId === params.id; })
        .forEach(function(item) {
          items.delete(item.id);
          equip.update(item.equipmentId, { status: 'ປົກກະຕິ' });
        });
    }
    return headers.delete(params.id);
  }

  // ------ STATS ------
  if (method === 'stats') {
    var all = headers.findAll();
    if (!all.success) return all;
    var counts = { total: 0, active: 0, returned: 0, overdue: 0 };
    all.data.forEach(function(h) {
      counts.total++;
      if (h.status === 'ກຳລັງຢືມ')  counts.active++;
      if (h.status === 'ຄືນແລ້ວ')    counts.returned++;
      if (h.status === 'ເກີນກຳນົດ') counts.overdue++;
    });
    return { success: true, data: counts };
  }

  return { success: false, error: 'Unknown borrowing method: ' + method };
}
