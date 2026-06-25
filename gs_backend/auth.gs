// ====================================================
// Auth handler
// ====================================================

function md5(str) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, str, Utilities.Charset.UTF_8);
  return bytes.map(function(b) {
    var hex = (b < 0 ? b + 256 : b).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function handleAuth(method, params) {
  if (method === 'login') {
    var users = getUsersTable();
    var found = users.find({ username: params.username });
    if (!found.success || found.data.length === 0) {
      return { success: false, error: 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກ' };
    }
    var user = found.data[0];
    var hashed = md5(params.password);
    if (user.password !== hashed) {
      return { success: false, error: 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກ' };
    }
    return {
      success: true,
      data: { id: user.id, username: user.username, fullName: user.fullName, position: user.position }
    };
  }

  if (method === 'changePassword') {
    var users = getUsersTable();
    var found = users.find({ username: params.username });
    if (!found.success || found.data.length === 0) {
      return { success: false, error: 'ບໍ່ພົບຜູ້ໃຊ້' };
    }
    var user = found.data[0];
    if (user.password !== md5(params.oldPassword)) {
      return { success: false, error: 'ລະຫັດຜ່ານເດີມບໍ່ຖືກ' };
    }
    return users.update(user.id, { password: md5(params.newPassword) });
  }

  return { success: false, error: 'Unknown auth method: ' + method };
}
