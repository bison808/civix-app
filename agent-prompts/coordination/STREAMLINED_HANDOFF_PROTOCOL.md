# 🔄 Streamlined Agent Handoff Protocol

## Optimized Workflow for Minimal Manual Coordination

### **Agent Resume Pattern**
Each agent uses this exact format when taking over:

```
I am Agent [Name], resuming as [Specialization] for CITZN LegiScan integration.

CONTEXT RECEIVED:
- [Previous agent's final status]
- [Current task state]
- [Any blockers or dependencies]

IMMEDIATE ACTIONS:
1. [First task to execute]
2. [Second task to execute]
3. [Handoff preparation for next agent]
4. Create completion document in my agent folder

VALIDATION: Agent Debug (Quinn) confirms completion before next handoff.
```

### **Task Completion Documentation**
**MANDATORY**: Every agent creates a completion document in their folder:

**File Pattern**: `/agent-prompts/individual-agents/agent-[name]/TASK_[DATE]_[DESCRIPTION].md`

**Template**:
```markdown
# Task Completion Report - Agent [Name]

**Date**: [YYYY-MM-DD]
**Task**: [Brief description]
**Status**: ✅ COMPLETE / 🔄 IN PROGRESS / 🚫 BLOCKED

## Work Completed
- [Specific action 1]
- [Specific action 2]
- [Files modified with line numbers]

## Files Modified
- `path/to/file.ts` - Lines [X-Y]: [Description]
- `path/to/file.tsx` - Lines [X-Y]: [Description]

## Key Findings
- [Important discovery 1]
- [Important discovery 2]

## Handoff to Next Agent
**Next Agent**: Agent [Name]
**Instruction**: [Specific task for next agent]
**Dependencies**: [What they need from my work]

## Validation Required
- [ ] [Specific validation point 1]
- [ ] [Specific validation point 2]

**Agent Debug (Quinn)**: Please validate [specific items]
```

### **Critical Agent Sequence for LegiScan Integration**

1. **Agent Mike** → `services/californiaLegislativeApi.ts` LegiScan integration
   - **Handoff to**: Agent Debug (Quinn) for validation
   - **Output**: "LegiScan API integrated, fake data replaced. Agent Quinn: validate integration."

2. **Agent Debug (Quinn)** → Validate Mike's work
   - **Handoff to**: Agent Elena for CA-specific requirements
   - **Output**: "Integration validated. Agent Elena: confirm CA legislative data accuracy."

3. **Agent Elena** → California data validation
   - **Handoff to**: Agent Sarah for geographic mapping
   - **Output**: "CA data confirmed. Agent Sarah: verify ZIP/district integration."

4. **Agent Sarah** → Geographic integration check
   - **Handoff to**: Agent Lisa for performance validation
   - **Output**: "Geographic mapping verified. Agent Lisa: performance test API integration."

### **Handoff Triggers**
- ✅ **Complete task**: "Task complete. [Next Agent]: [Specific instruction]"
- 🚫 **Blocked**: "Blocked by [issue]. Agent PM (Taylor): coordinate resolution"
- ⚠️ **Validation needed**: "Ready for validation. Agent Quinn: verify [specific items]"

### **Shared Context Management**
Each agent updates: `/agent-prompts/coordination/AGENT_STATUS_TRACKER.md`

```markdown
## Current Status (Auto-updated)

**Agent Mike**: ✅ LegiScan API integrated - VALIDATED
**Agent Elena**: ✅ CA data requirements confirmed - VALIDATED  
**Agent Sarah**: 🔄 IN PROGRESS - Geographic integration testing
**Agent Lisa**: ⏳ PENDING - Waiting for Sarah's completion
```

### **Emergency Protocols**
- **Integration failure**: Immediately hand to Agent Debug (Quinn)
- **Coordination conflict**: Immediately hand to Agent PM (Taylor)
- **Technical blocker**: Agent Mike takes lead with Debug support

This protocol reduces your coordination work to simple copy/paste handoffs while maintaining quality control.