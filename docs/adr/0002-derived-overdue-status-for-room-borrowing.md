# Derive `ເກີນກຳນົດ` status at read time, not via a scheduled job

**Status:** accepted

The original `RoomBorrowing.gs` (mirroring the older `Borrowing.gs` pattern) stored `status` as a plain field and relied on a separate `checkOverdue` method to sweep active records and flip them to `ເກີນກຳນົດ`. Nothing ever called that method — no frontend call, no Apps Script time-trigger — so records never actually transitioned to overdue in practice. Its `dueDate < today` check was also a bare string comparison, which would have misfired on records with an empty `dueDate` (`''` sorts before any date string) had it ever run.

Instead of wiring up a time-trigger (which requires manual setup in the Apps Script editor, outside `clasp push`), `findAll`/`find` in `RoomBorrowing.gs` now compute overdue status inline against the current time on every read, skip records with no `dueDate`, and opportunistically write the computed `ເກີນກຳນົດ` status back to the sheet when they detect it (self-healing) — so the sheet stays accurate for anyone viewing it directly, and existing `status`-based filtering keeps working unchanged. The standalone `checkOverdue` method is removed.

**Consequences:** this repo's two borrowing modules (`Borrowing.gs` and `RoomBorrowing.gs`) now use different mechanisms for the same " has this passed its due date" concept — `Borrowing.gs` still has the same dead-trigger problem, but is out of scope for this decision. If it's fixed later, prefer this same derive-on-read approach for consistency rather than reintroducing a time-trigger.
