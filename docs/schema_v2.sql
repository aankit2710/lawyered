
-- USERS (Account Owners)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- WILLS
CREATE TABLE wills (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),

    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',

    -- Testator (person creating the will)
    testator_name VARCHAR(255),
    testator_age INT,
    testator_address TEXT,
    sound_mind BOOLEAN DEFAULT TRUE,

    revocation_clause TEXT,

    completion_percentage INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- BENEFICIARIES
CREATE TABLE beneficiaries (
    id UUID PRIMARY KEY,
    will_id UUID NOT NULL REFERENCES wills(id),

    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    age INT,
    address TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

-- ASSETS
CREATE TABLE assets (
    id UUID PRIMARY KEY,
    will_id UUID NOT NULL REFERENCES wills(id),

    asset_type VARCHAR(100) NOT NULL,
    asset_name VARCHAR(255) NOT NULL,

    estimated_value NUMERIC(15,2),
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP DEFAULT NOW()
);

-- ASSET DISTRIBUTION
CREATE TABLE asset_allocations (
    id UUID PRIMARY KEY,

    asset_id UUID NOT NULL REFERENCES assets(id),
    beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id),

    percentage NUMERIC(5,2) NOT NULL,

    created_at TIMESTAMP DEFAULT NOW()
);

-- EXECUTOR
CREATE TABLE executors (
    id UUID PRIMARY KEY,

    will_id UUID NOT NULL REFERENCES wills(id),

    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    contact_number VARCHAR(20),

    created_at TIMESTAMP DEFAULT NOW()
);

-- GUARDIAN
CREATE TABLE guardians (
    id UUID PRIMARY KEY,

    will_id UUID NOT NULL REFERENCES wills(id),

    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),

    created_at TIMESTAMP DEFAULT NOW()
);

-- WITNESSES
CREATE TABLE witnesses (
    id UUID PRIMARY KEY,

    will_id UUID NOT NULL REFERENCES wills(id),

    name VARCHAR(255) NOT NULL,
    address TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

-- CHAT HISTORY
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY,

    will_id UUID NOT NULL REFERENCES wills(id),

    role VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT NOW()
);

-- AI SNAPSHOT MEMORY
CREATE TABLE will_snapshots (
    id UUID PRIMARY KEY,

    will_id UUID NOT NULL REFERENCES wills(id),

    snapshot JSONB NOT NULL,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_wills_user_id ON wills(user_id);
CREATE INDEX idx_assets_will_id ON assets(will_id);
CREATE INDEX idx_beneficiaries_will_id ON beneficiaries(will_id);
CREATE INDEX idx_chat_messages_will_id ON chat_messages(will_id);
