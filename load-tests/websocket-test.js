const WebSocket = require('ws');
const { performance } = require('perf_hooks');

class WebSocketLoadTest {
  constructor() {
    this.baseUrl = process.env.CITZN_WS_URL || 'wss://citznvote.netlify.app';
    this.connections = [];
    this.results = [];
    this.messagesSent = 0;
    this.messagesReceived = 0;
    this.errors = 0;
  }

  async testWebSocketConnections() {
    console.log('🔌 Testing WebSocket connections under load...');
    
    // Note: Many static hosting platforms don't support WebSocket
    // This test will attempt to connect and report findings
    
    const concurrencyLevels = [1, 5, 10, 25];
    
    for (const concurrency of concurrencyLevels) {
      console.log(`\n📊 Testing with ${concurrency} concurrent WebSocket connections...`);
      
      const promises = [];
      const startTime = performance.now();
      
      for (let i = 0; i < concurrency; i++) {
        promises.push(this.createWebSocketConnection(i));
      }
      
      const results = await Promise.allSettled(promises);
      const endTime = performance.now();
      
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.connected).length;
      const failed = results.filter(r => r.status === 'rejected' || !r.value?.connected).length;
      
      this.results.push({
        concurrency,
        successful,
        failed,
        successRate: (successful / concurrency) * 100,
        totalTime: Math.round(endTime - startTime),
        timestamp: new Date().toISOString()
      });
      
      console.log(`  ✅ Connected: ${successful}/${concurrency} (${Math.round((successful/concurrency)*100)}%)`);
      console.log(`  ❌ Failed: ${failed}`);
      
      // Close all connections
      await this.closeAllConnections();
      
      // Delay between test rounds
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  async createWebSocketConnection(connectionId) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      try {
        // Try to connect to WebSocket endpoint
        const ws = new WebSocket(`${this.baseUrl}/ws`, {
          headers: {
            'User-Agent': 'CITZN-WebSocket-LoadTest/1.0',
            'X-Connection-ID': connectionId.toString()
          }
        });
        
        let connected = false;
        let connectTime = 0;
        
        const timeout = setTimeout(() => {
          if (!connected) {
            ws.terminate();
            resolve({
              connectionId,
              connected: false,
              error: 'Connection timeout',
              connectTime: performance.now() - startTime
            });
          }
        }, 10000);
        
        ws.on('open', () => {
          connected = true;
          connectTime = performance.now() - startTime;
          clearTimeout(timeout);
          
          this.connections.push(ws);
          
          // Send a test message
          try {
            ws.send(JSON.stringify({
              type: 'ping',
              timestamp: Date.now(),
              connectionId
            }));
            this.messagesSent++;
          } catch (error) {
            // Ignore send errors for this test
          }
          
          resolve({
            connectionId,
            connected: true,
            connectTime: Math.round(connectTime),
            websocket: ws
          });
        });
        
        ws.on('message', (data) => {
          this.messagesReceived++;
          try {
            const message = JSON.parse(data);
            // Handle pong or other messages
          } catch (error) {
            // Ignore parse errors for this test
          }
        });
        
        ws.on('error', (error) => {
          clearTimeout(timeout);
          this.errors++;
          resolve({
            connectionId,
            connected: false,
            error: error.message,
            connectTime: performance.now() - startTime
          });
        });
        
        ws.on('close', () => {
          clearTimeout(timeout);
          if (!connected) {
            resolve({
              connectionId,
              connected: false,
              error: 'Connection closed before open',
              connectTime: performance.now() - startTime
            });
          }
        });
        
      } catch (error) {
        resolve({
          connectionId,
          connected: false,
          error: error.message,
          connectTime: performance.now() - startTime
        });
      }
    });
  }

  async closeAllConnections() {
    console.log(`  🔌 Closing ${this.connections.length} connections...`);
    
    const closePromises = this.connections.map(ws => {
      return new Promise((resolve) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        setTimeout(resolve, 100); // Give time for graceful close
      });
    });
    
    await Promise.all(closePromises);
    this.connections = [];
  }

  async testRealtimeFeatures() {
    console.log('\n📡 Testing real-time features...');
    
    // Test if the platform has any real-time endpoints
    const realtimeEndpoints = [
      '/api/realtime/bills',
      '/api/realtime/votes',
      '/api/realtime/notifications',
      '/api/live/updates'
    ];
    
    const axios = require('axios');
    const baseUrl = 'https://citznvote.netlify.app';
    
    for (const endpoint of realtimeEndpoints) {
      try {
        const response = await axios.get(`${baseUrl}${endpoint}`, {
          timeout: 5000,
          headers: {
            'User-Agent': 'CITZN-Realtime-Test/1.0'
          }
        });
        
        console.log(`  ✅ ${endpoint}: Available (${response.status})`);
        
      } catch (error) {
        console.log(`  ❌ ${endpoint}: Not available (${error.response?.status || 'timeout'})`);
      }
    }
  }

  generateWebSocketReport() {
    const totalTests = this.results.reduce((sum, r) => sum + r.concurrency, 0);
    const totalSuccessful = this.results.reduce((sum, r) => sum + r.successful, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0);
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalConnections: totalTests,
        successfulConnections: totalSuccessful,
        failedConnections: totalFailed,
        overallSuccessRate: totalTests > 0 ? Math.round((totalSuccessful / totalTests) * 100) : 0,
        messagesSent: this.messagesSent,
        messagesReceived: this.messagesReceived,
        errors: this.errors
      },
      testResults: this.results,
      analysis: {
        webSocketSupport: totalSuccessful > 0,
        maxConcurrentConnections: Math.max(...this.results.map(r => r.successful)),
        connectionReliability: this.results.map(r => ({
          concurrency: r.concurrency,
          successRate: r.successRate
        }))
      },
      recommendations: this.generateWebSocketRecommendations()
    };
    
    const fs = require('fs');
    const path = require('path');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(__dirname, `../performance/websocket-report-${timestamp}.json`);
    
    // Ensure performance directory exists
    const perfDir = path.dirname(reportPath);
    if (!fs.existsSync(perfDir)) {
      fs.mkdirSync(perfDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 WebSocket report saved to: ${reportPath}`);
    
    return report;
  }

  generateWebSocketRecommendations() {
    const recommendations = [];
    const totalSuccessful = this.results.reduce((sum, r) => sum + r.successful, 0);
    
    if (totalSuccessful === 0) {
      recommendations.push({
        priority: 'INFO',
        category: 'WebSocket Support',
        issue: 'No WebSocket connections successful',
        recommendation: 'Platform may not support WebSockets (common for static hosting). Consider Server-Sent Events or polling for real-time features.'
      });
    } else {
      const maxConcurrency = Math.max(...this.results.map(r => r.successful));
      if (maxConcurrency < 25) {
        recommendations.push({
          priority: 'MEDIUM',
          category: 'Concurrent Connections',
          issue: `Maximum concurrent WebSocket connections: ${maxConcurrency}`,
          recommendation: 'Consider implementing connection pooling or limiting concurrent connections per user'
        });
      }
    }
    
    if (this.errors > this.messagesSent * 0.1) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Error Rate',
        issue: `High error rate in WebSocket communications: ${Math.round((this.errors / (this.messagesSent || 1)) * 100)}%`,
        recommendation: 'Implement better error handling and connection retry logic'
      });
    }
    
    return recommendations;
  }
}

// CLI execution
if (require.main === module) {
  async function main() {
    const wsTest = new WebSocketLoadTest();
    
    try {
      console.log('🚀 Starting WebSocket Load Tests...');
      
      // Test WebSocket connections
      await wsTest.testWebSocketConnections();
      
      // Test real-time features
      await wsTest.testRealtimeFeatures();
      
      // Generate report
      const report = wsTest.generateWebSocketReport();
      
      console.log('\n🎯 WebSocket Test Summary:');
      console.log(`Total Connections Attempted: ${report.summary.totalConnections}`);
      console.log(`Successful Connections: ${report.summary.successfulConnections}`);
      console.log(`Overall Success Rate: ${report.summary.overallSuccessRate}%`);
      console.log(`WebSocket Support: ${report.analysis.webSocketSupport ? '✅ Yes' : '❌ No'}`);
      
      if (report.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        report.recommendations.forEach(rec => {
          console.log(`  ${rec.priority}: ${rec.issue}`);
          console.log(`    💡 ${rec.recommendation}`);
        });
      }
      
    } catch (error) {
      console.error('❌ WebSocket testing failed:', error);
      process.exit(1);
    }
  }

  main();
}

module.exports = WebSocketLoadTest;