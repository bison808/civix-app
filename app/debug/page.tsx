'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { authApi } from '@/services/authApi';
import Button from '@/components/core/Button';
import { CheckCircle, Clock, AlertCircle, Code, Users, FileText, Calendar } from 'lucide-react';

export default function DebugPage() {
  // Restrict debug dashboard to development only
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>
          <p className="text-gray-600">Debug dashboard is only available in development.</p>
          <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  const { user, checkSession } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>({});
  
  // System metrics
  const systemMetrics = {
    totalFiles: 47,
    totalLinesOfCode: 18566,
    agentsDeployed: 30,
    agentsActive: 3,
    phasesCompleted: 6,
    featuresActive: 8,
    lastDeployment: '2025-08-23T22:15:00Z'
  };

  const agentStatus = [
    { id: '21-27', name: 'Bills & Committee Expansion', status: 'completed', files: 12, lines: 2847 },
    { id: '28-30', name: 'TypeScript Debugging Team', status: 'active', files: 3, lines: 456 },
    { id: '31', name: 'Multi-State Research', status: 'completed', files: 2, lines: 892 },
    { id: '32', name: 'Real ZIP/Data Integration', status: 'queued', files: 0, lines: 0 }
  ];

  const systemFeatures = [
    { name: 'California ZIP Mapping', status: 'active', coverage: '100%', icon: CheckCircle },
    { name: 'Political Representatives', status: 'active', coverage: '98%', icon: CheckCircle },
    { name: 'Bills & Committee System', status: 'building', coverage: '85%', icon: Clock },
    { name: 'Multi-State Architecture', status: 'planning', coverage: '15%', icon: AlertCircle },
    { name: 'Customer Feedback', status: 'planning', coverage: '0%', icon: AlertCircle },
    { name: 'Real API Integration', status: 'queued', coverage: '75%', icon: Clock }
  ];

  const runTests = async () => {
    setLoading(true);
    const results: any = {};

    // Test 1: Check localStorage
    results.localStorage = {
      userZipCode: localStorage.getItem('userZipCode'),
      userLocation: localStorage.getItem('userLocation'),
      user: localStorage.getItem('user'),
      anonymousId: localStorage.getItem('anonymousId'),
      sessionToken: localStorage.getItem('sessionToken'),
    };

    // Test 2: Check cookies
    results.cookies = document.cookie;

    // Test 3: Check auth state
    results.authState = {
      user: user,
      isAuthenticated: authApi.isAuthenticated(),
      isAuthenticatedForMiddleware: authApi.isAuthenticatedForMiddleware(),
    };

    // Test 4: Try to fetch bills
    try {
      const billsData = await api.bills.getAll();
      results.billsFetch = {
        success: true,
        count: billsData.length,
        sample: billsData[0],
      };
    } catch (error: any) {
      results.billsFetch = {
        success: false,
        error: error.message,
      };
    }

    // Test 5: Check session
    try {
      await checkSession();
      results.sessionCheck = 'Success';
    } catch (error: any) {
      results.sessionCheck = `Failed: ${error.message}`;
    }

    setTestResults(results);
    setLoading(false);
  };

  const clearAll = () => {
    localStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
    window.location.href = '/';
  };

  const simulateRegistration = async () => {
    // Simulate anonymous registration
    const mockUser = {
      anonymousId: `anon_${Date.now()}`,
      sessionToken: `session_${Date.now()}`,
      verificationLevel: 'anonymous',
      zipCode: '95060',
    };

    localStorage.setItem('anonymousId', mockUser.anonymousId);
    localStorage.setItem('sessionToken', mockUser.sessionToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('userZipCode', mockUser.zipCode);
    document.cookie = `anonymousId=${mockUser.anonymousId}; path=/; max-age=86400`;
    document.cookie = `sessionToken=${mockUser.sessionToken}; path=/; max-age=86400`;
    
    await checkSession();
    runTests();
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">🔧 CITZN System Dashboard</h1>

      <div className="space-y-6">
        {/* System Overview */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Code className="w-5 h-5" />
            System Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{systemMetrics.totalFiles}</p>
              <p className="text-sm text-gray-600">Total Files</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{systemMetrics.totalLinesOfCode.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Lines of Code</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{systemMetrics.agentsDeployed}</p>
              <p className="text-sm text-gray-600">Agents Deployed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{systemMetrics.agentsActive}</p>
              <p className="text-sm text-gray-600">Active Agents</p>
            </div>
          </div>
        </div>

        {/* Agent Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Agent Teams Status
          </h2>
          <div className="space-y-3">
            {agentStatus.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  {agent.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {agent.status === 'active' && <Clock className="w-4 h-4 text-blue-500 animate-pulse" />}
                  {agent.status === 'queued' && <AlertCircle className="w-4 h-4 text-gray-400" />}
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-gray-600">Agent {agent.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{agent.files} files • {agent.lines} lines</p>
                  <p className={`text-xs px-2 py-1 rounded ${
                    agent.status === 'completed' ? 'bg-green-100 text-green-800' :
                    agent.status === 'active' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {agent.status.toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Features */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Feature Status
          </h2>
          <div className="grid gap-3">
            {systemFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div key={feature.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-4 h-4 ${
                      feature.status === 'active' ? 'text-green-500' :
                      feature.status === 'building' ? 'text-blue-500' :
                      'text-gray-400'
                    }`} />
                    <p className="font-medium">{feature.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          parseInt(feature.coverage) >= 90 ? 'bg-green-500' :
                          parseInt(feature.coverage) >= 50 ? 'bg-blue-500' :
                          'bg-orange-500'
                        }`}
                        style={{ width: feature.coverage }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-12">{feature.coverage}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Diagnostic Controls</h2>
          <div className="flex gap-4">
            <Button onClick={runTests} disabled={loading}>
              Run Diagnostics
            </Button>
            <Button onClick={simulateRegistration} variant="secondary">
              Simulate Registration
            </Button>
            <Button onClick={clearAll} variant="danger">
              Clear All Data
            </Button>
          </div>
        </div>

        {/* Current User State */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current User State</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            
            {/* localStorage */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">📦 localStorage</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
                {JSON.stringify(testResults.localStorage, null, 2)}
              </pre>
            </div>

            {/* Cookies */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">🍪 Cookies</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
                {testResults.cookies || 'No cookies set'}
              </pre>
            </div>

            {/* Auth State */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">🔐 Auth State</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
                {JSON.stringify(testResults.authState, null, 2)}
              </pre>
            </div>

            {/* Bills Fetch */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">📜 Bills Fetch</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
                {JSON.stringify(testResults.billsFetch, null, 2)}
              </pre>
            </div>

            {/* Session Check */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">✅ Session Check</h3>
              <p className="text-sm">{testResults.sessionCheck}</p>
            </div>
          </div>
        )}

        {/* Development Roadmap */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Development Roadmap
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-green-700 mb-2">✅ Phase 1: California Foundation (95% Complete)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Political mapping for all 1,797 CA ZIP codes</li>
                <li>• Federal, State, County, and Local representatives</li>
                <li>• Bills & Committee integration system</li>
                <li>• Production deployment & debugging</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-700 mb-2">🚧 Phase 2: Multi-State Expansion (15% Complete)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real ZIP code API integration</li>
                <li>• Customer feedback collection system</li>
                <li>• 10-state rollout: TX, FL, NY, WA, OR, AZ, NV, OH, UT, KY</li>
                <li>• State-specific political data connections</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <a href="/" className="p-3 text-center bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors">
              🏠 Home
            </a>
            <a href="/register" className="p-3 text-center bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors">
              📝 Register
            </a>
            <a href="/bills" className="p-3 text-center bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors">
              📜 Bills
            </a>
            <a href="/dashboard" className="p-3 text-center bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition-colors">
              📊 Dashboard
            </a>
            <a href="/representatives" className="p-3 text-center bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 transition-colors">
              👥 Representatives
            </a>
            <a href="/committees" className="p-3 text-center bg-pink-50 text-pink-700 rounded hover:bg-pink-100 transition-colors">
              🏛️ Committees
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}