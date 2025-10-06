#!/bin/bash
# Database seeding script for Redmine e2e tests
# This script creates a test user and API token in the Redmine SQLite database

set -e

DB_PATH="${1:-/usr/src/redmine/db/redmine.db}"
API_TOKEN="${2:-test_api_token_12345678901234567890}"

echo "Seeding Redmine database at: $DB_PATH"
echo "Using API token: $API_TOKEN"

# Wait for database to be initialized
echo "Waiting for database file to exist..."
for i in {1..30}; do
  if [ -f "$DB_PATH" ]; then
    echo "Database file found!"
    break
  fi
  echo "Waiting... ($i/30)"
  sleep 1
done

if [ ! -f "$DB_PATH" ]; then
  echo "ERROR: Database file not found at $DB_PATH"
  exit 1
fi

# Insert test user with admin privileges
# Password hash for 'admin123' using bcrypt
# Note: Redmine uses SHA1 for older versions, but modern versions use bcrypt
# We'll use a simple approach with SHA1 for compatibility
echo "Inserting test user..."
sqlite3 "$DB_PATH" <<EOF
-- Insert test user (admin)
INSERT INTO users (
  login, 
  hashed_password, 
  firstname, 
  lastname, 
  admin, 
  status, 
  mail,
  mail_notification,
  language,
  created_on,
  updated_on,
  type
) VALUES (
  'testadmin',
  '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8',  -- SHA1 hash of 'password'
  'Test',
  'Admin',
  1,  -- admin flag
  1,  -- active status
  'testadmin@example.com',
  'all',
  'en',
  datetime('now'),
  datetime('now'),
  'User'
);

-- Get the user ID we just created
-- Insert API token for the test user
INSERT INTO tokens (
  user_id,
  action,
  value,
  created_on,
  updated_on
) VALUES (
  (SELECT id FROM users WHERE login = 'testadmin'),
  'api',
  '$API_TOKEN',
  datetime('now'),
  datetime('now')
);

-- Verify inserts
SELECT 'User created with ID: ' || id FROM users WHERE login = 'testadmin';
SELECT 'API token created: ' || value FROM tokens WHERE value = '$API_TOKEN';
EOF

echo "Database seeding completed successfully!"
echo ""
echo "Test credentials:"
echo "  Login: testadmin"
echo "  Password: password"
echo "  API Token: $API_TOKEN"
