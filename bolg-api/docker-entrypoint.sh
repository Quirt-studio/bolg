#!/bin/sh
# ============================================
# Docker Entrypoint - Generate config.yaml
# from environment variables, then start the app
# ============================================

set -e

CONFIG_FILE="/app/bolg-api/config/config.yaml"

# Generate JWT secrets if not provided
if [ -z "$JWT_ACCESS_SECRET" ]; then
    JWT_ACCESS_SECRET=$(head -c 32 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 32)
fi
if [ -z "$JWT_REFRESH_SECRET" ]; then
    JWT_REFRESH_SECRET=$(head -c 32 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 32)
fi

cat > "$CONFIG_FILE" << YAMLEOF
server:
  port: ${SERVER_PORT:-8080}
  mode: ${GIN_MODE:-release}

database:
  type: mysql
  host: ${DB_HOST:-mysql}
  port: ${DB_PORT:-3306}
  user: ${DB_USER:-root}
  password: "${DB_PASSWORD:-bolg123}"
  name: ${DB_NAME:-bolg}
  charset: utf8mb4
  max_idle_conns: 10
  max_open_conns: 100

jwt:
  access_secret: "${JWT_ACCESS_SECRET}"
  refresh_secret: "${JWT_REFRESH_SECRET}"
  access_expire: ${JWT_ACCESS_EXPIRE:-3600}
  refresh_expire: ${JWT_REFRESH_EXPIRE:-604800}

storage:
  type: local
  local_path: "./uploads"
  base_url: "/uploads"
  max_file_size: ${MAX_FILE_SIZE:-209715200}
YAMLEOF

echo "Config generated: $CONFIG_FILE"
echo "DB: ${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Wait for MySQL to be ready
echo "Waiting for MySQL..."
until nc -z ${DB_HOST:-mysql} ${DB_PORT:-3306} 2>/dev/null; do
    sleep 2
done
echo "MySQL is ready."

# Run the main command
exec "$@"
