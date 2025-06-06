#!/bin/bash

# Split the complete database schema into proper migration files
# Run this from the backend directory

MIGRATIONS_DIR="pkg/db/migrations/sqlite"

echo "Creating all migration files from the complete schema..."

# 1. Users table
cat > "$MIGRATIONS_DIR/000001_create_users_table.up.sql" << 'EOF'
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    avatar TEXT,
    nickname TEXT,
    about_me TEXT,
    is_public INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    CHECK (is_public IN (0, 1))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
EOF

cat > "$MIGRATIONS_DIR/000001_create_users_table.down.sql" << 'EOF'
DROP INDEX IF EXISTS idx_users_email;
DROP TABLE IF EXISTS users;
EOF

# 2. Request Status table
cat > "$MIGRATIONS_DIR/000002_create_request_status_table.up.sql" << 'EOF'
CREATE TABLE IF NOT EXISTS request_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT UNIQUE NOT NULL
);

INSERT OR IGNORE INTO request_status (status) VALUES 
    ('pending'), ('accepted'), ('declined'), ('blocked');
EOF

cat > "$MIGRATIONS_DIR/000002_create_request_status_table.down.sql" << 'EOF'
DROP TABLE IF EXISTS request_status;
EOF

# 3. Followers table
cat > "$MIGRATIONS_DIR/000003_create_followers_table.up.sql" << 'EOF'
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
EOF

cat > "$MIGRATIONS_DIR/000003_create_followers_table.down.sql" << 'EOF'
DROP INDEX IF EXISTS idx_followers_follower_id;
DROP INDEX IF EXISTS idx_followers_following_id;
DROP INDEX IF EXISTS idx_followers_request_status;
DROP INDEX IF EXISTS idx_followers_status_following;
DROP TABLE IF EXISTS followers;
EOF

# 4. Privacy Status table
cat > "$MIGRATIONS_DIR/000004_create_privacy_status_table.up.sql" << 'EOF'
CREATE TABLE IF NOT EXISTS privacy_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    privacy_type TEXT UNIQUE NOT NULL
);

INSERT OR IGNORE INTO privacy_status (privacy_type) VALUES 
    ('public'), ('almost_private'), ('private');
EOF

cat > "$MIGRATIONS_DIR/000004_create_privacy_status_table.down.sql" << 'EOF'
DROP TABLE IF EXISTS privacy_status;
EOF

# 5. Groups table
cat > "$MIGRATIONS_DIR/000005_create_groups_table.up.sql" << 'EOF'
CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    creator_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_groups_creator_id ON groups(creator_id);
EOF

cat > "$MIGRATIONS_DIR/000005_create_groups_table.down.sql" << 'EOF'
DROP INDEX IF EXISTS idx_groups_creator_id;
DROP TABLE IF EXISTS groups;
EOF

# 6. Posts table
cat > "$MIGRATIONS_DIR/000006_create_posts_table.up.sql" << 'EOF'
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
EOF

cat > "$MIGRATIONS_DIR/000006_create_posts_table.down.sql" << 'EOF'
DROP INDEX IF EXISTS idx_posts_user_id;
DROP INDEX IF EXISTS idx_posts_group_id;
DROP INDEX IF EXISTS idx_posts_created_at;
DROP INDEX IF EXISTS idx_posts_privacy_type;
DROP INDEX IF EXISTS idx_posts_user_privacy;
DROP TABLE IF EXISTS posts;
EOF

# 7. Post Privacy table
cat > "$MIGRATIONS_DIR/000007_create_post_privacy_table.up.sql" << 'EOF'
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
EOF

cat > "$MIGRATIONS_DIR/000007_create_post_privacy_table.down.sql" << 'EOF'
DROP INDEX IF EXISTS idx_post_privacy_post_id;
DROP INDEX IF EXISTS idx_post_privacy_user_id;
DROP TABLE IF EXISTS post_privacy;
EOF

# 8. Comments table
cat > "$MIGRATIONS_DIR/000008_create_comments_table.up.sql" << 'EOF'
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
EOF

cat > "$MIGRATIONS_DIR/000008_create_comments_table.down.sql" << 'EOF'
DROP INDEX IF EXISTS idx_comments_post_id;
DROP INDEX IF EXISTS idx_comments_user_id;
DROP TABLE IF EXISTS comments;
EOF

# 9. Group Members table
cat > "$MIGRATIONS_DIR/000009_create_group_members_table.up.sql" << 'EOF'
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
EOF

cat > "$MIGRATIONS_DIR/000009_create_group_members_table.down.sql" << 'EOF'
DROP INDEX IF EXISTS idx_group_members_group_id;
DROP INDEX IF EXISTS idx_group_members_user_id;
DROP INDEX IF EXISTS idx_group_members_status;
DROP INDEX IF EXISTS idx_group_members_status_group;
DROP TABLE IF EXISTS group_members;
EOF

