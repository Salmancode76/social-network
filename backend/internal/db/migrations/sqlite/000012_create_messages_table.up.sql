CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (message_type IN ('text', 'image', 'emoji'))
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
