CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS forms (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    embedding vector(768) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'guest'))
);


SELECT * FROM forms;

ALTER TABLE forms ADD COLUMN content TEXT;
