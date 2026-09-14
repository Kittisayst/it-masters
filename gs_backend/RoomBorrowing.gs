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

// Derive ເກີນກຳນົດ against today's date, skipping records with no dueDate,
// and self-heal the sheet so it stays accurate without a separate scheduled job.
// See docs/adr/0002-derived-overdue-status-for-room-borrowing.md.
//
// dueDate comes back from Sheets as a real Date object (Sheets auto-converts
// date-shaped strings on write), serialized as its default toString(), NOT the
// original 'YYYY-MM-DD' — so this must parse with `new Date(...)`, never compare
// as strings.
function applyOverdueStatus(result, records) {
  if (!result.success) return result;
  var todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  result.data.forEach(function(rec) {
    if (rec.status !== 'ກຳລັງຢືມ' || !rec.dueDate) return;
    var due = new Date(rec.dueDate);
    if (!isNaN(due.getTime()) && due < todayStart) {
      rec.status = 'ເກີນກຳນົດ';
      records.update(rec.id, { status: 'ເກີນກຳນົດ' });
    }
  });
  return result;
}

function handleRoomBorrowing(method, params) {
  var records   = getRoomBorrowingsTable();
  var rooms     = getRoomsTable();
  var employees = getEmployeesTable();

  // ------ READ ------
  if (method === 'findAll') {
    var allResult = records.orderBy('borrowedAt', 'DESC').get();
    applyOverdueStatus(allResult, records);
    return attachRoomAndEmployee(allResult, rooms, employees);
  }

  if (method === 'find') {
    var filterStatus = params.status;
    var q = records;
    // ເກີນກຳນົດ is derived, not stored — query active records and filter after computing.
    if (filterStatus && filterStatus !== 'ເກີນກຳນົດ') q = q.where('status', '=', filterStatus);
    else if (filterStatus === 'ເກີນກຳນົດ') q = q.where('status', '=', 'ກຳລັງຢືມ');
    if (params.employeeId) q = q.where('employeeId', '=', params.employeeId);
    if (params.roomId)     q = q.where('roomId', '=', params.roomId);

    var result = q.orderBy('borrowedAt', 'DESC').get();
    applyOverdueStatus(result, records);
    if (filterStatus === 'ເກີນກຳນົດ' && result.success) {
      result.data = result.data.filter(function(r) { return r.status === 'ເກີນກຳນົດ'; });
    }
    return attachRoomAndEmployee(result, rooms, employees);
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
      dueDate:    params.dueDate || (params.borrowedAt ? params.borrowedAt.split('T')[0] : ''),
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
