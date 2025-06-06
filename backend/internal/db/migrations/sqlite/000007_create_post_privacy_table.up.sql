CREATE TABLE IF NOT EXISTS post_privacy (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_privacy_post_id ON post_privacy(post_id);
CREATE INDEX IF NOT EXISTS idx_post_privacy_user_id ON post_privacy(user_id);
