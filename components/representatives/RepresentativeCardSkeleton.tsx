'use client';
import React from 'react';

export const RepresentativeCardSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      {/* Representative photo and name */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      
      {/* Contact info */}
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
      
      {/* Action buttons */}
      <div className="flex space-x-2 pt-4">
        <div className="h-8 bg-gray-200 rounded w-20"></div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  </div>
);

export const RepresentativeListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }, (_, i) => (
      <RepresentativeCardSkeleton key={i} />
    ))}
  </div>
);

export const RepresentativeProfileSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-200 h-32"></div>
      
      {/* Profile content */}
      <div className="p-6 space-y-6">
        {/* Basic info */}
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="text-center space-y-2">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        
        {/* Bio */}
        <div className="space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);