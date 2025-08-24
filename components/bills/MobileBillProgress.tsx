'use client';

import { CheckCircle, Circle, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBillProgressProps {
  status: {
    stage: string;
    lastAction: string;
    lastActionDate: string;
  };
  compact?: boolean;
  className?: string;
}

const PROGRESS_STAGES = [
  { key: 'Introduced', label: 'Intro', icon: Circle },
  { key: 'Committee', label: 'Committee', icon: Clock },
  { key: 'Floor Vote', label: 'Vote', icon: AlertTriangle },
  { key: 'Passed', label: 'Passed', icon: CheckCircle },
  { key: 'Law', label: 'Law', icon: CheckCircle },
];

export default function MobileBillProgress({ status, compact = false, className }: MobileBillProgressProps) {
  const currentStageIndex = PROGRESS_STAGES.findIndex(stage => stage.key === status.stage);
  
  if (compact) {
    return (
      <div className={cn("flex items-center justify-between", className)}>
        {PROGRESS_STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const isPast = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const isFuture = index > currentStageIndex;
          
          return (
            <div key={stage.key} className="flex flex-col items-center flex-1">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center mb-1",
                isPast && "bg-green-100 text-green-600",
                isCurrent && "bg-blue-100 text-blue-600",
                isFuture && "bg-gray-100 text-gray-400"
              )}>
                <Icon size={12} />
              </div>
              <span className={cn(
                "text-xs font-medium",
                isPast && "text-green-700",
                isCurrent && "text-blue-700",
                isFuture && "text-gray-500"
              )}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-lg border p-3", className)}>
      <h4 className="text-sm font-medium text-gray-900 mb-3">Progress</h4>
      
      <div className="space-y-2">
        {PROGRESS_STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const isPast = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const isFuture = index > currentStageIndex;
          
          return (
            <div key={stage.key} className="flex items-center gap-2">
              <div className={cn(
                "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
                isPast && "bg-green-100 text-green-600",
                isCurrent && "bg-blue-100 text-blue-600",
                isFuture && "bg-gray-100 text-gray-400"
              )}>
                <Icon size={12} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium",
                  isPast && "text-green-700",
                  isCurrent && "text-blue-700",
                  isFuture && "text-gray-500"
                )}>
                  {stage.label}
                </p>
              </div>
              
              {isCurrent && (
                <div className="text-xs text-gray-500">
                  {new Date(status.lastActionDate).toLocaleDateString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-3 pt-2 border-t">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Status:</span>
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            status.stage === 'Law' && "bg-green-100 text-green-800",
            status.stage === 'Floor Vote' && "bg-yellow-100 text-yellow-800",
            status.stage === 'Committee' && "bg-blue-100 text-blue-800",
            status.stage === 'Introduced' && "bg-gray-100 text-gray-800"
          )}>
            {status.stage}
          </span>
        </div>
      </div>
    </div>
  );
}