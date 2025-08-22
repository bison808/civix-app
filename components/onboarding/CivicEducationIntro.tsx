'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  Scale, 
  Building, 
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Play,
  Volume2,
  Heart,
  ArrowRight
} from 'lucide-react';
import Card from '@/components/core/Card';
import { cn } from '@/lib/utils';

interface CivicEducationIntroProps {
  onComplete?: () => void;
  className?: string;
}

interface EducationalStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  content: string;
  keyPoints: string[];
  visual?: string;
  color: string;
  bgColor: string;
}

export default function CivicEducationIntro({ onComplete, className }: CivicEducationIntroProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const educationalSteps: EducationalStep[] = [
    {
      id: 'what-is-congress',
      title: 'What is Congress?',
      subtitle: 'The people who make our laws',
      icon: Building,
      content: 'Congress is like a big meeting room where representatives from all 50 states come together to discuss and vote on new laws. Think of it as your community\'s voice in Washington D.C.',
      keyPoints: [
        '435 House Representatives (2-year terms)',
        '100 Senators (6-year terms)',
        'They represent YOUR district and state',
        'They vote on laws that affect your daily life'
      ],
      visual: '🏛️',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'how-bills-work',
      title: 'How Bills Become Laws',
      subtitle: 'The journey from idea to law',
      icon: Scale,
      content: 'A bill is like a proposal for a new rule or law. It starts as an idea, gets written down, discussed by experts, voted on by Congress, and finally signed by the President.',
      keyPoints: [
        'Introduced: Someone proposes the idea',
        'Committee: Experts review and improve it',
        'Floor Vote: All representatives vote',
        'President: Signs it into law or vetoes it'
      ],
      visual: '📋➡️🏛️➡️✅',
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200'
    },
    {
      id: 'why-it-matters',
      title: 'Why Should You Care?',
      subtitle: 'How laws affect your everyday life',
      icon: Heart,
      content: 'Every law affects real people in real ways. From the roads you drive on to the healthcare you receive, from the schools your kids attend to the environment you live in - it all starts with bills in Congress.',
      keyPoints: [
        'Healthcare: Insurance, drug prices, medical access',
        'Economy: Taxes, jobs, small business support',
        'Education: School funding, student loans, programs',
        'Environment: Clean air, water, climate policies'
      ],
      visual: '🏥💰🎓🌱',
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200'
    },
    {
      id: 'your-voice',
      title: 'Your Voice Matters',
      subtitle: 'How you can make a difference',
      icon: Users,
      content: 'Democracy works best when everyone participates. Your representatives work for YOU, and they need to hear from you to understand what matters to their constituents.',
      keyPoints: [
        'Track bills that affect issues you care about',
        'Contact your representatives with your opinion',
        'Vote in elections at all levels',
        'Stay informed about what\'s happening in Congress'
      ],
      visual: '🗳️📞✉️🗣️',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200'
    }
  ];

  const currentStepData = educationalSteps[currentStep];

  const nextStep = () => {
    if (currentStep < educationalSteps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    } else {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      onComplete?.();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipToEnd = () => {
    setCompletedSteps(new Set(Array.from({ length: educationalSteps.length }, (_, i) => i)));
    onComplete?.();
  };

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Civic Participation 101
        </h2>
        <p className="text-gray-600">
          Let's start with the basics of how government works for you
        </p>
        <div className="flex justify-center mt-4">
          <div className="flex gap-2">
            {educationalSteps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentStep ? "bg-blue-600" :
                  completedSteps.has(index) ? "bg-green-500" :
                  "bg-gray-300"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <Card 
        variant="default" 
        padding="lg"
        className={cn("border-l-4 mb-6", currentStepData.bgColor)}
      >
        <div className="space-y-6">
          {/* Step Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className={cn("p-4 rounded-full", currentStepData.bgColor)}>
                <currentStepData.icon className={cn("w-8 h-8", currentStepData.color)} />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {currentStepData.title}
            </h3>
            <p className="text-gray-600">
              {currentStepData.subtitle}
            </p>
          </div>

          {/* Visual */}
          <div className="text-center text-4xl mb-4">
            {currentStepData.visual}
          </div>

          {/* Main Content */}
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed text-center">
              {currentStepData.content}
            </p>

            {/* Key Points */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 text-center">Key Points:</h4>
              <div className="grid gap-2">
                {currentStepData.keyPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                    <span className="text-sm text-gray-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
            currentStep === 0 
              ? "text-gray-400 cursor-not-allowed" 
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          )}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={skipToEnd}
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            Skip intro
          </button>
          
          <button
            onClick={nextStep}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all font-medium"
          >
            {currentStep === educationalSteps.length - 1 ? (
              <>
                Get Started
                <Play size={16} />
              </>
            ) : (
              <>
                Continue
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Step {currentStep + 1} of {educationalSteps.length} • 
          {completedSteps.size > 0 && ` ${completedSteps.size} completed • `}
          About {(educationalSteps.length - currentStep) * 30} seconds remaining
        </p>
      </div>
    </div>
  );
}