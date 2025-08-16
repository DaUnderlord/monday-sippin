import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { mockCategories } from '@/lib/mock-content';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  color?: string;
  created_at: string;
}

export const useCategories = (initial?: Category[]) => {
  const [categories, setCategories] = useState<Category[]>(initial ?? []);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial && initial.length > 0) {
      // We already have data from the server. Do not refetch on mount.
      return;
    }
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) throw error;
        // If DB returns empty, use mock categories to populate UI
        if (!data || data.length === 0) {
          setCategories(mockCategories);
        } else {
          setCategories(data);
        }
      } catch (err) {
        // Keep error state but hydrate UI with mocks so pages render
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[useCategories] Falling back to mock categories due to error:', err);
        }
        setCategories(mockCategories);
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [initial]);

  return { categories, loading, error };
};