CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL
);

ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'admin';


INSERT INTO users (name, email, password, role)
VALUES (
    'name:damian',
    'email:damian@gmail.com',
    'password:12345678',
    'role:guide'
  );