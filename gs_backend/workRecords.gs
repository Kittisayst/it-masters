// ====================================================
// WorkRecords handler
// ====================================================

function handleWorkRecords(method, params) {
  var table = getWorkRecordsTable();

  if (method === 'findAll') {
    return table.orderBy('createdAt', 'DESC').get();
  }

  if (method === 'find') {
    var q = table;
    if (params.departmentId) q = q.where('departmentId', '=', params.departmentId);
    if (params.dateFrom)     q = q.where('date', '>=', params.dateFrom);
    if (params.dateTo)       q = q.where('date', '<=', params.dateTo);
    var result = q.orderBy('createdAt', 'DESC').get();
    if (result.success) {
      if (params.statuses) {
        var statusList = String(params.statuses).split(',');
        result.data = result.data.filter(function(r) {
          return statusList.indexOf(String(r.status || '')) !== -1;
        });
      }
      if (params.staffId) {
        result.data = result.data.filter(function(r) {
          return String(r.staffIds || '').split(',').indexOf(params.staffId) !== -1;
        });
      }
    }
    return result;
  }

  if (method === 'findById') return table.findById(params.id);
  if (method === 'insert')   return table.insert(params);
  if (method === 'update')   return table.update(params.id, params.data);
  if (method === 'delete')   return table.delete(params.id);

  if (method === 'todayCount') {
    var today = Utilities.formatDate(new Date(), 'Asia/Vientiane', 'yyyy-MM-dd');
    var result = table.where('date', '=', today).get();
    return { success: true, data: { count: result.success ? result.data.length : 0 } };
  }

  return { success: false, error: 'Unknown workRecords method: ' + method };
}
