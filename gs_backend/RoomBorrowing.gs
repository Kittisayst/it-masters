// ====================================================
// RoomBorrowing handler — ຢືມກະແຈຫ້ອງຄອມ (flat, no header+items)
// ====================================================

function attachRoomAndEmployee(result, roomsTable, employeesTable) {
  if (!result.success) return result;

  var allRooms = roomsTable.findAll();
  var allEmployees = employeesTable.findAll();
  var roomMap = {};
  (allRooms.data || []).forEach(function(r) { roomMap[r.id] = r; });
  var employeeMap = {};
  (allEmployees.data || []).forEach(function(e) { employeeMap[e.id] = e; });

  result.data.forEach(function(rec) {
    rec.room = roomMap[rec.roomId] || null;
    rec.employee = employeeMap[rec.employeeId] || null;
  });
  return result;
}

function handleRoomBorrowing(method, params) {
  var records   = getRoomBorrowingsTable();
  var rooms     = getRoomsTable();
  var employees = getEmployeesTable();

  // ------ READ ------
  if (method === 'findAll') {
    return attachRoomAndEmployee(records.orderBy('borrowedAt', 'DESC').get(), rooms, employees);
  }

  if (method === 'find') {
    var q = records;
    if (params.status)     q = q.where('status', '=', params.status);
    if (params.employeeId) q = q.where('employeeId', '=', params.employeeId);
    if (params.roomId)     q = q.where('roomId', '=', params.roomId);
    return attachRoomAndEmployee(q.orderBy('borrowedAt', 'DESC').get(), rooms, employees);
  }

  if (method === 'findById') return records.findById(params.id);

  // ------ CREATE ------
  if (method === 'insert') {
    var room = rooms.findById(params.roomId);
    if (!room.success) return room;
    if (room.data.status === 'ຖືກຢືມ') {
      return { success: false, error: 'ຫ້ອງນີ້ກຳລັງຖືກຢືມຢູ່' };
    }

    var data = {
      employeeId: params.employeeId,
      roomId:     params.roomId,
      borrowedAt: params.borrowedAt,
      dueDate:    params.dueDate || '',
      recordedBy: params.recordedBy || '',
      purpose:    params.purpose || '',
      status:     'ກຳລັງຢືມ'
    };
    var inserted = records.insert(data);
    if (!inserted.success) return inserted;

    rooms.update(params.roomId, { status: 'ຖືກຢືມ' });
    return inserted;
  }

  // ------ RETURN ------
  if (method === 'return') {
    var existing = records.findById(params.id);
    if (!existing.success) return existing;

    var updateResult = records.update(params.id, {
      returnedAt: params.returnedAt || new Date().toISOString(),
      status: 'ສົ່ງແລ້ວ'
    });
    if (!updateResult.success) return updateResult;

    rooms.update(existing.data.roomId, { status: 'ປົກກະຕິ' });
    return updateResult;
  }

  // ------ OVERDUE ------
  if (method === 'checkOverdue') {
    var today = new Date().toISOString().split('T')[0];
    var overdueList = records
      .where('status', '=', 'ກຳລັງຢືມ')
      .where('dueDate', '<', today)
      .get();
    if (overdueList.success) {
      overdueList.data.forEach(function(r) {
        records.update(r.id, { status: 'ເກີນກຳນົດ' });
      });
    }
    return { success: true, data: { updated: overdueList.success ? overdueList.data.length : 0 } };
  }

  // ------ DELETE ------
  if (method === 'delete') {
    var toDelete = records.findById(params.id);
    if (toDelete.success && (toDelete.data.status === 'ກຳລັງຢືມ' || toDelete.data.status === 'ເກີນກຳນົດ')) {
      rooms.update(toDelete.data.roomId, { status: 'ປົກກະຕິ' });
    }
    return records.delete(params.id);
  }

  // ------ STATS ------
  if (method === 'stats') {
    var all = records.findAll();
    if (!all.success) return all;
    var counts = { total: 0, active: 0, overdue: 0 };
    all.data.forEach(function(r) {
      counts.total++;
      if (r.status === 'ກຳລັງຢືມ')  counts.active++;
      if (r.status === 'ເກີນກຳນົດ') counts.overdue++;
    });
    return { success: true, data: counts };
  }

  return { success: false, error: 'Unknown roomBorrowing method: ' + method };
}
