'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Heart, GraduationCap, DollarSign, Leaf, Home, Scale, Briefcase, Car, Lock } from 'lucide-react';
import Button from '@/components/core/Button';
import { cn } from '@/lib/utils';

const interests = [
  { id: 'healthcare', label: 'Healthcare', icon: Heart },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'taxes', label: 'Taxes', icon: DollarSign },
  { id: 'climate', label: 'Climate', icon: Leaf },
  { id: 'housing', label: 'Housing', icon: Home },
  { id: 'justice', label: 'Justice', icon: Scale },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'transit', label: 'Transit', icon: Car },
  { id: 'privacy', label: 'Privacy', icon: Lock },
];

export default function InterestsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleInterest = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleContinue = () => {
    localStorage.setItem('userInterests', JSON.stringify(selected));
    router.push('/feed');
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 bg-white">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Step 2 of 3</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What matters to you?
        </h2>
        <p className="text-gray-600 mb-6">
          Select topics you care about to personalize your feed
        </p>

        {/* Interest Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {interests.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => toggleInterest(id)}
              className={cn(
                'flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all',
                selected.includes(id)
                  ? 'border-delta bg-delta/10 text-delta'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              )}
            >
              <Icon size={24} className="mb-2" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-500 text-center">
          You can change these anytime in settings
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200 bg-white safe-bottom">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleContinue}
          disabled={selected.length === 0}
        >
          Continue ({selected.length} selected)
        </Button>
      </div>
    </div>
  );
}