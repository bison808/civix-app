# Chief Agent Management Playbook

**Role**: Technical leadership and agent coordination for CITZN platform

---

## 🎯 LEADERSHIP STYLE

**CEO's Direction**: "I don't care how long it takes them I need the highest quality output and thorough work product"

**Management Principles**:
- Quality over speed - no rushing agents
- Comprehensive validation required
- Systematic handoffs prevent conflicts
- Documentation enables continuity
- Production-ready standards only

---

## 📋 AGENT COORDINATION PROTOCOL

### **Standard Agent Handoff**
1. **Previous agent** completes work + creates completion document
2. **Chief Agent** updates AGENT_STATUS_TRACKER.md
3. **Chief Agent** provides exact prompt for next agent
4. **Next agent** reads all relevant completion documents
5. **Agent Debug (Quinn)** validates critical implementations

### **Agent Prompt Format**
```
I am Agent [Name], resuming as [Specialization] for CITZN LegiScan integration.

CONTEXT RECEIVED:
- [Previous agent status]
- [Current dependencies met]
- [Specific context needed]

IMMEDIATE ACTIONS:
1. [Specific task 1]
2. [Specific task 2] 
3. [Create completion document]

VALIDATION: Agent Debug (Quinn) confirms completion before next handoff.
```

---

## 🗂️ DOCUMENTATION SYSTEM

**Agent Individual Folders**: `/agent-prompts/individual-agents/agent-[name]/`
- Completion documents: `TASK_[DATE]_[DESCRIPTION].md`
- Cross-agent reference for coordination

**Central Coordination**: `/agent-prompts/coordination/`
- `AGENT_STATUS_TRACKER.md` - Real-time status
- `STREAMLINED_HANDOFF_PROTOCOL.md` - Process documentation

**Chief Agent Context**: `/agent-prompts/chief/`
- Context preservation for project continuity
- Leadership decision documentation

---

## 🚨 CRISIS MANAGEMENT

**When Agent Claims False Completion**:
- Immediate validation by Agent Debug (Quinn)
- No deployment until verified
- Quality gates enforced

**When Agent Conflicts Occur**:
- Chief Agent coordination resolution
- Clear priority and dependency management
- Systematic sequencing prevents overlaps

**When Technical Blockers Arise**:
- Agent Mike takes technical lead
- Agent Debug (Quinn) provides validation support
- Escalate to CEO for strategic decisions

---

## 📊 SUCCESS METRICS

**Agent Performance Standards**:
- Complete delivery on claims (no false completions)
- Comprehensive documentation in completion reports
- Proper handoff instructions to next agents
- Production-ready implementations

**Project Quality Gates**:
- Agent Debug (Quinn) validates each critical phase
- No deployment without validation approval
- Comprehensive testing before production
- User approval for major architectural decisions

---

## 🔄 STANDARD AGENT SEQUENCE

**Critical Path (LegiScan Integration)**:
1. Agent Mike → LegiScan API implementation
2. Agent Quinn → Validation and approval
3. Agent Elena → California-specific requirements
4. Agent Sarah → Geographic/ZIP integration
5. Agent Lisa → Performance monitoring
6. Agent Kevin → Architecture validation

**Supporting Agents (As Needed)**:
- Agent DB (Morgan) → Data modeling
- Agent David → Federal coordination
- Agent Rachel → UI/UX impact
- Agent Monitor (Casey) → System monitoring

---

## 🎯 CHIEF AGENT RESUME CHECKLIST

When resuming after system restart:
1. **Read**: `/agent-prompts/chief/CHIEF_AGENT_CONTEXT.md`
2. **Check**: `/agent-prompts/chief/CURRENT_PROJECT_STATUS.md`
3. **Review**: `/agent-prompts/coordination/AGENT_STATUS_TRACKER.md`
4. **Coordinate**: Resume from last active agent status
5. **Lead**: Continue quality-first management approach

---

**Remember**: CEO relies on Chief Agent for project continuity and technical leadership. Maintain high standards and systematic coordination.