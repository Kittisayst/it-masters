// ====================================================
// SETUP CHECKLIST (ທຳຄັ້ງດຽວ)
// ====================================================
// 1. ໄປທີ່ Apps Script editor > Libraries > (+)
//    ໃສ່ SheetORM Script ID  →  identifier = "SheetORM"
//
// 2. ຕັ້ງ SPREADSHEET_ID ໃນ Project Settings > Script Properties:
//    key = SPREADSHEET_ID  |  value = <id ຂອງ Google Sheet>
//
// 3. Deploy > New deployment > Web app
//    Execute as: Me  |  Who has access: Anyone
// ====================================================

var SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')
  || '1i2cq5MOK3MXUVWq_oQOHaH3PlCPDnJyr_FzHDoPa0io';

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var body   = JSON.parse(e.postData.contents);
    var action = body.action;
    var method = body.method;
    var params = body.params || {};

    var handlers = {
      auth:         handleAuth,
      users:        handleUsers,
      departments:  handleDepartments,
      employees:    handleEmployees,
      workRecords:  handleWorkRecords,
      equipment:    handleEquipment,
      borrowing:    handleBorrowing,
      disbursement: handleDisbursement,
      dashboard:    handleDashboard
    };

    if (!handlers[action]) {
      return jsonResponse({ success: false, error: 'Unknown action: ' + action });
    }

    return jsonResponse(handlers[action](method, params));

  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doGet(e) {
  return jsonResponse({ success: true, message: 'IT Masters API is running' });
}
