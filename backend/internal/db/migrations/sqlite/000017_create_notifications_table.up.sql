CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    notification_type_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    related_user_id INTEGER,
    related_group_id INTEGER,
    related_event_id INTEGER,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (notification_type_id) REFERENCES notification_types(id) ON DELETE CASCADE,
    FOREIGN KEY (related_event_id) REFERENCES events(id) ON DELETE CASCADE,
    CHECK (is_read IN (0, 1))
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type_id ON notifications(notification_type_id);
CREATE INDEX IF NOT EXISTS idx_notifications_related_user ON notifications(related_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_related_group ON notifications(related_group_id);
CREATE INDEX IF NOT EXISTS idx_notifications_related_event ON notifications(related_event_id);
