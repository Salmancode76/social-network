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
/*
INSERT INTO users (
                      email,
                      password_hash,
                      first_name,
                      last_name,
                      date_of_birth,
                      avatar,
                      nickname,
                      about_me,
                      is_public,
                      created_at
                  )
                  VALUES (
                      'tester@gmail.com',
                      'password_hash',
                      'tester',
                      '123',
                      '12/4/2003',
                      'avatar',
                      'tester123',
                      'hello',
                      '1',
                      'created_at'
                  );
