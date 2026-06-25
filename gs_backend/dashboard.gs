// ====================================================
// Dashboard — aggregate stats
// ====================================================

function handleDashboard(method, params) {
  if (method === 'stats') {
    var today = new Date().toISOString().split('T')[0];

    var workToday = getWorkRecordsTable().where('date', '=', today).get();
    var equipment = getEquipmentTable().findAll();
    var borrowing = getBorrowingHeaderTable().findAll();

    var equipStats = { total: 0, available: 0, borrowed: 0, repair: 0, disbursed: 0 };
    if (equipment.success) {
      equipment.data.forEach(function(e) {
        equipStats.total++;
        if (e.status === 'ປົກກະຕິ')  equipStats.available++;
        if (e.status === 'ຖືກຢືມ')    equipStats.borrowed++;
        if (e.status === 'ສ້ອມແປງ')  equipStats.repair++;
        if (e.status === 'ຖືກເບີກ')  equipStats.disbursed++;
      });
    }

    var borrowStats = { active: 0, overdue: 0 };
    if (borrowing.success) {
      borrowing.data.forEach(function(b) {
        if (b.status === 'ກຳລັງຢືມ')  borrowStats.active++;
        if (b.status === 'ເກີນກຳນົດ') borrowStats.overdue++;
      });
    }

    return {
      success: true,
      data: {
        workToday: workToday.success ? workToday.data.length : 0,
        equipment: equipStats,
        borrowing: borrowStats
      }
    };
  }

  if (method === 'recentWorkRecords') {
    return getWorkRecordsTable()
      .orderBy('date', 'DESC')
      .limit(params.limit || 10)
      .get();
  }

  if (method === 'overdueBorrowing') {
    return getBorrowingHeaderTable()
      .where('status', '=', 'ເກີນກຳນົດ')
      .orderBy('dueDate', 'ASC')
      .get();
  }

  return { success: false, error: 'Unknown dashboard method: ' + method };
}
