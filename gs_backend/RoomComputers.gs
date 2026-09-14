// ====================================================
// RoomComputers handler — ການຈັດວາງຄອມ (Equipment type='ຄອມ' ↔ Room)
// Current-state only, one row per equipmentId. See docs/adr/0003.
// ====================================================

function handleRoomComputers(method, params) {
  var records = getRoomComputersTable();

  if (method === 'findAll') return records.orderBy('assignedAt', 'DESC').get();

  if (method === 'find') {
    var q = records;
    if (params.roomId)     q = q.where('roomId', '=', params.roomId);
    if (params.equipmentId) q = q.where('equipmentId', '=', params.equipmentId);
    return q.get();
  }

  // ------ ASSIGN (upsert — one row per equipmentId) ------
  if (method === 'assign') {
    var existing = getRoomComputersTable().where('equipmentId', '=', params.equipmentId).get();
    if (!existing.success) return existing;

    var data = {
      equipmentId: params.equipmentId,
      roomId:      params.roomId,
      assignedAt:  params.assignedAt || new Date().toISOString(),
      recordedBy:  params.recordedBy || ''
    };

    if (existing.data.length > 0) {
      return records.update(existing.data[0].id, data);
    }
    return records.insert(data);
  }

  // ------ UNASSIGN ------
  if (method === 'unassign') {
    var toRemove = getRoomComputersTable().where('equipmentId', '=', params.equipmentId).get();
    if (!toRemove.success) return toRemove;
    if (toRemove.data.length === 0) return { success: true, data: null };
    return records.delete(toRemove.data[0].id);
  }

  return { success: false, error: 'Unknown roomComputers method: ' + method };
}

// Used by equipment.gs (status/type changes) and Rooms.gs (room delete)
// to keep RoomComputer rows honest without going through the action dispatcher.
function unassignRoomComputerByEquipmentId(equipmentId) {
  var existing = getRoomComputersTable().where('equipmentId', '=', equipmentId).get();
  if (!existing.success || existing.data.length === 0) return;
  getRoomComputersTable().delete(existing.data[0].id);
}

function deleteRoomComputersByRoomId(roomId) {
  var existing = getRoomComputersTable().where('roomId', '=', roomId).get();
  if (!existing.success) return;
  var records = getRoomComputersTable();
  existing.data.forEach(function(r) { records.delete(r.id); });
}

function countRoomComputers(roomId) {
  var result = getRoomComputersTable().where('roomId', '=', roomId).get();
  return result.success ? result.data.length : 0;
}
