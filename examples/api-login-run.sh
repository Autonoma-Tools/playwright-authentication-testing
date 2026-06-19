#!/usr/bin/env bash
# Run the API-based auth setup (no browser, faster) then run the suite.
#
# Usage: bash examples/api-login-run.sh

set -euo pipefail

export BASE_URL="${BASE_URL:-http://localhost:3000}"
export TEST_EMAIL="${TEST_EMAIL:-test@example.com}"
export TEST_PASSWORD="${TEST_PASSWORD:-password}"

echo "==> Running API login setup"
TEST_FILE=src/api-login.setup.ts npx playwright test src/api-login.setup.ts --project=setup

echo "==> Running full suite with reused API auth state"
npx playwright test
