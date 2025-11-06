#!/bin/bash

# Test Report Generator Script
# Runs all tests (Vitest, Playwright, Cucumber) and generates a comprehensive report

set -e

echo "🧪 Starting comprehensive test execution..."
echo "==========================================="

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Create reports directory
mkdir -p test-reports

# Export environment info
export TEST_ENV="${TEST_ENV:-local}"
export TRIGGERED_BY="${TRIGGERED_BY:-manual run}"

# Track test results
VITEST_EXIT=0
PLAYWRIGHT_EXIT=0
CUCUMBER_EXIT=0

echo ""
echo "📝 Running Unit Tests (Vitest)..."
echo "-----------------------------------"
if npm run test:run 2>&1 | tee -a test-reports/vitest.log; then
  echo "✅ Vitest passed"
else
  VITEST_EXIT=$?
  echo "⚠️  Vitest failed with exit code $VITEST_EXIT"
fi

echo ""
echo "📝 Running Cucumber E2E Tests..."
echo "-----------------------------------"
if npm run test:e2e 2>&1 | tee -a test-reports/cucumber.log; then
  echo "✅ Cucumber passed"
else
  CUCUMBER_EXIT=$?
  echo "⚠️  Cucumber failed with exit code $CUCUMBER_EXIT"
fi

echo ""
echo "📝 Running Playwright E2E Tests..."
echo "-----------------------------------"
if npm run test:pom:run 2>&1 | tee -a test-reports/playwright.log; then
  echo "✅ Playwright passed"
else
  PLAYWRIGHT_EXIT=$?
  echo "⚠️  Playwright failed with exit code $PLAYWRIGHT_EXIT"
fi

echo ""
echo "📊 Generating Test Report..."
echo "-----------------------------------"

# Build the test report generator if needed
if [ ! -d "dist-scripts" ]; then
  npx tsx scripts/test-report-generator.ts
else
  node dist-scripts/test-report-generator.js
fi

echo ""
echo "✅ Test execution complete!"
echo "📄 Reports available in: test-reports/"
echo ""

# Exit with failure if any test suite failed
if [ $VITEST_EXIT -ne 0 ] || [ $PLAYWRIGHT_EXIT -ne 0 ] || [ $CUCUMBER_EXIT -ne 0 ]; then
  echo "❌ Some tests failed. Please review the report."
  exit 1
fi

echo "🎉 All tests passed!"
exit 0
