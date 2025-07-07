import { useState, useEffect, useCallback } from 'react';
import { Property } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { 
  searchAndFilterProperties, 
  countPropertiesByType, 
  countPropertiesByCategory,
  filterByCategory,
  filterByType
} from '@/utils/propertyFilters';
import { PropertyCategory } from '@/types/property';

export interface UsePropertiesOptions {
  searchTerm?: string;
  type?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  featured?: boolean;
}

export interface UsePropertiesReturn {
  properties: Property[];
  filteredProperties: Property[];
  loading: boolean;
  error: string | null;
  typeCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  refetch: () => Promise<void>;
  searchProperties: (options: UsePropertiesOptions) => Property[];
}

export const useProperties = (options: UsePropertiesOptions = {}): UsePropertiesReturn => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('properties').select('*');

      // Apply featured filter if specified
      if (options.featured) {
        query = query.eq('isPopular', true);
      }

      // Apply limit if specified
      if (options.limit) {
        query = query.limit(options.limit);
      }

      // Order by created_at descending
      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setProperties(data || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  }, [options.featured, options.limit]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Filter properties based on current options
  const filteredProperties = searchAndFilterProperties(
    properties,
    options.searchTerm || '',
    options.type,
    options.category,
    options.minPrice,
    options.maxPrice
  );

  // Calculate counts
  const typeCounts = countPropertiesByType(properties);
  const categoryCounts = countPropertiesByCategory(properties);

  // Search function for dynamic filtering
  const searchProperties = useCallback((searchOptions: UsePropertiesOptions): Property[] => {
    return searchAndFilterProperties(
      properties,
      searchOptions.searchTerm || '',
      searchOptions.type,
      searchOptions.category,
      searchOptions.minPrice,
      searchOptions.maxPrice
    );
  }, [properties]);

  const refetch = useCallback(async () => {
    await fetchProperties();
  }, [fetchProperties]);

  return {
    properties,
    filteredProperties,
    loading,
    error,
    typeCounts,
    categoryCounts,
    refetch,
    searchProperties
  };
};

// Hook for fetching a single property
export const useProperty = (id: string) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        setProperty(data);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  return { property, loading, error };
};

// Hook for property statistics
export const usePropertyStats = () => {
  const { properties, loading } = useProperties();

  const stats = {
    total: properties.length,
    forSale: filterByCategory(properties, PropertyCategory.FOR_SALE).length,
    forRent: filterByCategory(properties, PropertyCategory.FOR_RENT).length,
    apartments: filterByType(properties, 'apartment').length,
    houses: filterByType(properties, 'house').length,
    featured: properties.filter(p => p.isPopular).length,
    new: properties.filter(p => p.isNew).length
  };

  return { stats, loading };
};