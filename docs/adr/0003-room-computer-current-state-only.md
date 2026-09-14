# `RoomComputer` tracks current placement only, in its own sheet

**Status:** accepted

`RoomComputer` records which `Room` each computer-type `Equipment` currently sits in. We chose a dedicated `RoomComputers` sheet (one row per computer, keyed by `equipmentId`) over adding a `roomId` column directly to `Equipment`, and chose to store only the current assignment rather than a move history with start/end dates — the college only ever asks "where is this computer now," not "where has it been." As a consequence, `Room.computerCount` (previously a manually-typed number) becomes a derived count of `RoomComputer` rows per room, since accurate data now exists to compute it.

To keep this from silently drifting out of sync with `Equipment`, the assignment is cleared automatically when a computer's `status` becomes `ຖືກເບີກ`/`ປົດລຶບ` or its `type` changes away from `ຄອມ`, and cascade-deleted when its `Room` is deleted — matching the rest of the codebase's existing pattern of not blocking deletes on dependent data.

**Consequences:** if the college later needs a move history (audit trail of which rooms a computer has occupied over time), this will require introducing start/end dates on `RoomComputer` or a separate log table — a real schema change, not a config toggle.
