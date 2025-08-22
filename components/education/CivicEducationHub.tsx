'use client';

import React, { useState } from 'react';
import { 
  BookOpen,
  Play,
  Clock,
  Users,
  Trophy,
  Star,
  ChevronRight,
  ExternalLink,
  Download,
  Share2,
  Heart,
  GraduationCap,
  Building,
  Scale,
  Vote,
  FileText,
  Lightbulb,
  Target
} from 'lucide-react';
import Card from '@/components/core/Card';
import { cn } from '@/lib/utils';

interface CivicEducationHubProps {
  className?: string;
}

interface EducationResource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'interactive' | 'quiz' | 'guide';
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  rating: number;
  completions: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  resources: string[];
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: React.ElementType;
  color: string;
}

export default function CivicEducationHub({ className }: CivicEducationHubProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpen },
    { id: 'basics', name: 'Government Basics', icon: Building },
    { id: 'bills', name: 'How Bills Work', icon: FileText },
    { id: 'voting', name: 'Elections & Voting', icon: Vote },
    { id: 'rights', name: 'Civic Rights', icon: Scale },
    { id: 'advocacy', name: 'Civic Engagement', icon: Users }
  ];

  const learningPaths: LearningPath[] = [
    {
      id: 'beginner-path',
      title: 'Civic Participation 101',
      description: 'Start your journey in understanding American democracy',
      resources: ['gov-basics', 'three-branches', 'how-laws-made'],
      estimatedTime: '45 minutes',
      difficulty: 'beginner',
      icon: GraduationCap,
      color: 'text-green-600'
    },
    {
      id: 'bills-path',
      title: 'Understanding Legislation',
      description: 'Master the art of reading and understanding bills',
      resources: ['bill-anatomy', 'committee-process', 'voting-process'],
      estimatedTime: '60 minutes',
      difficulty: 'intermediate',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      id: 'advocacy-path',
      title: 'Effective Advocacy',
      description: 'Learn how to make your voice heard in government',
      resources: ['contacting-reps', 'writing-letters', 'advocacy-tips'],
      estimatedTime: '30 minutes',
      difficulty: 'beginner',
      icon: Target,
      color: 'text-purple-600'
    }
  ];

  const educationResources: EducationResource[] = [
    {
      id: 'gov-basics',
      title: 'Government Basics: The Foundation',
      description: 'Learn the fundamental structure of American government and how it affects your daily life.',
      type: 'interactive',
      duration: '15 min',
      difficulty: 'beginner',
      category: 'basics',
      tags: ['democracy', 'structure', 'basics'],
      rating: 4.8,
      completions: 1247,
      icon: Building,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'three-branches',
      title: 'The Three Branches Explained',
      description: 'Understand the executive, legislative, and judicial branches and their roles.',
      type: 'video',
      duration: '12 min',
      difficulty: 'beginner',
      category: 'basics',
      tags: ['branches', 'separation', 'powers'],
      rating: 4.7,
      completions: 892,
      icon: Scale,
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200'
    },
    {
      id: 'how-laws-made',
      title: 'How Laws Are Made',
      description: 'Follow a bill\'s journey from idea to law with interactive examples.',
      type: 'interactive',
      duration: '20 min',
      difficulty: 'beginner',
      category: 'bills',
      tags: ['legislation', 'process', 'congress'],
      rating: 4.9,
      completions: 2156,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200'
    },
    {
      id: 'bill-anatomy',
      title: 'Anatomy of a Bill',
      description: 'Decode the structure and language used in congressional bills.',
      type: 'guide',
      duration: '18 min',
      difficulty: 'intermediate',
      category: 'bills',
      tags: ['reading', 'analysis', 'structure'],
      rating: 4.6,
      completions: 567,
      icon: BookOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200'
    },
    {
      id: 'committee-process',
      title: 'Committee Deep Dive',
      description: 'Understand how committees review and modify legislation.',
      type: 'article',
      duration: '25 min',
      difficulty: 'intermediate',
      category: 'bills',
      tags: ['committees', 'review', 'markup'],
      rating: 4.4,
      completions: 321,
      icon: Users,
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200'
    },
    {
      id: 'voting-process',
      title: 'Congressional Voting',
      description: 'Learn about different types of votes and what they mean.',
      type: 'video',
      duration: '14 min',
      difficulty: 'intermediate',
      category: 'voting',
      tags: ['voting', 'procedures', 'types'],
      rating: 4.5,
      completions: 445,
      icon: Vote,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 border-indigo-200'
    },
    {
      id: 'contacting-reps',
      title: 'Contacting Your Representatives',
      description: 'Effective strategies for reaching out to your elected officials.',
      type: 'guide',
      duration: '10 min',
      difficulty: 'beginner',
      category: 'advocacy',
      tags: ['contact', 'representatives', 'communication'],
      rating: 4.7,
      completions: 1034,
      icon: Users,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 border-teal-200'
    },
    {
      id: 'civic-rights-quiz',
      title: 'Know Your Civic Rights',
      description: 'Test your knowledge of fundamental civic rights and responsibilities.',
      type: 'quiz',
      duration: '8 min',
      difficulty: 'beginner',
      category: 'rights',
      tags: ['rights', 'responsibilities', 'quiz'],
      rating: 4.6,
      completions: 789,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 border-yellow-200'
    }
  ];

  const getTypeIcon = (type: EducationResource['type']) => {
    switch (type) {
      case 'video': return Play;
      case 'interactive': return Lightbulb;
      case 'quiz': return Trophy;
      case 'guide': return BookOpen;
      default: return FileText;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredResources = educationResources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty;
    return matchesCategory && matchesDifficulty;
  });

  return (
    <div className={cn("max-w-6xl mx-auto space-y-8", className)}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Civic Education Hub</h1>
        <p className="text-gray-600 mb-6">
          Learn how your government works and how to make your voice heard
        </p>
      </div>

      {/* Learning Paths */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Recommended Learning Paths</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {learningPaths.map((path) => {
            const Icon = path.icon;
            return (
              <Card key={path.id} variant="default" padding="md" className="cursor-pointer hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <Icon className={cn("w-8 h-8", path.color)} />
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      getDifficultyColor(path.difficulty)
                    )}>
                      {path.difficulty}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{path.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{path.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>{path.estimatedTime}</span>
                      <span>•</span>
                      <span>{path.resources.length} resources</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Start Learning</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          <span className="text-sm font-medium text-gray-700">Category:</span>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                selectedCategory === category.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <span className="text-sm font-medium text-gray-700">Difficulty:</span>
          {['all', 'beginner', 'intermediate', 'advanced'].map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all capitalize",
                selectedDifficulty === difficulty
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {difficulty}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource) => {
          const Icon = resource.icon;
          const TypeIcon = getTypeIcon(resource.type);
          
          return (
            <Card 
              key={resource.id} 
              variant="default" 
              padding="md"
              className={cn(
                "cursor-pointer hover:shadow-md transition-all border-l-4",
                resource.bgColor
              )}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <Icon className={cn("w-6 h-6", resource.color)} />
                  <div className="flex items-center gap-1">
                    <TypeIcon size={14} className="text-gray-500" />
                    <span className="text-xs text-gray-500 capitalize">{resource.type}</span>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{resource.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{resource.description}</p>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock size={12} />
                    <span>{resource.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-400 fill-current" />
                    <span>{resource.rating}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {resource.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Users size={12} />
                    <span>{resource.completions.toLocaleString()} completed</span>
                  </div>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    getDifficultyColor(resource.difficulty)
                  )}>
                    {resource.difficulty}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <Card variant="default" padding="lg" className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-center">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Keep Learning</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            The more you understand about how government works, the more effective you can be as a citizen. 
            Every small step in learning helps strengthen our democracy.
          </p>
          <div className="flex justify-center gap-4">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all">
              <GraduationCap size={16} />
              Take a Quiz
            </button>
            <button className="flex items-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-all">
              <Share2 size={16} />
              Share Resources
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}