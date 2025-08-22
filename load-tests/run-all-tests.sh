#!/bin/bash

# CITZN Platform Load Testing Suite
# Comprehensive performance and stress testing

echo "🚀 CITZN PLATFORM LOAD TESTING SUITE"
echo "===================================="
echo ""

# Set environment variables
export CITZN_URL=${CITZN_URL:-"https://citznvote.netlify.app"}
export NODE_ENV=test

echo "📋 Test Configuration:"
echo "  Target URL: $CITZN_URL"
echo "  Node Version: $(node --version)"
echo "  Timestamp: $(date)"
echo ""

# Change to the frontend directory
cd "$(dirname "$0")/.."

# Ensure performance directory exists
mkdir -p performance

echo "🧪 Starting Load Test Suite..."
echo ""

# Test 1: API Stress Testing
echo "1️⃣  Running API Stress Tests..."
echo "   Testing ZIP verification, bill fetching, concurrent users, memory usage..."
node load-tests/api-stress-test.js
if [ $? -eq 0 ]; then
    echo "   ✅ API stress tests completed successfully"
else
    echo "   ❌ API stress tests failed"
fi
echo ""

# Test 2: Performance Testing
echo "2️⃣  Running Performance Tests..."
echo "   Testing page load times, 3G simulation, offline functionality..."
node load-tests/simple-performance-test.js
if [ $? -eq 0 ]; then
    echo "   ✅ Performance tests completed successfully"
else
    echo "   ❌ Performance tests failed"
fi
echo ""

# Test 3: WebSocket Testing
echo "3️⃣  Running WebSocket Connection Tests..."
echo "   Testing real-time capabilities and connection limits..."
node load-tests/websocket-test.js
if [ $? -eq 0 ]; then
    echo "   ✅ WebSocket tests completed successfully"
else
    echo "   ❌ WebSocket tests failed"
fi
echo ""

# Test 4: Bundle Analysis
echo "4️⃣  Running Bundle Analysis..."
echo "   Analyzing build output and optimization opportunities..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Bundle analysis completed successfully"
else
    echo "   ⚠️  Bundle analysis had issues (continuing)"
fi
echo ""

# Test 5: Comprehensive Report Generation
echo "5️⃣  Generating Comprehensive Report..."
echo "   Analyzing all test results and creating executive summary..."
node load-tests/comprehensive-report.js
if [ $? -eq 0 ]; then
    echo "   ✅ Comprehensive report generated successfully"
else
    echo "   ❌ Report generation failed"
fi
echo ""

echo "📊 Load Testing Suite Complete!"
echo ""
echo "📁 Results Location: ./performance/"
echo "🔍 Report Files Generated:"
ls -la performance/*.json 2>/dev/null | tail -5

echo ""
echo "🎯 Quick Summary:"
echo "  • API Performance: $(grep -o '"overallSuccessRate":[0-9]*' performance/stress-test-report-*.json | tail -1 | cut -d':' -f2)% success rate"
echo "  • Page Load Speed: $(grep -o '"averageLoadTime":[0-9]*' performance/simple-performance-report-*.json | tail -1 | cut -d':' -f2)ms average"
echo "  • Max Concurrent Users: $(grep -o '"maxConcurrentUsers":[0-9]*' performance/stress-test-report-*.json | tail -1 | cut -d':' -f2) tested successfully"

echo ""
echo "💡 Next Steps:"
echo "  1. Review the comprehensive report for detailed findings"
echo "  2. Address any critical issues identified"
echo "  3. Set up automated performance monitoring"
echo "  4. Schedule regular load testing"
echo ""
echo "🏁 Load testing complete at $(date)"