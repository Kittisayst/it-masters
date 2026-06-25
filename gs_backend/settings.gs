// ====================================================
// Settings handlers — Users, Departments, Employees
// ====================================================

function handleUsers(method, params) {
  var table = getUsersTable();

  if (method === 'findAll') return table.findAll();
  if (method === 'findById') return table.findById(params.id);

  if (method === 'insert') {
    var data = params;
    if (data.password) data.password = md5(data.password);
    return table.insert(data);
  }

  if (method === 'update') {
    var data = params.data;
    if (data.password) data.password = md5(data.password);
    return table.update(params.id, data);
  }

  if (method === 'delete') return table.delete(params.id);

  return { success: false, error: 'Unknown users method: ' + method };
}

function handleDepartments(method, params) {
  var table = getDepartmentsTable();

  if (method === 'findAll') return table.findAll();
  if (method === 'findById') return table.findById(params.id);
  if (method === 'insert')   return table.insert(params);
  if (method === 'update')   return table.update(params.id, params.data);
  if (method === 'delete')   return table.delete(params.id);

  return { success: false, error: 'Unknown departments method: ' + method };
}

function handleEmployees(method, params) {
  var table = getEmployeesTable();

  if (method === 'findAll') return table.findAll();
  if (method === 'findById') return table.findById(params.id);
  if (method === 'find')     return table.find(params.query || {});
  if (method === 'insert')   return table.insert(params);
  if (method === 'update')   return table.update(params.id, params.data);
  if (method === 'delete')   return table.delete(params.id);

  return { success: false, error: 'Unknown employees method: ' + method };
}
