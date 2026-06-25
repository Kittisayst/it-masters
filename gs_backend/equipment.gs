// ====================================================
// Equipment handler
// ====================================================

function handleEquipment(method, params) {
  var table = getEquipmentTable();

  if (method === 'findAll') {
    var all = table.findAll();
    if (all.success) all.data.sort(function(a, b) { return a.code > b.code ? 1 : -1; });
    return all;
  }

  if (method === 'find') {
    var all = table.findAll();
    if (!all.success) return all;
    var filtered = all.data.filter(function(e) {
      if (params.type   && e.type   !== params.type)               return false;
      if (params.status && e.status !== params.status)             return false;
      if (params.name   && e.name.indexOf(params.name) === -1)     return false;
      return true;
    });
    filtered.sort(function(a, b) { return a.code > b.code ? 1 : -1; });
    return { success: true, data: filtered };
  }

  if (method === 'findById')  return table.findById(params.id);
  if (method === 'insert')    return table.insert(params);

  if (method === 'update') {
    return table.update(params.id, params.data);
  }

  if (method === 'delete')    return table.delete(params.id);

  if (method === 'updateStatus') {
    return table.update(params.id, { status: params.status });
  }

  if (method === 'stats') {
    var all = table.findAll();
    if (!all.success) return all;
    var counts = { total: 0, available: 0, borrowed: 0, repair: 0, disbursed: 0 };
    all.data.forEach(function(item) {
      counts.total++;
      if (item.status === 'ປົກກະຕິ')   counts.available++;
      if (item.status === 'ຖືກຢືມ')     counts.borrowed++;
      if (item.status === 'ສ້ອມແປງ')   counts.repair++;
      if (item.status === 'ຖືກເບີກ')   counts.disbursed++;
    });
    return { success: true, data: counts };
  }

  return { success: false, error: 'Unknown equipment method: ' + method };
}
