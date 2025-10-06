#!/bin/bash
# Local E2E Test Runner
# This script builds and runs Redmine in Docker, then executes the e2e tests

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Configuration
CONTAINER_NAME="redmine-test"
REDMINE_PORT="${REDMINE_PORT:-3000}"
API_TOKEN="${REDMINE_API_KEY:-test_api_token_12345678901234567890}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

cleanup() {
    log_info "Cleaning up..."
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker rm "$CONTAINER_NAME" 2>/dev/null || true
}

# Set up trap to cleanup on exit
trap cleanup EXIT

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    log_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Clean up any existing container
cleanup

# Build Docker image
log_info "Building Redmine Docker image..."
cd "$SCRIPT_DIR/fixtures"
docker build -t redmine-test:latest .
cd "$PROJECT_ROOT"

# Start container
log_info "Starting Redmine container on port $REDMINE_PORT..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -p "$REDMINE_PORT:3000" \
  -e REDMINE_TEST_API_TOKEN="$API_TOKEN" \
  redmine-test:latest

log_info "Container started with ID: $(docker ps -q -f name=$CONTAINER_NAME)"

# Wait for initialization
log_info "Waiting for Redmine to initialize (this may take 60-90 seconds)..."
timeout=120
elapsed=0
interval=5

while [ $elapsed -lt $timeout ]; do
  if docker logs "$CONTAINER_NAME" 2>&1 | grep -q "Database seeding completed"; then
    log_info "Redmine is ready!"
    break
  fi
  
  echo -n "."
  sleep $interval
  elapsed=$((elapsed + interval))
done

echo ""

if [ $elapsed -ge $timeout ]; then
  log_error "Timeout waiting for Redmine to initialize"
  log_error "Docker logs:"
  docker logs "$CONTAINER_NAME"
  exit 1
fi

# Give it a few more seconds to fully start
sleep 10

# Show container status
log_info "Container status:"
docker ps -f name="$CONTAINER_NAME"

# Run tests
log_info "Running E2E tests..."
export REDMINE_URL="http://localhost:$REDMINE_PORT"
export REDMINE_API_KEY="$API_TOKEN"

if npm test; then
    log_info "✓ All tests passed!"
    exit 0
else
    log_error "✗ Tests failed"
    log_error "Docker logs:"
    docker logs "$CONTAINER_NAME"
    exit 1
fi
