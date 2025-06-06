CREATE TABLE IF NOT EXISTS notification_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT UNIQUE NOT NULL
);

INSERT OR IGNORE INTO notification_types (type) VALUES 
    ('follow_request'),
    ('group_invitation'), 
    ('group_join_request'),
    ('event_created'),
    ('follow_accepted'),
    ('group_invitation_accepted');

CREATE INDEX IF NOT EXISTS idx_notification_types_type ON notification_types(type);
