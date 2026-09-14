# `NetworkPort.connectsTo` is free-text, not a two-sided port link

**Status:** accepted

The obvious "correct" model for documenting network cabling is a graph: each port links to the specific port on the specific device at the other end of the cable, letting the system trace a full path (e.g. AP → switch port 5 → router port 2 → ISP). We chose not to build that. `NetworkPort.connectsTo` is a single free-text field on the port describing where the cable goes, with no reference to a port record on the far end.

The reasoning: the actual need is a field technician standing at a switch, scanning its QR code, and reading "port 5 → ຫ້ອງ A101" or "port 12 → Router ຫຼັກ" — not a topology query. A two-sided graph would require keeping both ends in sync on every cabling change (rewire one side, remember to update the other) for a benefit — full path tracing — nobody asked for. `Equipment` type `'Network'` lumps switches, routers, and access points into one category rather than distinct sub-types, which would make a real graph model (walking from a specific router port to a specific switch port) awkward to build cleanly anyway.

**Consequences:** if a future need requires tracing a signal path across multiple devices (e.g. "what's the full route from this AP back to the core switch"), `connectsTo` free text can't answer that reliably — it would require migrating to a real port-to-port link model, a schema change, not a config toggle.
