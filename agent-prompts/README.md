# Agent Prompts Directory
## Organized Agent Management for CITZN Platform

This directory contains all agent-related prompts and documentation for the persistent agent team architecture.

## 📁 Directory Structure

```
agent-prompts/
├── README.md                           # This file - directory overview
├── AGENT_INITIALIZATION_PROMPTS.md     # Week 1 READ ONLY prompts for all 20 agents
├── individual-prompts/                 # Individual agent prompt files (if needed)
├── coordination/                       # Cross-agent coordination documents
├── emergency-briefings/                # Critical situation briefings
└── templates/                         # Reusable prompt templates
```

## 🚨 Current Emergency: LegiScan API Integration

**CRITICAL ISSUE**: CITZN is showing users fake California legislative data instead of real bills.

**SOLUTION**: LegiScan API integration (free tier, 30K queries/month)

**AGENT ROLES**:
- **Agent Mike**: LEADS LegiScan API integration
- **Agent Elena**: California-specific data requirements
- **Agent Sarah**: Geographic/district mapping support
- **Agent PM (Taylor)**: Coordinates entire effort
- **Agent Debug (Quinn)**: Validates all work

## 📋 Agent Initialization Process

### Phase 1: Week 1 READ ONLY
1. Give each agent their specific prompt from `AGENT_INITIALIZATION_PROMPTS.md`
2. Agents study codebase without making changes
3. Build comprehensive understanding of their domain
4. Prepare for coordinated LegiScan integration

### Phase 2: Coordinated Implementation
1. Agent PM (Taylor) leads coordination
2. Agent Mike implements LegiScan API
3. Supporting agents provide specialized assistance
4. Agent Debug (Quinn) validates all work

## 🎯 Success Metrics

- ✅ Replace ALL fake California legislative data
- ✅ Maintain platform stability during transition  
- ✅ Preserve user experience quality
- ✅ Stay within 30K LegiScan API monthly limit

## 📊 Agent Priority Order (High → Low Priority)

### 🔴 **CRITICAL (Must Start First)**
1. **Agent PM (Taylor)** - Project coordination
2. **Agent Mike** - LegiScan API integration lead
3. **Agent Elena** - California data specialist  
4. **Agent Debug (Quinn)** - Validation specialist

### 🟡 **HIGH (Supporting Critical Work)**
5. **Agent Sarah** - Geographic/ZIP mapping
6. **Agent Lisa** - Performance monitoring
7. **Agent Kevin** - System architecture
8. **Agent DB (Morgan)** - Data modeling

### 🟢 **MEDIUM (Important but Less Urgent)**
9. **Agent David** - Federal data coordination
10. **Agent Rachel** - UI/UX consistency
11. **Agent Monitor (Casey)** - System monitoring
12. **Agent Alex** - Testing framework

### ⚪ **LOWER (Can Wait)**
13-20. Remaining specialist agents

## 🔄 Agent Resume Protocol

When agents need to resume work, they should use their specific resume protocol:

**Example**: "I am Agent [Name], continuing as [Specialization] for CITZN. [Specific context about their role]"

## 📖 Related Documentation

- `/PERSISTENT_AGENT_TEAM_ARCHITECTURE.md` - Complete agent architecture design
- `/CLAUDE.md` - Project context and instructions  
- `/API_INTEGRATION_DETAILED_SPEC.md` - Technical specifications

---

**Last Updated**: August 24, 2025
**Critical Priority**: LegiScan API Integration