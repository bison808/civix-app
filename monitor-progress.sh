#!/bin/bash

# CITZN Progress Monitor Script
# Updates every 30 minutes with agent progress

echo "🚀 CITZN Development Progress Monitor"
echo "======================================"
echo "Started: $(date)"
echo ""

# Color codes for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check task status
check_task_status() {
    echo -e "${BLUE}📊 Task Status Check - $(date +"%I:%M %p")${NC}"
    echo "----------------------------------------"
    
    # Check if dev server is running
    if lsof -i:3008 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Dev Server: Running on port 3008${NC}"
    else
        echo -e "${RED}❌ Dev Server: Not running${NC}"
    fi
    
    # Check if dashboard is accessible
    if curl -s http://localhost:8080/dashboard.html > /dev/null; then
        echo -e "${GREEN}✅ Dashboard: Accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  Dashboard: Not accessible${NC}"
    fi
    
    # Check git status
    CHANGES=$(git status --porcelain | wc -l)
    if [ $CHANGES -gt 0 ]; then
        echo -e "${YELLOW}📝 Git: $CHANGES uncommitted changes${NC}"
    else
        echo -e "${GREEN}✅ Git: Clean working tree${NC}"
    fi
    
    # Check production site
    if curl -s https://citznvote.netlify.app | grep -q "CITZN"; then
        echo -e "${GREEN}✅ Production: Live and accessible${NC}"
    else
        echo -e "${RED}❌ Production: Issues detected${NC}"
    fi
    
    echo ""
}

# Function to display current assignments
show_assignments() {
    echo -e "${BLUE}👥 Active Agent Assignments${NC}"
    echo "----------------------------------------"
    
    CURRENT_TIME=$(date +%s)
    
    # Bug Hunter status
    echo -e "${YELLOW}🐛 Bug Hunter:${NC}"
    echo "   Task: Authentication State Persistence"
    echo "   Status: Working (Started 12:54 PM)"
    echo "   ETA: 3:00 PM"
    
    # Feature Developer status
    echo -e "${YELLOW}🚀 Feature Developer:${NC}"
    echo "   Task: Real-Time Bill Updates"
    echo "   Status: Queued (Starts 2:00 PM)"
    echo "   ETA: 5:00 PM"
    
    # UI/UX Designer status
    echo -e "${YELLOW}🎨 UI/UX Designer:${NC}"
    echo "   Task: Mobile Responsiveness"
    echo "   Status: Working (Started 12:54 PM)"
    echo "   ETA: 4:00 PM"
    
    echo ""
}

# Function to check recent commits
check_recent_activity() {
    echo -e "${BLUE}📈 Recent Activity${NC}"
    echo "----------------------------------------"
    
    # Show last 3 commits
    echo "Last 3 commits:"
    git log --oneline -3 2>/dev/null || echo "No commits yet"
    
    # Show recently modified files
    echo -e "\nRecently modified files:"
    find . -type f -name "*.tsx" -o -name "*.ts" -mmin -30 2>/dev/null | head -5 || echo "No recent modifications"
    
    echo ""
}

# Function to display deployment schedule
show_deployment_schedule() {
    echo -e "${BLUE}📅 Deployment Schedule${NC}"
    echo "----------------------------------------"
    echo "Phase 1: 3:30 PM - Authentication Fix"
    echo "Phase 2: 5:30 PM - Bill Updates Feature"
    echo "Phase 3: 6:00 PM - Mobile Optimizations"
    echo "Phase 4: Tomorrow 10:00 AM - Onboarding"
    echo ""
}

# Main monitoring loop
monitor_progress() {
    while true; do
        clear
        echo "🚀 CITZN Development Progress Monitor"
        echo "======================================"
        echo "Last Update: $(date +"%I:%M %p - %B %d, %Y")"
        echo ""
        
        check_task_status
        show_assignments
        check_recent_activity
        show_deployment_schedule
        
        echo -e "${GREEN}Next update in 30 minutes...${NC}"
        echo "Press Ctrl+C to stop monitoring"
        
        # Wait 30 minutes (1800 seconds)
        sleep 1800
    done
}

# Start monitoring
monitor_progress