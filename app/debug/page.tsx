'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { authApi } from '@/services/authApi';
import Button from '@/components/core/Button';

export default function DebugPage() {
  const { user, checkSession } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>({});

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
      <h1 className="text-3xl font-bold mb-8">🔧 Debug Panel</h1>

      <div className="space-y-6">
        {/* Control Panel */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
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

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Navigation</h2>
          <div className="flex gap-4 flex-wrap">
            <a href="/" className="text-blue-600 hover:underline">Home</a>
            <a href="/register" className="text-blue-600 hover:underline">Register</a>
            <a href="/feed" className="text-blue-600 hover:underline">Feed</a>
            <a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a>
            <a href="/representatives" className="text-blue-600 hover:underline">Representatives</a>
          </div>
        </div>
      </div>
    </div>
  );
}