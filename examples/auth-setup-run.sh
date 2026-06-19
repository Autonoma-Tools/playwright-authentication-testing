#!/usr/bin/env bash
# Run the auth setup project to generate .auth/user.json,
# then run the full test suite which reuses that state.
#
# Usage: bash examples/auth-setup-run.sh

set -euo pipefail

export BASE_URL="${BASE_URL:-http://localhost:3000}"
export TEST_EMAIL="${TEST_EMAIL:-test@example.com}"
export TEST_PASSWORD="${TEST_PASSWORD:-password}"

echo "==> Installing browsers (skip if already installed)"
npx playwright install chromium

echo "==> Running setup project to capture auth state"
npx playwright test --project=setup

echo "==> Running full suite with reused auth state"
npx playwright test

echo "Done. HTML report available in: playwright-report/"
