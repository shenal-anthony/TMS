CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

INSERT INTO users (name, email, password) values ('shamal', 'shamal@gmail.com', '12345678');