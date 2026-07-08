// ====================================================
// Dashboard — aggregate stats
// ====================================================

function handleDashboard(method, params) {
  if (method === 'stats') {
    var today = Utilities.formatDate(new Date(), 'Asia/Vientiane', 'yyyy-MM-dd');

    var allWork = getWorkRecordsTable().findAll();
    var workTodayCount = 0;
    if (allWork.success) {
      allWork.data.forEach(function(r) {
        if (r.date && String(r.date).slice(0, 10) === today && r.status !== 'ຍົກເລີກ') workTodayCount++;
      });
    }
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
        workToday: workTodayCount,
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
