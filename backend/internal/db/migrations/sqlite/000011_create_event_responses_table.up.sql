CREATE TABLE IF NOT EXISTS event_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    is_going INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(event_id, user_id),
    CHECK (is_going IN (0, 1, NULL))
);

CREATE INDEX IF NOT EXISTS idx_event_responses_event_id ON event_responses(event_id);
CREATE INDEX IF NOT EXISTS idx_event_responses_user_id ON event_responses(user_id);
