#!/bin/bash
# Quick Start Guide for Running Automated Tests
# Usage: ./run-tests.sh [option]

set -e

echo "🧪 Kainos Job Application Portal - E2E Test Suite"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
check_prerequisites() {
  echo "${BLUE}📋 Checking prerequisites...${NC}"
  
  # Check Node.js
  if ! command -v node &> /dev/null; then
    echo "${RED}❌ Node.js not found. Please install Node.js >= 18.0.0${NC}"
    exit 1
  fi
  
  NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VERSION" -lt 18 ]; then
    echo "${RED}❌ Node.js version must be >= 18.0.0 (current: $(node -v))${NC}"
    exit 1
  fi
  
  echo "${GREEN}✅ Node.js $(node -v)${NC}"
  
  # Check npm
  if ! command -v npm &> /dev/null; then
    echo "${RED}❌ npm not found. Please install npm${NC}"
    exit 1
  fi
  
  echo "${GREEN}✅ npm $(npm -v)${NC}"
  
  # Check if we're in the frontend directory
  if [ ! -f "package.json" ]; then
    echo "${RED}❌ Not in project root. Please run from team3-job-app-frontend directory${NC}"
    exit 1
  fi
  
  echo "${GREEN}✅ In correct directory${NC}"
  echo ""
}

# Install dependencies
install_dependencies() {
  echo "${BLUE}📦 Installing dependencies...${NC}"
  npm install
  echo "${GREEN}✅ Dependencies installed${NC}"
  echo ""
}

# Install Playwright browsers
install_browsers() {
  echo "${BLUE}🌐 Installing Playwright browsers...${NC}"
  npx playwright install
  echo "${GREEN}✅ Browsers installed${NC}"
  echo ""
}

# Check if servers are running
check_servers() {
  echo "${BLUE}🔍 Checking if servers are running...${NC}"
  
  # Check frontend
  if ! curl -s http://localhost:3000 > /dev/null; then
    echo "${YELLOW}⚠️  Frontend not running on http://localhost:3000${NC}"
    echo "${YELLOW}   Please start it with: npm run dev${NC}"
    echo ""
  else
    echo "${GREEN}✅ Frontend running on http://localhost:3000${NC}"
  fi
  
  # Check backend
  if ! curl -s http://localhost:3001/health > /dev/null; then
    echo "${YELLOW}⚠️  Backend not running on http://localhost:3001${NC}"
    echo "${YELLOW}   Please start it in another terminal${NC}"
    echo ""
  else
    echo "${GREEN}✅ Backend running on http://localhost:3001${NC}"
  fi
  
  echo ""
}

# Run tests
run_tests() {
  local test_file=$1
  local mode=$2
  
  echo "${BLUE}▶️  Running tests...${NC}"
  echo ""
  
  case "$mode" in
    "debug")
      echo "Running in debug mode..."
      npx playwright test "$test_file" --debug
      ;;
    "ui")
      echo "Running in UI mode (interactive)..."
      npx playwright test "$test_file" --ui
      ;;
    "headed")
      echo "Running in headed mode (visible browser)..."
      npx playwright test "$test_file" --headed
      ;;
    "report")
      echo "Running and generating report..."
      npx playwright test "$test_file"
      echo ""
      echo "${BLUE}📊 Opening HTML report...${NC}"
      npx playwright show-report
      ;;
    *)
      echo "Running tests..."
      npx playwright test "$test_file"
      ;;
  esac
  
  echo ""
  echo "${GREEN}✅ Tests completed${NC}"
  echo ""
}

# Display usage
show_usage() {
  cat << EOF
${BLUE}Usage:${NC}
  ./run-tests.sh [option] [mode]

${BLUE}Options:${NC}
  setup           Setup environment (install deps, browsers)
  run             Run all E2E tests
  run:app         Run application form tests (Flow 16)
  run:auth        Run authentication tests
  run:jobs        Run job listings tests
  run:home        Run homepage tests
  check           Check prerequisites and server status
  clean           Clean test artifacts
  help            Show this help message

${BLUE}Modes (can be combined with run commands):${NC}
  --debug         Run in debug mode (step through tests)
  --ui            Run in UI mode (interactive test explorer)
  --headed        Run in headed mode (see browser)
  --report        Run and open HTML report

${BLUE}Examples:${NC}
  ./run-tests.sh setup                    # First time setup
  ./run-tests.sh run:app                  # Run application form tests
  ./run-tests.sh run:app --debug          # Debug application form tests
  ./run-tests.sh run:app --headed         # Run with visible browser
  ./run-tests.sh run --report             # Run all tests and open report
  ./run-tests.sh check                    # Verify setup

${BLUE}Quick Start:${NC}
  1. ./run-tests.sh setup                 # One-time setup
  2. npm run dev                          # Terminal 1: Start frontend
  3. cd ../team3-job-app-backend && npm run dev  # Terminal 2: Start backend
  4. ./run-tests.sh run:app               # Terminal 3: Run tests

EOF
}

# Main script logic
case "${1:-help}" in
  "setup")
    check_prerequisites
    install_dependencies
    install_browsers
    echo "${GREEN}✅ Setup complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start frontend: npm run dev"
    echo "2. Start backend: cd ../team3-job-app-backend && npm run dev"
    echo "3. Run tests: ./run-tests.sh run"
    ;;
  
  "run")
    check_prerequisites
    check_servers
    run_tests "tests/**/*.spec.ts" "${2:-}"
    ;;
  
  "run:app")
    check_prerequisites
    check_servers
    run_tests "tests/application-form.spec.ts" "${2:-}"
    ;;
  
  "run:auth")
    check_prerequisites
    check_servers
    run_tests "tests/auth.setup.ts" "${2:-}"
    ;;
  
  "run:jobs")
    check_prerequisites
    check_servers
    run_tests "tests/job-listings.spec.ts" "${2:-}"
    ;;
  
  "run:home")
    check_prerequisites
    check_servers
    run_tests "tests/homepage.spec.ts" "${2:-}"
    ;;
  
  "check")
    check_prerequisites
    check_servers
    echo "${GREEN}✅ All checks passed!${NC}"
    ;;
  
  "clean")
    echo "${BLUE}🧹 Cleaning test artifacts...${NC}"
    rm -rf test-results/ playwright-report/ .playwright/
    echo "${GREEN}✅ Cleaned${NC}"
    ;;
  
  "help")
    show_usage
    ;;
  
  *)
    echo "${RED}❌ Unknown option: $1${NC}"
    echo ""
    show_usage
    exit 1
    ;;
esac
