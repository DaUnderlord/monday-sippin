'use client';

import { useEffect, useRef } from 'react';
import { trackReadingProgress, trackTimeOnPage } from '@/lib/analytics';

interface ReadingProgressTrackerProps {
  articleId: string;
  contentSelector?: string;
}

export default function ReadingProgressTracker({ 
  articleId, 
  contentSelector = '[data-article-content]' 
}: ReadingProgressTrackerProps) {
  const startTimeRef = useRef<number>(Date.now());
  const trackedPercentagesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const contentElement = document.querySelector(contentSelector);
    if (!contentElement) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          
          // Calculate reading progress based on content element
          const contentRect = contentElement.getBoundingClientRect();
          const contentTop = contentRect.top + scrollTop;
          const contentHeight = contentRect.height;
          
          // Calculate percentage of content read
          const contentScrolled = Math.max(0, scrollTop + windowHeight - contentTop);
          const percentage = Math.min(100, Math.round((contentScrolled / contentHeight) * 100));
          
          // Track at 25%, 50%, 75%, and 100%
          const milestones = [25, 50, 75, 100];
          milestones.forEach(milestone => {
            if (percentage >= milestone && !trackedPercentagesRef.current.has(milestone)) {
              trackedPercentagesRef.current.add(milestone);
              trackReadingProgress(articleId, milestone);
            }
          });

          ticking = false;
        });
        ticking = true;
      }
    };

    // Track time on page when user leaves
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      trackTimeOnPage(timeSpent, 'article');
    };

    // Track time on page when component unmounts
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        trackTimeOnPage(timeSpent, 'article');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Track final time on page
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      trackTimeOnPage(timeSpent, 'article');
    };
  }, [articleId, contentSelector]);

  return null; // This component doesn't render anything
}