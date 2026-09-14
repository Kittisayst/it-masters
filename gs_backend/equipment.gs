// ====================================================
// Equipment handler
// ====================================================

function handleEquipment(method, params) {
  var table = getEquipmentTable();

  if (method === 'findAll') {
    return table.orderBy('code', 'ASC').get();
  }

  if (method === 'find') {
    var q = table;
    if (params.type)   q = q.where('type', '=', params.type);
    if (params.status) q = q.where('status', '=', params.status);
    if (params.name)   q = q.where('name', 'contains', params.name);
    return q.orderBy('code', 'ASC').get();
  }

  if (method === 'findById')  return table.findById(params.id);
  if (method === 'insert')    return table.insert(params);

  if (method === 'update') {
    var updateResult = table.update(params.id, params.data);
    if (updateResult.success) maybeUnassignRoomComputer(params.id, params.data);
    return updateResult;
  }

  if (method === 'delete') {
    deleteNetworkPortsByEquipmentId(params.id);
    return table.delete(params.id);
  }

  if (method === 'updateStatus') {
    var statusResult = table.update(params.id, { status: params.status });
    if (statusResult.success) maybeUnassignRoomComputer(params.id, { status: params.status });
    return statusResult;
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

// Keeps RoomComputer honest (see docs/adr/0003): a computer that's disbursed,
// decommissioned, or recategorized away from 'ຄອມ' no longer occupies a room.
// ຖືກຢືມ/ສ້ອມແປງ are temporary absences and are intentionally left untouched.
function maybeUnassignRoomComputer(equipmentId, changes) {
  var statusCleared = changes.status === 'ຖືກເບີກ' || changes.status === 'ປົດລຶບ';
  var typeChangedAway = changes.type !== undefined && changes.type !== 'ຄອມ';
  if (statusCleared || typeChangedAway) {
    unassignRoomComputerByEquipmentId(equipmentId);
  }
}
