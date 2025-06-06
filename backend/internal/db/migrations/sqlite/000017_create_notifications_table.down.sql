DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_is_read;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_type_id;
DROP INDEX IF EXISTS idx_notifications_related_user;
DROP INDEX IF EXISTS idx_notifications_related_group;
DROP INDEX IF EXISTS idx_notifications_related_event;
DROP TABLE IF EXISTS notifications;
