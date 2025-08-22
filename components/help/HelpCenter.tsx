'use client';

import React, { useState } from 'react';
import { 
  Search,
  HelpCircle,
  Book,
  MessageCircle,
  Settings,
  Shield,
  Vote,
  Bell,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Mail,
  Phone,
  Clock,
  CheckCircle
} from 'lucide-react';
import Card from '@/components/core/Card';
import { cn } from '@/lib/utils';

interface HelpCenterProps {
  className?: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpful?: number;
}

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  articles: number;
}

export default function HelpCenter({ className }: HelpCenterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<Set<string>>(new Set());

  const categories: HelpCategory[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'New to CITZN? Start here',
      icon: Book,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
      articles: 8
    },
    {
      id: 'understanding-bills',
      title: 'Understanding Bills',
      description: 'How legislation works',
      icon: Vote,
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200',
      articles: 12
    },
    {
      id: 'privacy-settings',
      title: 'Privacy & Settings',
      description: 'Control your data',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200',
      articles: 6
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Stay informed',
      icon: Bell,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200',
      articles: 5
    }
  ];

  const faqItems: FAQItem[] = [
    {
      id: 'what-is-citzn',
      question: 'What is CITZN and how does it help me?',
      answer: 'CITZN is a platform that makes government more accessible by simplifying complex legislation and helping you track bills that matter to you. We translate "government speak" into plain English so you can understand how proposed laws might affect your daily life.',
      category: 'getting-started',
      tags: ['basics', 'purpose', 'overview'],
      helpful: 47
    },
    {
      id: 'how-to-find-bills',
      question: 'How do I find bills that affect me?',
      answer: 'After setting your location, CITZN automatically shows you bills relevant to your area. You can also use filters to search by topic (healthcare, education, taxes, etc.) or browse by status (new, in committee, up for vote). Our "Why This Matters" sections explain how each bill might impact you personally.',
      category: 'understanding-bills',
      tags: ['search', 'filters', 'location', 'relevance'],
      helpful: 32
    },
    {
      id: 'bill-status-meaning',
      question: 'What do the different bill statuses mean?',
      answer: 'Bill statuses show where legislation is in the process: "Introduced" means it\'s just been proposed, "Committee" means experts are reviewing it, "Floor" means it\'s up for a vote, "Passed" means it passed one chamber, and "Law" means it\'s been signed by the President.',
      category: 'understanding-bills',
      tags: ['status', 'process', 'stages'],
      helpful: 28
    },
    {
      id: 'data-privacy',
      question: 'What data do you collect and how is it used?',
      answer: 'We only collect data necessary to provide you with relevant bill information: your ZIP code (to show local representatives), your interests (to filter content), and your votes/feedback (to improve recommendations). We never sell your data or share personal information with third parties. You can delete your account and all data at any time.',
      category: 'privacy-settings',
      tags: ['privacy', 'data', 'security', 'deletion'],
      helpful: 23
    },
    {
      id: 'contact-representatives',
      question: 'How do I contact my representatives?',
      answer: 'Each bill page shows your relevant representatives with direct contact information. Click on any representative\'s name to see their phone number, email, and office address. We also provide templates to help you write effective messages about specific bills.',
      category: 'getting-started',
      tags: ['contact', 'representatives', 'advocacy'],
      helpful: 19
    },
    {
      id: 'notification-types',
      question: 'What types of notifications can I receive?',
      answer: 'You can get notified when: bills you\'re following have status changes, bills matching your interests are introduced, your representatives vote on important issues, or major legislation is coming up for a vote. All notifications can be customized or turned off in settings.',
      category: 'notifications',
      tags: ['alerts', 'updates', 'customization'],
      helpful: 15
    },
    {
      id: 'bill-summaries-accurate',
      question: 'How accurate are the simplified bill summaries?',
      answer: 'Our summaries are generated from the official bill text and reviewed for accuracy. While we strive to make complex legislation understandable, we always encourage reading the full text for complete details. Each summary includes links to the original bill and congressional records.',
      category: 'understanding-bills',
      tags: ['accuracy', 'summaries', 'verification'],
      helpful: 12
    },
    {
      id: 'free-service',
      question: 'Is CITZN free to use?',
      answer: 'Yes! CITZN is completely free for all citizens. We believe everyone should have access to understand their government. The platform is supported by grants and donations from civic organizations committed to transparency and democratic participation.',
      category: 'getting-started',
      tags: ['free', 'cost', 'funding'],
      helpful: 31
    }
  ];

  const toggleFAQ = (id: string) => {
    const newExpanded = new Set(expandedFAQ);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFAQ(newExpanded);
  };

  const filteredFAQs = faqItems.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={cn("max-w-4xl mx-auto space-y-8", className)}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
        <p className="text-gray-600 mb-6">
          Find answers to common questions and learn how to make the most of CITZN
        </p>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          
          return (
            <Card
              key={category.id}
              variant="default"
              padding="md"
              className={cn(
                "cursor-pointer transition-all border-l-4",
                isSelected ? category.bgColor : "hover:bg-gray-50",
                isSelected ? "ring-2 ring-blue-200" : ""
              )}
              onClick={() => setSelectedCategory(isSelected ? null : category.id)}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Icon className={cn("w-6 h-6", category.color)} />
                  <span className="text-xs text-gray-500">{category.articles} articles</span>
                </div>
                <h3 className="font-semibold text-gray-900">{category.title}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selected Category Indicator */}
      {selectedCategory && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-700">
              Showing results for: <strong>{categories.find(c => c.id === selectedCategory)?.title}</strong>
            </span>
          </div>
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Show all
          </button>
        </div>
      )}

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <HelpCircle size={24} />
          Frequently Asked Questions
        </h2>

        {filteredFAQs.length === 0 ? (
          <Card variant="default" padding="lg" className="text-center">
            <div className="text-gray-500">
              <HelpCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No results found</p>
              <p className="text-sm">Try different search terms or browse all categories</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredFAQs.map((faq) => {
              const isExpanded = expandedFAQ.has(faq.id);
              
              return (
                <Card key={faq.id} variant="default" padding="md">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleFAQ(faq.id)}
                  >
                    <h3 className="font-medium text-gray-900 flex-1 text-left">
                      {faq.question}
                    </h3>
                    <div className="flex items-center gap-2">
                      {faq.helpful && (
                        <span className="text-xs text-gray-500">
                          {faq.helpful} found helpful
                        </span>
                      )}
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {faq.answer}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {faq.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <button className="hover:text-green-600 transition-colors">
                            👍 Helpful
                          </button>
                          <button className="hover:text-red-600 transition-colors">
                            👎 Not helpful
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Contact Support */}
      <Card variant="default" padding="lg" className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Still need help?</h2>
          <p className="text-gray-600">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <Mail className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Email Support</h3>
              <p className="text-sm text-gray-600 mb-2">help@citzn.vote</p>
              <p className="text-xs text-gray-500">Response within 24 hours</p>
            </div>
            
            <div className="text-center">
              <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Live Chat</h3>
              <p className="text-sm text-gray-600 mb-2">Available on the app</p>
              <p className="text-xs text-gray-500">Mon-Fri, 9am-5pm EST</p>
            </div>
            
            <div className="text-center">
              <Book className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">User Guide</h3>
              <p className="text-sm text-gray-600 mb-2">Complete tutorials</p>
              <p className="text-xs text-gray-500">Step-by-step guides</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}