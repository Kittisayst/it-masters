// ====================================================
// Dashboard — aggregate stats
// ====================================================

function handleDashboard(method, params) {
  if (method === 'stats') {
    var today = new Date().toISOString().split('T')[0];

    var allWork = getWorkRecordsTable().findAll();
    var workToday = { success: allWork.success, data: allWork.success ? allWork.data.filter(function(r) { return r.date === today; }) : [] };
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
    var limit = params.limit || 10;
    var all = getWorkRecordsTable().findAll();
    if (!all.success) return all;
    all.data.sort(function(a, b) { return b.date > a.date ? 1 : -1; });
    return { success: true, data: all.data.slice(0, limit) };
  }

  if (method === 'overdueBorrowing') {
    var all = getBorrowingHeaderTable().findAll();
    if (!all.success) return all;
    var overdue = all.data.filter(function(b) { return b.status === 'ເກີນກຳນົດ'; });
    overdue.sort(function(a, b) { return a.dueDate > b.dueDate ? 1 : -1; });
    return { success: true, data: overdue };
  }

  return { success: false, error: 'Unknown dashboard method: ' + method };
}
