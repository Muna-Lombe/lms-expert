# Integration tests

Integration tests exercise the full pipeline end-to-end:

- **Real adapter + real WebSocketClient in dry-run mode**: domain object → adapter payload mapping → envelope → client send → mock response → domain mapping back.
- **Real use cases with real adapter**: importBook, exportBook, createLesson, createExercise through the actual ProgressMeAdapter (dry-run).
- **WebSocketClient internals**: response correlation, message routing, connection lifecycle.

These tests do NOT require a real WebSocket connection or the `ws` package — they use dry-run mode exclusively. When real-mode testing is needed, install `ws` and add tests that spin up a mock WebSocket server.
