CREATE TABLE IF NOT EXISTS group_messages (
    message_id INTEGER PRIMARY KEY,
    group_id INTEGER NOT NULL,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
