// ====================================================
// Borrowing handler (header + items)
// ====================================================

function generateBorrowCode() {
  var headers = getBorrowingHeaderTable().orderBy('borrowCode', 'DESC').limit(1).get();
  if (!headers.success || headers.data.length === 0) return 'B-001';
  var last = headers.data[0].borrowCode;
  var num = parseInt(last.replace('B-', ''), 10) + 1;
  return 'B-' + String(num).padStart(3, '0');
}

function attachEquipmentList(result, itemsTable, equipTable) {
  if (!result.success) return result;

  var allItems = itemsTable.findAll();
  var allEquip = equipTable.findAll();
  var equipMap = {};
  (allEquip.data || []).forEach(function(e) { equipMap[e.id] = e; });

  var itemsByBorrowing = {};
  (allItems.data || []).forEach(function(it) {
    if (!itemsByBorrowing[it.borrowingId]) itemsByBorrowing[it.borrowingId] = [];
    itemsByBorrowing[it.borrowingId].push(equipMap[it.equipmentId] || { id: it.equipmentId, name: it.equipmentId, code: '' });
  });

  result.data.forEach(function(h) {
    h.equipmentList = itemsByBorrowing[h.id] || [];
  });
  return result;
}

function handleBorrowing(method, params) {
  var headers = getBorrowingHeaderTable();
  var items   = getBorrowingItemsTable();
  var equip   = getEquipmentTable();

  // ------ READ ------
  if (method === 'findAll') {
    return attachEquipmentList(headers.orderBy('borrowDate', 'DESC').get(), items, equip);
  }

  if (method === 'find') {
    var q = headers;
    if (params.status)     q = q.where('status', '=', params.status);
    if (params.borrowerId) q = q.where('borrowerId', '=', params.borrowerId);
    return attachEquipmentList(q.orderBy('borrowDate', 'DESC').get(), items, equip);
  }

  if (method === 'findById') {
    var header = headers.findById(params.id);
    if (!header.success) return header;
    var borrowItems = items.where('borrowingId', '=', params.id).get();
    return { success: true, data: { header: header.data, items: borrowItems.data || [] } };
  }

  if (method === 'getItems') {
    return items.where('borrowingId', '=', params.borrowingId).get();
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

    var borrowItems = items.where('borrowingId', '=', params.id).get();
    if (borrowItems.success) {
      borrowItems.data.forEach(function(item) {
        equip.update(item.equipmentId, { status: 'ປົກກະຕິ' });
      });
    }
    return updateResult;
  }

  // ------ OVERDUE ------
  if (method === 'checkOverdue') {
    var today = new Date().toISOString().split('T')[0];
    var overdueList = headers
      .where('status', '=', 'ກຳລັງຢືມ')
      .where('dueDate', '<', today)
      .get();
    if (overdueList.success) {
      overdueList.data.forEach(function(h) {
        headers.update(h.id, { status: 'ເກີນກຳນົດ' });
      });
    }
    return { success: true, data: { updated: overdueList.success ? overdueList.data.length : 0 } };
  }

  // ------ DELETE ------
  if (method === 'delete') {
    var borrowItems = items.where('borrowingId', '=', params.id).get();
    if (borrowItems.success) {
      borrowItems.data.forEach(function(item) {
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
