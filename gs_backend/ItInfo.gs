// ====================================================
// ItInfo handler — WiFi / IP Camera / IP Printer /
//                  ລະຫັດລະບົບ / Server / ອື່ນໆ
// ====================================================

function handleItInfo(method, params) {
  var table = getItInfoTable();

  if (method === 'findAll') {
    return table.orderBy('name', 'ASC').get();
  }

  if (method === 'find') {
    var q = table;
    if (params.category) q = q.where('category', '=', params.category);
    if (params.status)   q = q.where('status',   '=', params.status);
    return q.orderBy('name', 'ASC').get();
  }

  if (method === 'findById') return table.findById(params.id);

  if (method === 'insert') {
    params.updatedAt = new Date().toISOString();
    return table.insert(params);
  }

  if (method === 'update') {
    params.data.updatedAt = new Date().toISOString();
    return table.update(params.id, params.data);
  }

  if (method === 'delete') return table.delete(params.id);

  return { success: false, error: 'Unknown itInfo method: ' + method };
}
