// ====================================================
// Rooms handler — master data for computer rooms
// ====================================================

function handleRooms(method, params) {
  var table = getRoomsTable();

  if (method === 'findAll') return table.findAll();
  if (method === 'findById') return table.findById(params.id);
  if (method === 'find') {
    var q = table;
    if (params.status) q = q.where('status', '=', params.status);
    return q.get();
  }
  if (method === 'insert') return table.insert(params);
  if (method === 'update') return table.update(params.id, params.data);
  if (method === 'delete') return table.delete(params.id);

  return { success: false, error: 'Unknown rooms method: ' + method };
}
