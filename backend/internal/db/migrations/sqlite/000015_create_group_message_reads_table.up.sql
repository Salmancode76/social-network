CREATE TABLE IF NOT EXISTS group_message_reads (
    message_id INTEGER,
    user_id INTEGER,
    is_read INTEGER DEFAULT 0,
    read_at TEXT,
    PRIMARY KEY (message_id, user_id),
    FOREIGN KEY (message_id) REFERENCES group_messages(message_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (is_read IN (0, 1))
);

CREATE INDEX IF NOT EXISTS idx_group_message_reads_user_unread ON group_message_reads(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_group_message_reads_message_id ON group_message_reads(message_id);
