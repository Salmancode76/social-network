CREATE TABLE IF NOT EXISTS privacy_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    privacy_type TEXT UNIQUE NOT NULL
);

INSERT OR IGNORE INTO privacy_status (privacy_type) VALUES 
    ('public'), ('almost_private'), ('private');
