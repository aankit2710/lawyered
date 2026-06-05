-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Wills
CREATE TABLE wills (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    testator_name VARCHAR(255),
    testator_age INT,
    testator_address TEXT,
    sound_mind BOOLEAN,
    revocation_clause TEXT,
    completion_percentage INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE beneficiaries (
    id UUID PRIMARY KEY,
    will_id UUID REFERENCES wills(id),
    name VARCHAR(255),
    relationship VARCHAR(100),
    age INT
);

CREATE TABLE assets (
    id UUID PRIMARY KEY,
    will_id UUID REFERENCES wills(id),
    asset_type VARCHAR(100),
    asset_name VARCHAR(255),
    estimated_value NUMERIC,
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE asset_allocations (
    id UUID PRIMARY KEY,
    asset_id UUID REFERENCES assets(id),
    beneficiary_id UUID REFERENCES beneficiaries(id),
    percentage NUMERIC(5,2) NOT NULL
);

CREATE TABLE executors (
    id UUID PRIMARY KEY,
    will_id UUID REFERENCES wills(id),
    name VARCHAR(255),
    relationship VARCHAR(100),
    contact_number VARCHAR(30)
);

CREATE TABLE guardians (
    id UUID PRIMARY KEY,
    will_id UUID REFERENCES wills(id),
    name VARCHAR(255),
    relationship VARCHAR(100)
);

CREATE TABLE witnesses (
    id UUID PRIMARY KEY,
    will_id UUID REFERENCES wills(id),
    name VARCHAR(255),
    address TEXT
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY,
    will_id UUID REFERENCES wills(id),
    role VARCHAR(20),
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE will_snapshots (
    id UUID PRIMARY KEY,
    will_id UUID REFERENCES wills(id),
    snapshot JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);