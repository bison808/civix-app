'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Removed unused import
import ImpactChart from '@/components/impact/ImpactChart';
import ImpactSummary from '@/components/impact/ImpactSummary';
import { Bill } from '@/types';
import { api } from '@/services/api';

export default function ImpactPage() {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    setLoading(true);
    try {
      const data = await api.bills.getAll();
      setBills(data);
      if (data.length > 0) {
        setSelectedBill(data[0]);
      }
    } catch (error) {
      console.error('Failed to load bills:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col pt-14 pb-16">
      {/* Page Title */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <h1 className="text-lg font-semibold">Impact Analysis</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-4">
        {loading ? (
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg h-48 animate-pulse" />
            <div className="bg-gray-100 rounded-lg h-32 animate-pulse" />
          </div>
        ) : selectedBill ? (
          <div className="space-y-6">
            {/* Bill Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select a bill to analyze:</label>
              <select
                value={selectedBill.id}
                onChange={(e) => {
                  const bill = bills.find(b => b.id === e.target.value);
                  if (bill) setSelectedBill(bill);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-delta"
              >
                {bills.map(bill => (
                  <option key={bill.id} value={bill.id}>
                    {bill.billNumber} - {bill.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Impact Summary */}
            <ImpactSummary
              impacts={[
                {
                  category: 'financial',
                  description: selectedBill.estimatedImpact?.economicImpact?.taxImplications || 'May affect your taxes and local economy',
                  effect: selectedBill.estimatedImpact?.economicImpact?.estimatedCost && selectedBill.estimatedImpact.economicImpact.estimatedCost > 0 ? 'negative' : 'neutral',
                  magnitude: 'medium',
                  timeframe: '6-12 months'
                },
                {
                  category: 'healthcare',
                  description: selectedBill.subjects?.includes('Healthcare') ? 'Changes to healthcare services' : 'Minimal healthcare impact',
                  effect: 'neutral',
                  magnitude: 'low',
                  timeframe: '1-2 years'
                },
                {
                  category: 'rights',
                  description: selectedBill.subjects?.includes('Civil Rights') ? 'May expand civil rights protections' : 'May impact civic opportunities',
                  effect: 'positive',
                  magnitude: 'low',
                  timeframe: '3-6 months'
                }
              ]}
              location={localStorage.getItem('userLocation') ? 
                JSON.parse(localStorage.getItem('userLocation') || '{}').city || 'Your district' : 
                'Your district'}
              affectedPeople={selectedBill.estimatedImpact?.affectedGroups?.length ? 
                selectedBill.estimatedImpact.affectedGroups.length * 10000 : 25000}
              timeline={{
                voteDate: selectedBill.lastActionDate,
                implementationDate: '2025-07-01',
                firstEffects: '2025-10-01',
              }}
            />

            {/* Personal Impact Chart */}
            <ImpactChart
              impacts={[
                { 
                  category: 'financial',
                  description: selectedBill.estimatedImpact?.economicImpact?.budgetImpact || 'Neutral financial impact',
                  effect: selectedBill.estimatedImpact?.economicImpact?.estimatedCost && selectedBill.estimatedImpact.economicImpact.estimatedCost > 0 ? 'negative' : 'neutral',
                  magnitude: 'medium',
                  timeframe: '6-12 months'
                },
                { 
                  category: 'healthcare',
                  description: 'Healthcare access and costs',
                  effect: selectedBill.subjects?.includes('Healthcare') ? 'positive' : 'neutral',
                  magnitude: selectedBill.subjects?.includes('Healthcare') ? 'high' : 'low',
                  timeframe: '1-2 years'
                },
                { 
                  category: 'education',
                  description: 'Educational opportunities',
                  effect: selectedBill.subjects?.includes('Education') ? 'positive' : 'neutral',
                  magnitude: selectedBill.subjects?.includes('Education') ? 'high' : 'low',
                  timeframe: '2-3 years'
                },
                { 
                  category: 'environment',
                  description: 'Environmental impact',
                  effect: selectedBill.subjects?.includes('Climate') || selectedBill.subjects?.includes('Energy') ? 'positive' : 'neutral',
                  magnitude: selectedBill.subjects?.includes('Climate') || selectedBill.subjects?.includes('Energy') ? 'high' : 'low',
                  timeframe: '3-5 years'
                },
                { 
                  category: 'safety',
                  description: 'Community safety',
                  effect: selectedBill.subjects?.includes('Criminal Justice') || selectedBill.subjects?.includes('Law Enforcement') ? 'positive' : 'neutral',
                  magnitude: 'medium',
                  timeframe: '1 year'
                }
              ]}
              type="personal"
              animated={true}
              interactive={true}
            />

            {/* Community Impact */}
            <div className="pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Impact</h3>
              <ImpactChart
                impacts={[
                  { 
                    category: 'financial',
                    description: selectedBill.estimatedImpact?.economicImpact?.jobsImpact || 'Employment and economic opportunities',
                    effect: 'positive',
                    magnitude: 'high',
                    timeframe: '1-2 years'
                  },
                  { 
                    category: 'education',
                    description: 'Community education and workforce development',
                    effect: 'positive',
                    magnitude: 'medium',
                    timeframe: '2-3 years'
                  },
                  { 
                    category: 'environment',
                    description: selectedBill.subjects?.includes('Infrastructure') ? 'Infrastructure and environmental improvements' : 'Environmental stewardship',
                    effect: selectedBill.subjects?.includes('Infrastructure') ? 'positive' : 'neutral',
                    magnitude: selectedBill.subjects?.includes('Infrastructure') ? 'high' : 'low',
                    timeframe: '2-5 years'
                  },
                  { 
                    category: 'safety',
                    description: 'Public safety and community services',
                    effect: 'positive',
                    magnitude: 'medium',
                    timeframe: '1 year'
                  },
                  { 
                    category: 'rights',
                    description: 'Community engagement and civic participation',
                    effect: 'positive',
                    magnitude: 'medium',
                    timeframe: '6 months'
                  }
                ]}
                type="community"
                animated={true}
                interactive={true}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No bills available for impact analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}