FROM redmine:5.1-alpine

# Install SQLite3 for database operations
RUN apk add --no-cache sqlite

# Set up SQLite database configuration
ENV REDMINE_DB_ADAPTER=sqlite3
ENV REDMINE_DB_DATABASE=/usr/src/redmine/db/redmine.db

# Create database directory
RUN mkdir -p /usr/src/redmine/db

# Copy seed script
COPY seed-database.sh /docker-entrypoint-seed.sh
RUN chmod +x /docker-entrypoint-seed.sh

# Create a wrapper script to initialize database and seed it
RUN printf '#!/bin/sh\n\
set -e\n\
\n\
# Run original entrypoint to initialize Redmine\n\
/docker-entrypoint.sh rails server -b 0.0.0.0 &\n\
REDMINE_PID=$!\n\
\n\
# Wait for database to be initialized\n\
echo "Waiting for Redmine to initialize database..."\n\
sleep 10\n\
\n\
# Check if database has tables (already initialized)\n\
TABLE_COUNT=$(sqlite3 /usr/src/redmine/db/redmine.db "SELECT COUNT(*) FROM sqlite_master WHERE type='\''table'\'';" 2>/dev/null || echo "0")\n\
\n\
if [ "$TABLE_COUNT" -gt "0" ]; then\n\
  echo "Database already initialized with $TABLE_COUNT tables"\n\
  # Seed the database\n\
  /docker-entrypoint-seed.sh /usr/src/redmine/db/redmine.db "${REDMINE_TEST_API_TOKEN:-test_api_token_12345678901234567890}"\n\
else\n\
  echo "Database not yet initialized, waiting longer..."\n\
  sleep 20\n\
  /docker-entrypoint-seed.sh /usr/src/redmine/db/redmine.db "${REDMINE_TEST_API_TOKEN:-test_api_token_12345678901234567890}"\n\
fi\n\
\n\
# Keep Redmine running\n\
wait $REDMINE_PID\n\
' > /docker-entrypoint-wrapper.sh && chmod +x /docker-entrypoint-wrapper.sh

CMD ["/docker-entrypoint-wrapper.sh"]
