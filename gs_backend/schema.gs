// ====================================================
// Database connection + table schemas
// ====================================================

function getDb() {
  return SheetORM.connect(SPREADSHEET_ID);
}

function getUsersTable() {
  return getDb().table('Users').schema({
    id:        { type: 'string' },
    username:  { type: 'string', required: true },
    password:  { type: 'string', required: true },
    fullName:  { type: 'string', required: true },
    position:  { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' }
  });
}

function getDepartmentsTable() {
  return getDb().table('Departments').schema({
    id:   { type: 'string' },
    name: { type: 'string', required: true },
    code: { type: 'string' }
  });
}

function getEmployeesTable() {
  return getDb().table('Employees').schema({
    id:           { type: 'string' },
    fullName:     { type: 'string', required: true },
    position:     { type: 'string' },
    departmentId: { type: 'string' },
    phone:        { type: 'string' }
  });
}

function getWorkRecordsTable() {
  return getDb().table('WorkRecords').schema({
    id:           { type: 'string' },
    date:         { type: 'string', required: true },
    staffId:      { type: 'string', required: true },
    departmentId: { type: 'string' },
    location:     { type: 'string' },
    workType:     { type: 'string', required: true, enum: ['ສ້ອມແປງ', 'ຕິດຕັ້ງ', 'ສະໜັບສະໜູນ', 'ອື່ນໆ'] },
    description:  { type: 'string' },
    status:       { type: 'string', required: true, enum: ['ສຳເລັດ', 'ຍັງຄ້າງ'], default: 'ຍັງຄ້າງ' },
    createdAt:    { type: 'string' },
    updatedAt:    { type: 'string' }
  });
}

function getEquipmentTable() {
  return getDb().table('Equipment').schema({
    id:           { type: 'string' },
    code:         { type: 'string', required: true },
    name:         { type: 'string', required: true },
    type:         { type: 'string', required: true, enum: ['ຄອມ', 'Printer', 'Projector', 'Network', 'ອື່ນໆ'] },
    serialNumber: { type: 'string' },
    location:     { type: 'string' },
    status:       { type: 'string', required: true, enum: ['ປົກກະຕິ', 'ສ້ອມແປງ', 'ປົດລຶບ', 'ຖືກຢືມ', 'ຖືກເບີກ'], default: 'ປົກກະຕິ' },
    receivedDate: { type: 'string' },
    fundSource:   { type: 'string' },
    price:        { type: 'number' },
    recordedBy:   { type: 'string' },
    createdAt:    { type: 'string' },
    updatedAt:    { type: 'string' }
  });
}

function getBorrowingHeaderTable() {
  return getDb().table('BorrowingHeader').schema({
    id:           { type: 'string' },
    borrowCode:   { type: 'string', required: true },
    borrowerId:   { type: 'string', required: true },
    departmentId: { type: 'string' },
    borrowDate:   { type: 'string', required: true },
    dueDate:      { type: 'string' },
    returnDate:   { type: 'string' },
    approvedBy:   { type: 'string' },
    note:         { type: 'string' },
    status:       { type: 'string', required: true, enum: ['ກຳລັງຢືມ', 'ຄືນແລ້ວ', 'ເກີນກຳນົດ'], default: 'ກຳລັງຢືມ' },
    createdAt:    { type: 'string' },
    updatedAt:    { type: 'string' }
  });
}

function getBorrowingItemsTable() {
  return getDb().table('BorrowingItems').schema({
    id:          { type: 'string' },
    borrowingId: { type: 'string', required: true },
    equipmentId: { type: 'string', required: true },
    note:        { type: 'string' }
  });
}

function getDisbursementHeaderTable() {
  return getDb().table('DisbursementHeader').schema({
    id:                { type: 'string' },
    disbursementCode:  { type: 'string', required: true },
    recipientId:       { type: 'string', required: true },
    departmentId:      { type: 'string' },
    disbursementDate:  { type: 'string', required: true },
    approvedBy:        { type: 'string' },
    note:              { type: 'string' },
    createdAt:         { type: 'string' },
    updatedAt:         { type: 'string' }
  });
}

function getDisbursementItemsTable() {
  return getDb().table('DisbursementItems').schema({
    id:              { type: 'string' },
    disbursementId:  { type: 'string', required: true },
    equipmentId:     { type: 'string', required: true },
    note:            { type: 'string' }
  });
}

// ====================================================
// Migration — run once to create all sheets
// ====================================================
function runMigrations() {
  var migrations = [
    {
      version: '001', name: 'create_users',
      up: function(db) { db.createTable('Users', ['id','username','password','fullName','position','createdAt','updatedAt']); },
      down: function(db) { db.dropTable('Users'); }
    },
    {
      version: '002', name: 'create_departments',
      up: function(db) { db.createTable('Departments', ['id','name','code']); },
      down: function(db) { db.dropTable('Departments'); }
    },
    {
      version: '003', name: 'create_employees',
      up: function(db) { db.createTable('Employees', ['id','fullName','position','departmentId','phone']); },
      down: function(db) { db.dropTable('Employees'); }
    },
    {
      version: '004', name: 'create_workrecords',
      up: function(db) { db.createTable('WorkRecords', ['id','date','staffId','departmentId','location','workType','description','status','createdAt','updatedAt']); },
      down: function(db) { db.dropTable('WorkRecords'); }
    },
    {
      version: '005', name: 'create_equipment',
      up: function(db) { db.createTable('Equipment', ['id','code','name','type','serialNumber','location','status','receivedDate','fundSource','price','recordedBy','createdAt','updatedAt']); },
      down: function(db) { db.dropTable('Equipment'); }
    },
    {
      version: '006', name: 'create_borrowing',
      up: function(db) {
        db.createTable('BorrowingHeader', ['id','borrowCode','borrowerId','departmentId','borrowDate','dueDate','returnDate','approvedBy','note','status','createdAt','updatedAt']);
        db.createTable('BorrowingItems', ['id','borrowingId','equipmentId','note']);
      },
      down: function(db) {
        db.dropTable('BorrowingHeader');
        db.dropTable('BorrowingItems');
      }
    },
    {
      version: '007', name: 'create_disbursement',
      up: function(db) {
        db.createTable('DisbursementHeader', ['id','disbursementCode','recipientId','departmentId','disbursementDate','approvedBy','note','createdAt','updatedAt']);
        db.createTable('DisbursementItems', ['id','disbursementId','equipmentId','note']);
      },
      down: function(db) {
        db.dropTable('DisbursementHeader');
        db.dropTable('DisbursementItems');
      }
    }
  ];
  var result = SheetORM.migrate(SPREADSHEET_ID, migrations);
  Logger.log(JSON.stringify(result));
}

// ====================================================
// Seed — initial admin user
// ====================================================
function runSeed() {
  var seeds = {
    Users: [
      { username: 'admin', password: md5('admin123'), fullName: 'ຜູ້ດູແລລະບົບ', position: 'IT Admin' }
    ]
  };
  var result = SheetORM.seed(SPREADSHEET_ID, seeds);
  Logger.log(JSON.stringify(result));
}
