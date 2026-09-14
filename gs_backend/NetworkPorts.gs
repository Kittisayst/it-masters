// ====================================================
// NetworkPorts handler — port-to-connection mapping on network Equipment
// (type='Network' only). connectsTo is free-text, not a two-sided link.
// See docs/adr/0004-network-port-freetext-not-graph.md.
// ====================================================

function handleNetworkPorts(method, params) {
  var table = getNetworkPortsTable();

  if (method === 'find') {
    var q = table;
    if (params.equipmentId) q = q.where('equipmentId', '=', params.equipmentId);
    return q.orderBy('portNumber', 'ASC').get();
  }

  // ------ GENERATE (create ports up to targetCount; shrink is guarded) ------
  if (method === 'generate') {
    var existing = getNetworkPortsTable().where('equipmentId', '=', params.equipmentId).get();
    if (!existing.success) return existing;

    var targetCount = Number(params.count);
    var currentPorts = existing.data;
    var currentMax = currentPorts.reduce(function(max, p) {
      return Math.max(max, Number(p.portNumber));
    }, 0);

    if (targetCount > currentMax) {
      for (var n = currentMax + 1; n <= targetCount; n++) {
        table.insert({ equipmentId: params.equipmentId, portNumber: n, connectsTo: '', status: 'ວ່າງ' });
      }
      return { success: true, data: { added: targetCount - currentMax } };
    }

    if (targetCount < currentMax) {
      var toRemove = currentPorts.filter(function(p) { return Number(p.portNumber) > targetCount; });
      var blocked = toRemove.some(function(p) { return p.connectsTo && p.connectsTo.length > 0; });
      if (blocked) {
        return { success: false, error: 'ບໍ່ສາມາດຫຼຸດຈຳນວນ port ໄດ້ — ມີ port ທີ່ຍັງບັນທຶກ connectsTo ຢູ່' };
      }
      toRemove.forEach(function(p) { table.delete(p.id); });
      return { success: true, data: { removed: toRemove.length } };
    }

    return { success: true, data: { added: 0 } };
  }

  // ------ UPDATE (connectsTo / status of one port) ------
  if (method === 'update') {
    return table.update(params.id, params.data);
  }

  return { success: false, error: 'Unknown networkPorts method: ' + method };
}

// Used by equipment.gs when a Network equipment is deleted.
function deleteNetworkPortsByEquipmentId(equipmentId) {
  var existing = getNetworkPortsTable().where('equipmentId', '=', equipmentId).get();
  if (!existing.success) return;
  var table = getNetworkPortsTable();
  existing.data.forEach(function(p) { table.delete(p.id); });
}
