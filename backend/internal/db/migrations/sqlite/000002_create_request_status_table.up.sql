CREATE TABLE IF NOT EXISTS request_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT UNIQUE NOT NULL
);

INSERT OR IGNORE INTO request_status (status) VALUES 
    ('invited'), ('accepted'), ('request'), ('declined'),('creator');
