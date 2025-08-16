'use client';

import React from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface SearchFallbackProps {
  message?: string;
  showSetupInstructions?: boolean;
}

export const SearchFallback: React.FC<SearchFallbackProps> = ({
  message = 'Search functionality is currently unavailable',
  showSetupInstructions = false,
}) => {
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="text-gray-400 mb-4">
          <AlertCircle className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Search Unavailable
        </h3>
        <p className="text-gray-600 mb-4">
          {message}
        </p>
        
        {showSetupInstructions && (
          <div className="text-sm text-gray-500 mb-6">
            <p className="mb-2">To enable search functionality:</p>
            <ol className="text-left space-y-1 list-decimal list-inside">
              <li>Configure Algolia credentials in environment variables</li>
              <li>Run the search initialization script</li>
              <li>Index your articles</li>
            </ol>
          </div>
        )}
        
        <div className="space-y-2">
          <Link href="/articles">
            <Button variant="outline" className="w-full">
              Browse All Articles
            </Button>
          </Link>
          <Link href="/categories">
            <Button variant="ghost" className="w-full">
              Browse by Category
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Simple search input fallback
export const SearchBarFallback: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={className}>
      <Link href="/articles">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search not available - Browse articles"
            disabled
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>
      </Link>
    </div>
  );
};