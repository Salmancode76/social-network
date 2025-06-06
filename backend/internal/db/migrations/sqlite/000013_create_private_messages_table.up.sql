CREATE TABLE IF NOT EXISTS private_messages (
    message_id INTEGER PRIMARY KEY,
    recipient_id INTEGER NOT NULL,
    is_read INTEGER DEFAULT 0,
    read_at TEXT,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (is_read IN (0, 1))
);

CREATE INDEX IF NOT EXISTS idx_private_messages_recipient ON private_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_read ON private_messages(is_read);
