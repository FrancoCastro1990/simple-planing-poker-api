-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(6) PRIMARY KEY,
    title VARCHAR(100),
    max_users INTEGER NOT NULL DEFAULT 20,
    total_score DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_rooms_updated_at ON rooms(updated_at);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms(created_at);