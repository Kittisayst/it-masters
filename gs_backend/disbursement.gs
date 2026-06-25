// ====================================================
// Disbursement handler (header + items)
// ====================================================

function generateDisbursementCode() {
  var all = getDisbursementHeaderTable().findAll();
  if (!all.success || all.data.length === 0) return 'D-001';
  var codes = all.data.map(function(h) { return parseInt((h.disbursementCode || 'D-000').replace('D-', ''), 10); });
  var max = Math.max.apply(null, codes);
  return 'D-' + String(max + 1).padStart(3, '0');
}

function handleDisbursement(method, params) {
  var headers = getDisbursementHeaderTable();
  var items   = getDisbursementItemsTable();
  var equip   = getEquipmentTable();

  if (method === 'findAll') {
    var all = headers.findAll();
    if (all.success) all.data.sort(function(a, b) { return b.disbursementDate > a.disbursementDate ? 1 : -1; });
    return all;
  }

  if (method === 'find') {
    var all = headers.findAll();
    if (!all.success) return all;
    var filtered = all.data.filter(function(h) {
      if (params.recipientId  && h.recipientId  !== params.recipientId)  return false;
      if (params.departmentId && h.departmentId !== params.departmentId) return false;
      return true;
    });
    filtered.sort(function(a, b) { return b.disbursementDate > a.disbursementDate ? 1 : -1; });
    return { success: true, data: filtered };
  }

  if (method === 'findById') {
    var header = headers.findById(params.id);
    if (!header.success) return header;
    var allItems = items.findAll();
    var disbItems = allItems.success
      ? allItems.data.filter(function(i) { return i.disbursementId === params.id; })
      : [];
    return { success: true, data: { header: header.data, items: disbItems } };
  }

  if (method === 'getItems') {
    var allItems = items.findAll();
    if (!allItems.success) return allItems;
    return { success: true, data: allItems.data.filter(function(i) { return i.disbursementId === params.disbursementId; }) };
  }

  if (method === 'insert') {
    var headerData = params.header;
    headerData.disbursementCode = generateDisbursementCode();
    var headerResult = headers.insert(headerData);
    if (!headerResult.success) return headerResult;

    var disbursementId = headerResult.data.id;
    var itemErrors = [];

    (params.items || []).forEach(function(item) {
      var inserted = items.insert({ disbursementId: disbursementId, equipmentId: item.equipmentId, note: item.note || '' });
      if (inserted.success) {
        equip.update(item.equipmentId, { status: 'ຖືກເບີກ', location: headerData.departmentId });
      } else {
        itemErrors.push(item.equipmentId);
      }
    });

    return { success: true, data: { id: disbursementId, disbursementCode: headerData.disbursementCode, itemErrors: itemErrors } };
  }

  if (method === 'update') {
    return headers.update(params.id, params.data);
  }

  if (method === 'delete') {
    var allItems = items.findAll();
    if (allItems.success) {
      allItems.data
        .filter(function(i) { return i.disbursementId === params.id; })
        .forEach(function(item) {
          items.delete(item.id);
          equip.update(item.equipmentId, { status: 'ປົກກະຕິ' });
        });
    }
    return headers.delete(params.id);
  }

  return { success: false, error: 'Unknown disbursement method: ' + method };
}
