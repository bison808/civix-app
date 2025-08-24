# CITZN Platform Operational Playbooks
**Agent Casey - Security Monitoring & System Observability**

## Table of Contents
1. [Quick Reference](#quick-reference)
2. [Incident Response Procedures](#incident-response-procedures)  
3. [System Health Monitoring](#system-health-monitoring)
4. [LegiScan API Management](#legiscan-api-management)
5. [Database Operations](#database-operations)
6. [Security Incident Response](#security-incident-response)
7. [Performance Troubleshooting](#performance-troubleshooting)
8. [Escalation Procedures](#escalation-procedures)

## Quick Reference

### Emergency Contacts
- **Platform Owner**: `admin@citzn.com`
- **Security Team**: `security@citzn.com`
- **Database Administrator**: (TBD)
- **Infrastructure**: Vercel Support

### Critical Endpoints
- **Health Check**: `GET /api/monitoring/health-checks`
- **System Health**: `GET /api/system/health`
- **Security Status**: `GET /api/monitoring/security`
- **LegiScan Usage**: `GET /api/monitoring/legiscan-usage`

### Critical Thresholds
- **Database Response Time**: > 1000ms (WARNING), > 5000ms (CRITICAL)
- **LegiScan Quota**: > 70% (WARNING), > 90% (CRITICAL), > 95% (EMERGENCY)
- **Security Alert Score**: > 70 (HIGH), > 90 (CRITICAL)
- **System Health Score**: < 85% (DEGRADED), < 70% (CRITICAL)

---

## Incident Response Procedures

### P1 - Critical System Down
**Definition**: Core functionality unavailable, affecting all users

#### Immediate Response (0-15 minutes)
1. **Assess Impact**
   ```bash
   curl https://civix-app.vercel.app/api/monitoring/health-checks?type=critical
   ```

2. **Check Service Status**
   - Database connectivity
   - Authentication services  
   - LegiScan API availability

3. **Emergency Communications**
   - Post status update (if status page available)
   - Notify stakeholders
   - Start incident tracking

#### Investigation (15-60 minutes)
1. **System Health Check**
   ```bash
   curl https://civix-app.vercel.app/api/monitoring/health-checks?type=detailed
   ```

2. **Log Analysis**
   - Check application logs
   - Review security monitoring alerts
   - Analyze database performance

3. **External Dependencies**
   - Verify Vercel platform status
   - Check LegiScan API status
   - Validate DNS and CDN

#### Resolution Actions
- **Database Issues**: See [Database Emergency Procedures](#database-emergency-procedures)
- **API Issues**: See [API Service Recovery](#api-service-recovery)
- **Security Issues**: See [Security Incident Response](#security-incident-response)

### P2 - Service Degradation
**Definition**: Reduced performance or partial functionality issues

#### Response Steps
1. **Performance Analysis**
   ```bash
   curl https://civix-app.vercel.app/api/monitoring/performance
   ```

2. **Identify Bottlenecks**
   - Database query performance
   - API response times
   - Cache hit rates

3. **Implement Temporary Fixes**
   - Enable aggressive caching
   - Rate limit non-essential features
   - Scale infrastructure if possible

### P3 - Non-Critical Issues
**Definition**: Minor issues not affecting core functionality

#### Response Steps
1. Monitor and document issue
2. Schedule fix during maintenance window
3. Update monitoring thresholds if needed

---

## System Health Monitoring

### Daily Health Checks
Run every morning at 9:00 AM:

```bash
# Quick system overview
curl -s https://civix-app.vercel.app/api/monitoring/health-checks | jq '.status, .score, .issues'

# Check LegiScan quota
curl -s https://civix-app.vercel.app/api/monitoring/legiscan-usage | jq '.quotaPercentage, .alertStatus'

# Security status
curl -s https://civix-app.vercel.app/api/monitoring/security | jq '.threatLevel, .activeAlerts'
```

### Weekly Health Report
Generate comprehensive report every Monday:

```bash
# Detailed health assessment
curl -s https://civix-app.vercel.app/api/monitoring/health-checks?type=detailed

# Performance trends
curl -s https://civix-app.vercel.app/api/monitoring/performance

# Database metrics
curl -s https://civix-app.vercel.app/api/monitoring/database
```

### Key Metrics to Track
- **System Uptime**: Target > 99.5%
- **Average Response Time**: Target < 1000ms
- **Error Rate**: Target < 1%
- **Database Health Score**: Target > 85
- **Security Threat Level**: Target = "low"

---

## LegiScan API Management

### Quota Monitoring
**CRITICAL**: 30,000 monthly request limit

#### Daily Quota Check
```bash
curl -s https://civix-app.vercel.app/api/monitoring/legiscan-usage | jq '{
  quotaPercentage: .quotaPercentage,
  currentUsage: .currentUsage,
  projectedUsage: .projectedMonthlyUsage,
  daysUntilReset: .daysUntilReset
}'
```

#### Alert Thresholds
- **70% Usage**: Enable enhanced caching
- **85% Usage**: Implement request throttling  
- **90% Usage**: Alert stakeholders, prepare upgrade
- **95% Usage**: EMERGENCY - Block non-essential requests

### Quota Emergency Procedures

#### At 95% Usage (EMERGENCY)
1. **Immediate Actions**
   ```bash
   # Check current status
   curl https://civix-app.vercel.app/api/monitoring/legiscan-usage
   
   # Enable emergency mode (implement in application)
   # This would block all non-essential LegiScan requests
   ```

2. **Emergency Response**
   - Enable maximum caching (24-hour TTL)
   - Disable non-essential legislative features
   - Consider upgrading to paid tier immediately
   - Notify users of temporary service limitations

3. **Communication Template**
   ```
   URGENT: We are experiencing high API usage and have temporarily 
   limited some legislative data features to ensure continued service. 
   We are working to restore full functionality as soon as possible.
   ```

#### Quota Recovery Plan
1. **Immediate (0-4 hours)**
   - Implement emergency rate limiting
   - Enable maximum caching strategies
   - Disable batch data operations

2. **Short-term (4-24 hours)**
   - Analyze usage patterns
   - Optimize high-frequency endpoints
   - Consider API tier upgrade

3. **Long-term (1-7 days)**
   - Implement intelligent caching
   - Optimize data refresh strategies
   - Add usage analytics and forecasting

---

## Database Operations

### Database Emergency Procedures

#### Database Connectivity Loss
1. **Check Connection Health**
   ```bash
   curl https://civix-app.vercel.app/api/monitoring/database | jq '.connectionHealth'
   ```

2. **Vercel Postgres Status**
   - Check Vercel dashboard
   - Review connection pool status
   - Validate environment variables

3. **Recovery Actions**
   - Restart database connections
   - Check and update connection strings
   - Scale database resources if needed

#### Slow Query Performance
1. **Identify Slow Queries**
   ```bash
   curl https://civix-app.vercel.app/api/monitoring/database | jq '.queryPerformance'
   ```

2. **Performance Analysis**
   - Check query execution times
   - Review database indexes
   - Analyze connection pool usage

3. **Optimization Steps**
   - Run database optimization
   - Add missing indexes
   - Optimize frequent queries

#### Database Maintenance
**Monthly Tasks**:
```bash
# Database health check
curl -X POST https://civix-app.vercel.app/api/monitoring/database \
  -H "Content-Type: application/json" \
  -d '{"action": "integrity_check"}'

# Cleanup expired data
curl -X POST https://civix-app.vercel.app/api/monitoring/database \
  -H "Content-Type: application/json" \
  -d '{"action": "cleanup"}'

# Database optimization
curl -X POST https://civix-app.vercel.app/api/monitoring/database \
  -H "Content-Type: application/json" \
  -d '{"action": "optimize"}'
```

---

## Security Incident Response

### Security Alert Levels
- **LOW**: Monitor and document
- **MEDIUM**: Investigate within 4 hours
- **HIGH**: Investigate within 1 hour
- **CRITICAL**: Immediate response required

### Security Incident Types

#### Suspected Brute Force Attack
1. **Detection Indicators**
   - Multiple failed login attempts from same IP
   - Rapid authentication attempts
   - Geographic anomalies

2. **Response Actions**
   ```bash
   # Check security status
   curl https://civix-app.vercel.app/api/monitoring/security
   
   # Review recent security events
   curl "https://civix-app.vercel.app/api/monitoring/security/events?limit=100&timeRange=1h"
   ```

3. **Mitigation Steps**
   - Block suspicious IP addresses
   - Implement rate limiting
   - Notify affected users
   - Strengthen authentication requirements

#### API Abuse Detection
1. **Detection Indicators**
   - Unusual API usage patterns
   - Excessive LegiScan requests
   - Geographic distribution anomalies

2. **Response Actions**
   - Analyze request patterns
   - Implement API rate limiting
   - Block abusive sources
   - Review API access logs

#### Data Security Incident
1. **Immediate Actions**
   - Assess scope of potential breach
   - Preserve evidence and logs
   - Implement containment measures

2. **Investigation**
   - Review security logs
   - Analyze affected systems
   - Document incident timeline

3. **Recovery**
   - Restore secure operations
   - Implement additional safeguards
   - Notify relevant parties per compliance requirements

---

## Performance Troubleshooting

### Performance Issues

#### High Response Times
1. **Check Performance Metrics**
   ```bash
   curl https://civix-app.vercel.app/api/monitoring/performance | jq '.coreWebVitals, .apiResponseTimes'
   ```

2. **Identify Bottlenecks**
   - Database query performance
   - API response times
   - Cache hit rates
   - External API latency

3. **Optimization Actions**
   - Enable caching where possible
   - Optimize database queries
   - Reduce external API dependencies
   - Implement CDN for static assets

#### Memory or CPU Issues
1. **System Resource Check**
   ```bash
   curl "https://civix-app.vercel.app/api/monitoring/health-checks?type=detailed" | jq '.diagnostics.system'
   ```

2. **Optimization Steps**
   - Review memory-intensive operations
   - Optimize database connections
   - Implement connection pooling
   - Scale infrastructure resources

### Core Web Vitals Optimization

#### Poor LCP (Largest Contentful Paint)
- Optimize images and media
- Implement lazy loading
- Reduce server response times
- Use CDN for static assets

#### High FID (First Input Delay)  
- Reduce JavaScript bundle sizes
- Optimize third-party scripts
- Use web workers for heavy computations
- Implement code splitting

#### Poor CLS (Cumulative Layout Shift)
- Set explicit dimensions for images
- Avoid inserting content above existing content
- Use CSS transforms instead of layout changes

---

## Escalation Procedures

### Escalation Matrix

| Severity | Initial Response | Escalation Time | Escalation To |
|----------|------------------|-----------------|---------------|
| P1 - Critical | Immediate | 30 minutes | Platform Owner + Infrastructure |
| P2 - High | Within 1 hour | 4 hours | Platform Owner |
| P3 - Medium | Within 4 hours | 24 hours | Development Team |
| P4 - Low | Within 24 hours | 1 week | Project Manager |

### Escalation Triggers
- **Automatic Escalation**
  - System health score < 50
  - LegiScan quota > 95%
  - Database downtime > 15 minutes
  - Security threat level = "critical"

- **Manual Escalation**
  - Unable to resolve within SLA
  - Multiple system failures
  - Security incident suspected
  - Customer impact escalating

### Communication Templates

#### Initial Incident Notification
```
INCIDENT ALERT - P[1-4]: [Brief Description]
Status: [Investigating/In Progress/Resolved]
Impact: [User-facing impact description]
ETA: [Expected resolution time]
Updates: [How often updates will be provided]
```

#### Incident Update
```
INCIDENT UPDATE - P[1-4]: [Brief Description]
Status: [Current status]
Progress: [What has been done]
Next Steps: [What will be done next]
ETA: [Updated resolution time]
```

#### Incident Resolution
```
INCIDENT RESOLVED - P[1-4]: [Brief Description]
Resolution: [How the issue was resolved]
Root Cause: [What caused the incident]
Prevention: [Steps taken to prevent recurrence]
Duration: [Total incident duration]
```

### Post-Incident Procedures

#### Incident Review (Within 48 hours)
1. **Timeline Documentation**
   - Incident start and resolution times
   - All actions taken during incident
   - Communication timeline

2. **Root Cause Analysis**
   - What caused the incident?
   - Why wasn't it prevented?
   - What factors contributed to the impact?

3. **Lessons Learned**
   - What went well?
   - What could be improved?
   - What additional monitoring is needed?

4. **Action Items**
   - Immediate fixes needed
   - Long-term improvements
   - Monitoring enhancements
   - Documentation updates

---

## Monitoring Dashboard Access

### Primary Dashboard
- **URL**: `https://civix-app.vercel.app/monitoring/dashboard`
- **Access**: Available to authorized personnel
- **Refresh**: Auto-refreshes every 30 seconds

### Key Dashboard Sections
1. **System Overview**: Overall health status and scores
2. **Security Status**: Threat levels and active alerts  
3. **LegiScan Usage**: Quota tracking and usage trends
4. **Database Health**: Performance and connection status
5. **Performance Metrics**: Response times and Core Web Vitals

### Mobile Access
Dashboard is responsive and accessible via mobile devices for emergency response.

---

## Maintenance Windows

### Scheduled Maintenance
- **Weekly**: Sundays 2:00-4:00 AM PST
- **Monthly**: First Sunday 1:00-5:00 AM PST
- **Emergency**: As needed with 2-hour notice

### Maintenance Checklist
- [ ] Database optimization and cleanup
- [ ] Security monitoring system updates
- [ ] Performance metric analysis
- [ ] Log retention cleanup
- [ ] Health check validation
- [ ] Backup verification

---

**Document Version**: 1.0  
**Last Updated**: 2025-08-24  
**Next Review**: 2025-09-24  
**Owner**: Agent Casey - Security & Observability Specialist