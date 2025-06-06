CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    image_path TEXT,
    privacy_type_id INTEGER DEFAULT 1,
    group_id INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (privacy_type_id) REFERENCES privacy_status(id) ON DELETE RESTRICT,
    CHECK (privacy_type_id IN (1, 2, 3)),
    CHECK ((group_id IS NULL AND privacy_type_id IS NOT NULL) OR (group_id IS NOT NULL AND privacy_type_id = 1))
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_group_id ON posts(group_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_privacy_type ON posts(privacy_type_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_privacy ON posts(user_id, privacy_type_id);
