CREATE TABLE IF NOT EXISTS group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    request_status_id INTEGER NOT NULL,
    invited_by INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (request_status_id) REFERENCES request_status(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_status ON group_members(request_status_id);
CREATE INDEX IF NOT EXISTS idx_group_members_status_group ON group_members(request_status_id, group_id);
