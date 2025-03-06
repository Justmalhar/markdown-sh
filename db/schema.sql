CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0
);

-- Index for faster lookups by key
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);

-- Index for faster lookups by email
CREATE INDEX IF NOT EXISTS idx_api_keys_email ON api_keys(email); 