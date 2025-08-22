// Artillery processor for custom load test logic
const { performance } = require('perf_hooks');

module.exports = {
  // Track custom metrics
  setUserAgent: function(requestParams, context, ee, next) {
    requestParams.headers = requestParams.headers || {};
    requestParams.headers['User-Agent'] = 'CITZN-LoadTest/1.0';
    return next();
  },

  // Simulate slow networks
  addNetworkDelay: function(requestParams, context, ee, next) {
    const delays = [0, 100, 300, 1000]; // 0ms, 100ms, 300ms (3G), 1000ms (slow 3G)
    const delay = delays[Math.floor(Math.random() * delays.length)];
    
    setTimeout(() => {
      return next();
    }, delay);
  },

  // Track memory usage
  trackMemory: function(requestParams, context, ee, next) {
    const memUsage = process.memoryUsage();
    ee.emit('customStat', 'memory.heapUsed', memUsage.heapUsed);
    ee.emit('customStat', 'memory.heapTotal', memUsage.heapTotal);
    return next();
  },

  // Log response times
  logResponseTime: function(requestParams, response, context, ee, next) {
    if (response.timings) {
      ee.emit('customStat', 'response.dns', response.timings.dns);
      ee.emit('customStat', 'response.connect', response.timings.connect);
      ee.emit('customStat', 'response.firstByte', response.timings.firstByte);
    }
    return next();
  },

  // Validate critical endpoints
  validateResponse: function(requestParams, response, context, ee, next) {
    if (response.statusCode >= 500) {
      ee.emit('customStat', 'errors.server', 1);
    } else if (response.statusCode >= 400) {
      ee.emit('customStat', 'errors.client', 1);
    } else {
      ee.emit('customStat', 'success.responses', 1);
    }

    // Check for critical content
    if (requestParams.url === '/' && response.body) {
      if (!response.body.includes('CITZN') && !response.body.includes('Bills')) {
        ee.emit('customStat', 'errors.contentMissing', 1);
      }
    }

    return next();
  },

  // Random user behavior simulation
  simulateUserBehavior: function(context, ee, next) {
    const behaviors = ['quick_browse', 'detailed_read', 'engagement', 'bounce'];
    context.vars.userBehavior = behaviors[Math.floor(Math.random() * behaviors.length)];
    
    switch(context.vars.userBehavior) {
      case 'quick_browse':
        context.vars.thinkTime = Math.random() * 2 + 0.5; // 0.5-2.5s
        break;
      case 'detailed_read':
        context.vars.thinkTime = Math.random() * 10 + 5; // 5-15s
        break;
      case 'engagement':
        context.vars.thinkTime = Math.random() * 5 + 2; // 2-7s
        break;
      case 'bounce':
        context.vars.thinkTime = 0.1; // Quick bounce
        break;
    }
    
    return next();
  }
};