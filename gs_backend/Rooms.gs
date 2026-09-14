// ====================================================
// Rooms handler — master data for computer rooms
// ====================================================

// computerCount is derived from RoomComputers (see docs/adr/0003), not stored.
function withComputerCount(result) {
  if (!result.success) return result;
  var rooms = Array.isArray(result.data) ? result.data : [result.data];
  rooms.forEach(function(room) { room.computerCount = countRoomComputers(room.id); });
  return result;
}

function handleRooms(method, params) {
  var table = getRoomsTable();

  if (method === 'findAll') return withComputerCount(table.findAll());
  if (method === 'findById') return withComputerCount(table.findById(params.id));
  if (method === 'find') {
    var q = table;
    if (params.status) q = q.where('status', '=', params.status);
    return withComputerCount(q.get());
  }
  if (method === 'insert') return table.insert(params);
  if (method === 'update') return table.update(params.id, params.data);
  if (method === 'delete') {
    deleteRoomComputersByRoomId(params.id);
    return table.delete(params.id);
  }

  return { success: false, error: 'Unknown rooms method: ' + method };
}
