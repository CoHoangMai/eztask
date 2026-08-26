-- Initial schema for Identity Service (PostgreSQL)
-- Database: identity_db

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (name) VALUES 
    ('ROLE_USER'), 
    ('ROLE_ADMIN'), 
    ('ROLE_MANAGER')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    title_role VARCHAR(100) DEFAULT 'Software Engineer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Seed initial default users (Password hash is BCrypt for 'password123')
INSERT INTO users (id, name, email, password_hash, avatar_url, title_role) VALUES
    (1, 'Alex Morgan', 'alex.morgan@eztask.dev', '$2a$12$j.gkwKDK/Id4KynxQmW9Ie3jXX/LVgHirJUYP5fDVtVNht7oNVMfK', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Lead Architect'),
    (2, 'Sarah Chen', 'sarah.chen@eztask.dev', '$2a$12$j.gkwKDK/Id4KynxQmW9Ie3jXX/LVgHirJUYP5fDVtVNht7oNVMfK', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', 'Frontend Engineer'),
    (3, 'David Kim', 'david.kim@eztask.dev', '$2a$12$j.gkwKDK/Id4KynxQmW9Ie3jXX/LVgHirJUYP5fDVtVNht7oNVMfK', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'Backend Engineer'),
    (4, 'Elena Rostova', 'elena.rostova@eztask.dev', '$2a$12$j.gkwKDK/Id4KynxQmW9Ie3jXX/LVgHirJUYP5fDVtVNht7oNVMfK', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', 'DevOps & Cloud Lead')
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role_id) VALUES
    (1, 2), -- Alex: ROLE_ADMIN
    (2, 1), -- Sarah: ROLE_USER
    (3, 1), -- David: ROLE_USER
    (4, 3)  -- Elena: ROLE_MANAGER
ON CONFLICT DO NOTHING;

-- Reset identity sequence counters so new user registrations don't collide with seeded IDs
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('roles_id_seq', (SELECT COALESCE(MAX(id), 1) FROM roles));

