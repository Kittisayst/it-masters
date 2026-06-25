// ====================================================
// Disbursement handler (header + items)
// ====================================================

function generateDisbursementCode() {
  var headers = getDisbursementHeaderTable().orderBy('disbursementCode', 'DESC').limit(1).get();
  if (!headers.success || headers.data.length === 0) return 'D-001';
  var last = headers.data[0].disbursementCode;
  var num = parseInt(last.replace('D-', ''), 10) + 1;
  return 'D-' + String(num).padStart(3, '0');
}

function handleDisbursement(method, params) {
  var headers = getDisbursementHeaderTable();
  var items   = getDisbursementItemsTable();
  var equip   = getEquipmentTable();

  if (method === 'findAll') {
    return headers.orderBy('disbursementDate', 'DESC').get();
  }

  if (method === 'find') {
    var q = headers;
    if (params.recipientId)  q = q.where('recipientId', '=', params.recipientId);
    if (params.departmentId) q = q.where('departmentId', '=', params.departmentId);
    return q.orderBy('disbursementDate', 'DESC').get();
  }

  if (method === 'findById') {
    var header = headers.findById(params.id);
    if (!header.success) return header;
    var disbItems = items.where('disbursementId', '=', params.id).get();
    return { success: true, data: { header: header.data, items: disbItems.data || [] } };
  }

  if (method === 'getItems') {
    return items.where('disbursementId', '=', params.disbursementId).get();
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
        // Permanently mark as disbursed + update location to recipient's department
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
    var disbItems = items.where('disbursementId', '=', params.id).get();
    if (disbItems.success) {
      disbItems.data.forEach(function(item) {
        items.delete(item.id);
        equip.update(item.equipmentId, { status: 'ປົກກະຕິ' });
      });
    }
    return headers.delete(params.id);
  }

  return { success: false, error: 'Unknown disbursement method: ' + method };
}
