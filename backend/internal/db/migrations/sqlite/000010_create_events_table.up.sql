CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    creator_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_datetime TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_events_group_id ON events(group_id);
CREATE INDEX IF NOT EXISTS idx_events_creator_id ON events(creator_id);
