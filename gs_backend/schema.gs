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

function getCategoriesTable() {
  return getDb().table('Categories').schema({
    id:          { type: 'string' },
    name:        { type: 'string', required: true },
    description: { type: 'string' },
    createdAt:   { type: 'string' },
    updatedAt:   { type: 'string' }
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
    workType:     { type: 'string', required: true },
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
    type:         { type: 'string', required: true },
    categoryId:   { type: 'string' },
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

function getWorkTypesTable() {
  return getDb().table('WorkTypes').schema({
    id:          { type: 'string' },
    name:        { type: 'string', required: true },
    description: { type: 'string' },
    createdAt:   { type: 'string' },
    updatedAt:   { type: 'string' }
  });
}

function getItInfoTable() {
  return getDb().table('ItInfo').schema({
    id:         { type: 'string' },
    category:   { type: 'string', required: true, enum: ['wifi', 'camera', 'printer', 'account', 'server', 'other'] },
    name:       { type: 'string', required: true },
    location:   { type: 'string' },
    ipAddress:  { type: 'string' },
    macAddress: { type: 'string' },
    username:   { type: 'string' },
    password:   { type: 'string' },
    brand:      { type: 'string' },
    model:      { type: 'string' },
    url:        { type: 'string' },
    notes:      { type: 'string' },
    status:     { type: 'string', required: true, enum: ['ໃຊ້ງານ', 'ບໍ່ໃຊ້ງານ'], default: 'ໃຊ້ງານ' },
    recordedBy: { type: 'string' },
    updatedAt:  { type: 'string' }
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
      up: function(db) { db.createTable('Equipment', ['id','code','name','type','categoryId','serialNumber','location','status','receivedDate','fundSource','price','recordedBy','createdAt','updatedAt']); },
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
    },
    {
      version: '008', name: 'create_categories',
      up: function(db) { db.createTable('Categories', ['id','name','description','createdAt','updatedAt']); },
      down: function(db) { db.dropTable('Categories'); }
    },
    {
      version: '009', name: 'create_itinfo',
      up: function(db) {
        db.createTable('ItInfo', ['id','category','name','location','ipAddress','macAddress','username','password','brand','model','url','notes','status','recordedBy','updatedAt']);
      },
      down: function(db) { db.dropTable('ItInfo'); }
    },
    {
      version: '010', name: 'create_worktypes',
      up: function(db) { db.createTable('WorkTypes', ['id','name','description','createdAt','updatedAt']); },
      down: function(db) { db.dropTable('WorkTypes'); }
    }
  ];
  var result = SheetORM.migrate(SPREADSHEET_ID, migrations);
  Logger.log(JSON.stringify(result));
}

// ====================================================
// Seed — admin user + departments + categories
// ====================================================
function runSeed() {
  var seeds = {
    Users: [
      { username: 'admin', password: md5('admin123'), fullName: 'ຜູ້ດູແລລະບົບ', position: 'IT Admin' }
    ],
    Departments: [
      { name: 'ບໍລິຫານ-ທຸລະກິດ',                              code: 'BUS' },
      { name: 'ເຕັກໂນໂລຊີໄຟຟ້າ',                              code: 'ELE' },
      { name: 'ອຸດສາຫະກໍາ',                                    code: 'IND' },
      { name: 'ບໍລິຫານໂຮງແຮມ ແລະ ການທ່ອງທ່ຽວ',               code: 'HTM' },
      { name: 'ກໍ່ສ້າງເຄຫາສະຖານ',                             code: 'CON' },
      { name: 'ພະແນກ ວິຊາການ',                                 code: 'ACA' },
      { name: 'ພະແນກ ບໍລິຫານ ແລະ ຈັດຕັ້ງພະນັກງານ',           code: 'ADM' },
      { name: 'ພະແນກ ກິດຈະການນັກສຶກສາ',                       code: 'STU' },
      { name: 'ສູນເຝິກອົບຮົມການບໍລິການໂຮງແຮມ ແລະ ການທ່ອງທ່ຽວ', code: 'HTC' },
      { name: 'ຄະນະອຳນວຍການ',                                   code: 'MGT' }
    ]
  };
  var result = SheetORM.seed(SPREADSHEET_ID, seeds);
  Logger.log(JSON.stringify(result));
}

// ====================================================
// Seed categories — run separately if needed
// ====================================================
function runSeedCategories() {
  var seeds = {
    Categories: [
      { name: 'ຄອມພິວເຕີ',     description: 'Desktop, Laptop, All-in-one' },
      { name: 'Printer',       description: 'Laser, Inkjet, Plotter' },
      { name: 'Projector',     description: 'Projector ແລະ ອຸປະກອນສາຍສັນຍາ' },
      { name: 'Network',       description: 'Router, Switch, Access Point, Cable' },
      { name: 'ອຸປະກອນໄຟຟ້າ', description: 'UPS, Stabilizer, Extension' },
      { name: 'ອື່ນໆ',         description: 'ອຸປະກອນ IT ອື່ນໆ' }
    ]
  };
  var result = SheetORM.seed(SPREADSHEET_ID, seeds);
  Logger.log(JSON.stringify(result));
}

// ====================================================
// Seed employees — requires Departments to exist first
// ====================================================
function runSeedEmployees() {
  var depts = getDepartmentsTable().findAll();
  if (!depts.success) { Logger.log('Departments not found: ' + depts.error); return; }

  var deptMap = {};
  depts.data.forEach(function(d) { deptMap[d.code] = d.id; });

  var result = getEmployeesTable().insertMany([
    { fullName: 'ທ. ສົມຊາຍ ວົງສີ',     position: 'ຫົວໜ້າ IT',      departmentId: deptMap['ADM'], phone: '020-5555-0001' },
    { fullName: 'ນ. ນ້ຳຝົນ ພົມມະວົງ',   position: 'ນັກວິຊາການ IT', departmentId: deptMap['ACA'], phone: '020-5555-0002' },
    { fullName: 'ທ. ວິໄລ ດາລາວົງ',     position: 'ຄູສອນ',          departmentId: deptMap['ELE'], phone: '020-5555-0003' },
    { fullName: 'ນ. ສຸດາ ພັດທະໜາ',     position: 'ຄູສອນ',          departmentId: deptMap['BUS'], phone: '020-5555-0004' },
    { fullName: 'ທ. ຄຳໄຂ ບຸນຍະວົງ',   position: 'ນັກວິຊາການ',    departmentId: deptMap['IND'], phone: '020-5555-0005' },
    { fullName: 'ນ. ມາລີ ສີດາວົງ',     position: 'ເລຂານຸການ',     departmentId: deptMap['STU'], phone: '020-5555-0006' },
    { fullName: 'ທ. ບຸນທວີ ແສງດາລາ', position: 'ຄູສອນ',          departmentId: deptMap['HTM'], phone: '020-5555-0007' },
    { fullName: 'ນ. ຈັນທະລາ ວົງໄຊ',   position: 'ຄູສອນ',          departmentId: deptMap['CON'], phone: '020-5555-0008' }
  ]);
  Logger.log(JSON.stringify(result));
}

// ====================================================
// Seed equipment — requires Categories + Users first
// ====================================================
function runSeedEquipment() {
  var cats = getCategoriesTable().findAll();
  if (!cats.success) { Logger.log('Categories not found: ' + cats.error); return; }

  var users = getUsersTable().findAll();
  if (!users.success || !users.data.length) { Logger.log('Users not found'); return; }

  var catMap = {};
  cats.data.forEach(function(c) { catMap[c.name] = c.id; });
  var adminId = users.data[0].id;

  var result = getEquipmentTable().insertMany([
    { code: 'IT-001', name: 'Dell Laptop Inspiron 15',    type: 'ຄອມ',            categoryId: catMap['ຄອມພິວເຕີ'],    serialNumber: 'DL-2024-001', location: 'ຫ້ອງ IT',      status: 'ປົກກະຕິ', receivedDate: '2024-01-15', fundSource: 'ງົບປະມານ 2024',  price: 8000000,  recordedBy: adminId },
    { code: 'IT-002', name: 'HP LaserJet Pro M404n',      type: 'Printer',        categoryId: catMap['Printer'],       serialNumber: 'HP-2024-001', location: 'ຫ້ອງ ADM',     status: 'ປົກກະຕິ', receivedDate: '2024-02-01', fundSource: 'ງົບປະມານ 2024',  price: 3500000,  recordedBy: adminId },
    { code: 'IT-003', name: 'Epson EB-X51 Projector',     type: 'Projector',      categoryId: catMap['Projector'],     serialNumber: 'EP-2023-001', location: 'ຫ້ອງປະຊຸມ',   status: 'ປົກກະຕິ', receivedDate: '2023-11-10', fundSource: 'ໂຄງການ JICA',   price: 12000000, recordedBy: adminId },
    { code: 'IT-004', name: 'Cisco Switch 24-port',       type: 'Network',        categoryId: catMap['Network'],       serialNumber: 'CS-2023-001', location: 'ຫ້ອງ Server',  status: 'ປົກກະຕິ', receivedDate: '2023-09-05', fundSource: 'ໂຄງການ JICA',   price: 9000000,  recordedBy: adminId },
    { code: 'IT-005', name: 'Dell Desktop OptiPlex 3090', type: 'ຄອມ',            categoryId: catMap['ຄອມພິວເຕີ'],    serialNumber: 'DK-2022-001', location: 'ຫ້ອງ Lab 1',  status: 'ປົກກະຕິ', receivedDate: '2022-06-20', fundSource: 'ງົບປະມານ 2022',  price: 7000000,  recordedBy: adminId },
    { code: 'IT-006', name: 'APC UPS 1000VA',             type: 'ອຸປະກອນໄຟຟ້າ', categoryId: catMap['ອຸປະກອນໄຟຟ້າ'], serialNumber: 'APC-2023-01', location: 'ຫ້ອງ Server',  status: 'ປົກກະຕິ', receivedDate: '2023-03-15', fundSource: 'ງົບປະມານ 2023',  price: 2500000,  recordedBy: adminId }
  ]);
  Logger.log(JSON.stringify(result));
}

// ====================================================
// Migration 010 only — run if sheet WorkTypes missing
// ====================================================
function runMigration010_WorkTypes() {
  var result = SheetORM.migrate(SPREADSHEET_ID, [
    {
      version: '010', name: 'create_worktypes',
      up: function(db) { db.createTable('WorkTypes', ['id','name','description','createdAt','updatedAt']); },
      down: function(db) { db.dropTable('WorkTypes'); }
    }
  ]);
  Logger.log(JSON.stringify(result));
}

// ====================================================
// Seed workTypes — default types
// ====================================================
function runSeedWorkTypes() {
  var result = getWorkTypesTable().insertMany([
    { name: 'ສ້ອມແປງ',     description: 'ສ້ອມແປງ ແລະ ແກ້ໄຂ' },
    { name: 'ຕິດຕັ້ງ',     description: 'ຕິດຕັ້ງໂປຣແກຣມ ຫຼື ອຸປະກອນ' },
    { name: 'ສະໜັບສະໜູນ', description: 'ຊ່ວຍເຫຼືອ ແລະ ແນະນຳ' },
    { name: 'ອື່ນໆ',       description: 'ວຽກງານອື່ນໆ' }
  ]);
  Logger.log(JSON.stringify(result));
}

// ====================================================
// Migration 009 only — run if sheet ItInfo missing
// ====================================================
function runMigration009_ItInfo() {
  var result = SheetORM.migrate(SPREADSHEET_ID, [
    {
      version: '009', name: 'create_itinfo',
      up: function(db) {
        db.createTable('ItInfo', ['id','category','name','location','ipAddress','macAddress','username','password','brand','model','url','notes','status','recordedBy','updatedAt']);
      },
      down: function(db) { db.dropTable('ItInfo'); }
    }
  ]);
  Logger.log(JSON.stringify(result));
}

// ====================================================
// Seed itInfo — sample data for each category
// ====================================================
function runSeedItInfo() {
  var users = getUsersTable().findAll();
  if (!users.success || !users.data.length) { Logger.log('Users not found'); return; }
  var adminId = users.data[0].id;
  var now = new Date().toISOString();

  var result = getItInfoTable().insertMany([
    { category: 'wifi',    name: 'WiFi ຫ້ອງ Admin',        location: 'ອາຄານ A ຊັ້ນ 1', username: 'LPTVT_Admin',   password: 'admin@2024',   brand: 'TP-Link',   model: 'TL-WR841N',    status: 'ໃຊ້ງານ', recordedBy: adminId, updatedAt: now },
    { category: 'wifi',    name: 'WiFi ຫ້ອງ Lab',           location: 'ອາຄານ B ຊັ້ນ 1', username: 'LPTVT_Lab',     password: 'lab@2024',     brand: 'TP-Link',   model: 'TL-WR940N',    status: 'ໃຊ້ງານ', recordedBy: adminId, updatedAt: now },
    { category: 'camera',  name: 'Camera ທາງເຂົ້າຫຼັກ',    location: 'ປະຕູໜ້າ',        ipAddress: '192.168.1.101', macAddress: 'AA:BB:CC:01:01:01', username: 'admin', password: 'admin123', brand: 'Hikvision', model: 'DS-2CD2143G2', status: 'ໃຊ້ງານ', recordedBy: adminId, updatedAt: now },
    { category: 'camera',  name: 'Camera ອາຄານ A',          location: 'ອາຄານ A ຊັ້ນ 2', ipAddress: '192.168.1.102', macAddress: 'AA:BB:CC:01:01:02', username: 'admin', password: 'admin123', brand: 'Hikvision', model: 'DS-2CD2143G2', status: 'ໃຊ້ງານ', recordedBy: adminId, updatedAt: now },
    { category: 'printer', name: 'Printer ຫ້ອງ Admin',      location: 'ຫ້ອງ Admin',      ipAddress: '192.168.1.201', username: 'admin',   password: '',         brand: 'HP',        model: 'LaserJet M404n', url: 'http://192.168.1.201', status: 'ໃຊ້ງານ', recordedBy: adminId, updatedAt: now },
    { category: 'printer', name: 'Printer ຫ້ອງ ACA',        location: 'ພະແນກ ວິຊາການ',  ipAddress: '192.168.1.202', username: 'admin',   password: '',         brand: 'Epson',     model: 'L3250',          url: 'http://192.168.1.202', status: 'ໃຊ້ງານ', recordedBy: adminId, updatedAt: now },
    { category: 'server',  name: 'File Server',              location: 'ຫ້ອງ Server',    ipAddress: '192.168.1.10',  username: 'administrator', password: 'Srv@2024!', brand: 'Dell', model: 'PowerEdge T40',  url: 'http://192.168.1.10', status: 'ໃຊ້ງານ', recordedBy: adminId, updatedAt: now },
    { category: 'account', name: 'Google Workspace Admin',  url: 'https://admin.google.com', username: 'admin@lptvt.edu.la', password: 'Gws@2024!', status: 'ໃຊ້ງານ', recordedBy: adminId, updatedAt: now },
    { category: 'account', name: 'Facebook Page ວິທະຍາໄລ',  url: 'https://facebook.com', username: 'page@lptvt.edu.la',  password: 'Fb@2024!',  status: 'ໃຊ້ງານ', recordedBy: adminId, updatedAt: now }
  ]);
  Logger.log(JSON.stringify(result));
}

// ====================================================
// Seed work records — requires Employees to exist first
// ====================================================
function runSeedWorkRecords() {
  var employees = getEmployeesTable().findAll();
  if (!employees.success || !employees.data.length) { Logger.log('Employees not found'); return; }

  var emp = employees.data;
  var e0 = emp[0];
  var e1 = emp[1] || emp[0];

  var result = getWorkRecordsTable().insertMany([
    { date: '2024-06-01', staffId: e0.id, departmentId: e0.departmentId, location: 'ຫ້ອງ IT',      workType: 'ສ້ອມແປງ',     description: 'ສ້ອມແປງ Dell Laptop IT-001 ໄດ',        status: 'ສຳເລັດ' },
    { date: '2024-06-03', staffId: e0.id, departmentId: e0.departmentId, location: 'ຫ້ອງ Lab 1',  workType: 'ຕິດຕັ້ງ',     description: 'ຕິດຕັ້ງ Windows 11 ແລະ ໂປຣແກຣມ Office', status: 'ສຳເລັດ' },
    { date: '2024-06-05', staffId: e1.id, departmentId: e1.departmentId, location: 'ຫ້ອງ ADM',    workType: 'ສະໜັບສະໜູນ', description: 'ຊ່ວຍເຫຼືອການໃຊ້ MS Office 365',         status: 'ສຳເລັດ' },
    { date: '2024-06-10', staffId: e0.id, departmentId: e0.departmentId, location: 'ຫ້ອງ Server', workType: 'ຕິດຕັ້ງ',     description: 'ຕິດຕັ້ງ Cisco Switch ໃໝ່ 24-port',       status: 'ສຳເລັດ' },
    { date: '2024-06-12', staffId: e1.id, departmentId: e1.departmentId, location: 'ຫ້ອງ Lab 1', workType: 'ສ້ອມແປງ',     description: 'ກວດສອບ ແລະ ທຳຄວາມສະອາດ Printer HP',    status: 'ຍັງຄ້າງ' }
  ]);
  Logger.log(JSON.stringify(result));
}
