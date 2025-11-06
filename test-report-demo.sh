#!/bin/bash

# Test Report System - Quick Demo
# This script demonstrates how to use the test report system

echo "🎬 TEST REPORT SYSTEM - QUICK DEMO"
echo "===================================="
echo ""

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Show available commands
echo "📚 AVAILABLE TEST COMMANDS:"
echo ""
echo "1. Run all tests and generate report:"
echo "   npm run test:all"
echo ""
echo "2. Run individual test suites:"
echo "   npm run test:run           # Vitest unit tests"
echo "   npm run test:e2e           # Cucumber BDD tests"
echo "   npm run test:pom:run       # Playwright UI tests"
echo ""
echo "3. Generate report from existing test artifacts:"
echo "   npm run test:report"
echo ""
echo "4. Run tests with coverage:"
echo "   npm run test:coverage"
echo ""

# Check if test reports directory exists
if [ ! -d "test-reports" ]; then
  echo "⚠️  No test reports directory found yet."
  echo "   Run 'npm run test:all' to generate your first report!"
  echo ""
  exit 0
fi

# List available reports
echo "📊 AVAILABLE REPORTS:"
echo ""

REPORT_COUNT=$(find test-reports -name "test-report-*.html" 2>/dev/null | wc -l)

if [ $REPORT_COUNT -gt 0 ]; then
  echo "HTML Reports:"
  find test-reports -name "test-report-*.html" -type f -exec ls -lh {} \; | awk '{print "   " $9 " (" $5 ")"}'
  echo ""
  
  # Show latest report
  LATEST_REPORT=$(find test-reports -name "test-report-*.html" -type f -printf '%T@ %p\n' | sort -rn | head -1 | cut -d' ' -f2-)
  
  if [ -n "$LATEST_REPORT" ]; then
    echo "💡 TIP: Open the latest report:"
    echo "   open '$LATEST_REPORT'"
    echo ""
  fi
fi

JSON_COUNT=$(find test-reports -name "test-report-*.json" 2>/dev/null | wc -l)
if [ $JSON_COUNT -gt 0 ]; then
  echo "JSON Reports:"
  find test-reports -name "test-report-*.json" -type f -exec ls -lh {} \; | awk '{print "   " $9 " (" $5 ")"}'
  echo ""
fi

CSV_COUNT=$(find test-reports -name "test-results.csv" 2>/dev/null | wc -l)
if [ $CSV_COUNT -gt 0 ]; then
  echo "CSV Exports:"
  find test-reports -name "test-results.csv" -type f -exec ls -lh {} \; | awk '{print "   " $9 " (" $5 ")"}'
  echo ""
fi

echo "📖 For more information, see TEST-REPORT-README.md"
