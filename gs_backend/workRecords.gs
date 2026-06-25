// ====================================================
// WorkRecords handler
// ====================================================

function handleWorkRecords(method, params) {
  var table = getWorkRecordsTable();

  if (method === 'findAll') {
    var all = table.findAll();
    if (all.success) all.data.sort(function(a, b) { return b.date > a.date ? 1 : -1; });
    return all;
  }

  if (method === 'find') {
    var all = table.findAll();
    if (!all.success) return all;
    var filtered = all.data.filter(function(r) {
      if (params.staffId      && r.staffId      !== params.staffId)      return false;
      if (params.departmentId && r.departmentId !== params.departmentId) return false;
      if (params.status       && r.status       !== params.status)       return false;
      if (params.dateFrom     && r.date < params.dateFrom)               return false;
      if (params.dateTo       && r.date > params.dateTo)                 return false;
      return true;
    });
    filtered.sort(function(a, b) { return b.date > a.date ? 1 : -1; });
    return { success: true, data: filtered };
  }

  if (method === 'findById') return table.findById(params.id);
  if (method === 'insert')   return table.insert(params);
  if (method === 'update')   return table.update(params.id, params.data);
  if (method === 'delete')   return table.delete(params.id);

  if (method === 'todayCount') {
    var today = new Date().toISOString().split('T')[0];
    var all = table.findAll();
    var count = all.success ? all.data.filter(function(r) { return r.date === today; }).length : 0;
    return { success: true, data: { count: count } };
  }

  return { success: false, error: 'Unknown workRecords method: ' + method };
}
