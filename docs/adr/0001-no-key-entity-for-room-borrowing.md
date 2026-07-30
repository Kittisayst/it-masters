# No `Key` entity — track `Room` borrowing directly

**Status:** accepted

The initial design for the computer-room key borrowing system proposed a `Key` entity (tied to `Room`) so that individual keys could be tracked separately from rooms. After review, we decided against it: the college does not track individual keys (no serial numbers, no per-key duplicates matter operationally), and every real-world transaction is "an employee borrows access to a room," not "an employee borrows a specific physical key." Modeling `Key` would have added a join with no corresponding business need.

Instead, `RoomBorrowing` references `Room` directly (`employeeId` + `roomId`), enforcing that a room can only be borrowed by one transaction at a time.

**Consequences:** if the college later needs to track multiple physical keys per room (e.g. a backup key issued separately, or per-key loss/replacement history), this will require introducing a `Key` entity and migrating `RoomBorrowing.roomId` references — a real schema change, not a config toggle.