# 10. Events table
cat > "$MIGRATIONS_DIR/000010_create_events_table.up.sql" << 'EOF'
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    creator_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_datetime TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_events_group_id ON events(group_id);
CREATE INDEX IF NOT EXISTS idx_events_creator_id ON events(creator_id);
EOF

cat > "$MIGRATIONS_DIR/000010_create_events_table.down.sql" << 'EOF'
DROP INDEX IF EXISTS idx_events_group_id;
DROP INDEX IF EXISTS idx_events_creator_id;
DROP TABLE IF EXISTS events;
EOF

# 11. Event Responses table
cat > "$MIGRATIONS_DIR/000011_create_event_responses_table.up.sql" << 'EOF'
CREATE TABLE IF NOT EXISTS event_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    is_going INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(event_id, user_id),
    CHECK (is_going IN (0, 1, NULL))
);

CREATE INDEX IF NOT EXISTS idx_event_responses_event_id ON event_responses(event_id);
CREATE INDEX IF NOT EXISTS idx_event_responses_user_id ON event_responses(user_id);
EOF

cat > "$MIGRATIONS_DIR/000011_create_event_responses_table.down.sql" << 'EOF'
DROP INDEX IF EXISTS idx_event_responses_event_id;
DROP INDEX IF EXISTS idx_event_responses_user_id;
DROP TABLE IF EXISTS event_responses;
EOF

# 12. Messages table
cat > "$MIGRATIONS_DIR/000012_create_messages_table.up.sql" << 'EOF'
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
EOF

cat > "$MIGRATIONS_DIR/000012_create_messages_table.down.sql" << 'EOF'
DROP INDEX IF EXISTS idx_messages_sender_id;
DROP INDEX IF EXISTS idx_messages_created_at;
DROP TABLE IF EXISTS messages;
EOF

# 13. Private Messages table
cat > "$MIGRATIONS_DIR/000013_create_private_messages_table.up.sql" << 'EOF'
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
EOF

cat > "$MIGRATIONS_DIR/000013_create_private_messages_table.down.sql" << 'EOF'
DROP INDEX IF EXISTS idx_private_messages_recipient;
DROP INDEX IF EXISTS idx_private_messages_read;
DROP TABLE IF EXISTS private_messages;
EOF

# 14. Group Messages table
cat > "$MIGRATIONS_DIR/000014_create_group_messages_table.up.sql" << 'EOF'
CREATE TABLE IF NOT EXISTS group_messages (
    message_id INTEGER PRIMARY KEY,
    group_id INTEGER NOT NULL,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
EOF

cat > "$MIGRATIONS_DIR/000014_create_group_messages_table.down.sql" << 'EOF'
DROP INDEX IF EXISTS idx_group_messages_group_id;
DROP TABLE IF EXISTS group_messages;
EOF

# 15. Group Message Reads table
cat > "$MIGRATIONS_DIR/000015_create_group_message_reads_table.up.sql" << 'EOF'
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
EOF

cat > "$MIGRATIONS_DIR/000015_create_group_message_reads_table.down.sql" << 'EOF'
DROP INDEX IF EXISTS idx_group_message_reads_user_unread;
DROP INDEX IF EXISTS idx_group_message_reads_message_id;
DROP TABLE IF EXISTS group_message_reads;
EOF

# 16. Notification Types table
cat > "$MIGRATIONS_DIR/000016_create_notification_types_table.up.sql" << 'EOF'
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
EOF

cat > "$MIGRATIONS_DIR/000016_create_notification_types_table.down.sql" << 'EOF'
DROP INDEX IF EXISTS idx_notification_types_type;
DROP TABLE IF EXISTS notification_types;
EOF

# 17. Notifications table
cat > "$MIGRATIONS_DIR/000017_create_notifications_table.up.sql" << 'EOF'
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
EOF

cat > "$MIGRATIONS_DIR/000017_create_notifications_table.down.sql" << 'EOF'
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_is_read;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_type_id;
DROP INDEX IF EXISTS idx_notifications_related_user;
DROP INDEX IF EXISTS idx_notifications_related_group;
DROP INDEX IF EXISTS idx_notifications_related_event;
DROP TABLE IF EXISTS notifications;
EOF

echo "✅ All migration files populated successfully!"
echo ""
echo "Created 17 migrations with proper UP and DOWN scripts:"
echo "📁 pkg/db/migrations/sqlite/"
ls -la "$MIGRATIONS_DIR/" | grep -E "\.sql$" | wc -l | xargs echo "Total files:"

echo ""
echo "🧪 Test your migrations:"
echo "migrate -path $MIGRATIONS_DIR -database 'sqlite3://test.db' up"
echo ""
echo "🔄 To rollback:"
echo "migrate -path $MIGRATIONS_DIR -database 'sqlite3://test.db' down"