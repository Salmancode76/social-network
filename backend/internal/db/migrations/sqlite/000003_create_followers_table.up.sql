CREATE TABLE IF NOT EXISTS followers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    request_status_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (request_status_id) REFERENCES request_status(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_id ON followers(following_id);
CREATE INDEX IF NOT EXISTS idx_followers_request_status ON followers(request_status_id);
CREATE INDEX IF NOT EXISTS idx_followers_status_following ON followers(request_status_id, following_id);
