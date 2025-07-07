import { Property } from '@/lib/supabase';
import { PropertyType, PropertyCategory } from '@/types/property';

// Utility functions for property filtering
export const filterByType = (properties: Property[], type: string): Property[] => {
  if (!type) return properties;
  return properties.filter(p => 
    p.title?.toLowerCase().includes(type.toLowerCase()) ||
    // Fallback to checking title for property type until database schema is updated
    (type.toLowerCase() === 'apartment' && p.title?.toLowerCase().includes('apartment')) ||
    (type.toLowerCase() === 'house' && (p.title?.toLowerCase().includes('house') || p.title?.toLowerCase().includes('villa')))
  );
};

export const filterByCategory = (properties: Property[], category: PropertyCategory | string): Property[] => {
  if (!category) return properties;
  return properties.filter(p => p.tag === category);
};

export const filterForSaleProperties = (properties: Property[]): Property[] => {
  return properties.filter(p => p.tag === PropertyCategory.FOR_SALE);
};

export const filterForRentProperties = (properties: Property[]): Property[] => {
  return properties.filter(p => p.tag === PropertyCategory.FOR_RENT);
};

// Property counting utilities
export const countPropertiesByType = (properties: Property[]): Record<string, number> => {
  const counts: Record<string, number> = {
    apartment: 0,
    house: 0
  };
  
  properties.forEach(property => {
    const title = property.title?.toLowerCase() || '';
    if (title.includes('apartment')) {
      counts.apartment++;
    } else if (title.includes('house') || title.includes('villa')) {
      counts.house++;
    }
  });
  
  return counts;
};

export const countPropertiesByCategory = (properties: Property[]): Record<string, number> => {
  const counts: Record<string, number> = {
    'For Sale': 0,
    'For Rent': 0
  };
  
  properties.forEach(property => {
    if (property.tag === PropertyCategory.FOR_SALE) {
      counts['For Sale']++;
    } else if (property.tag === PropertyCategory.FOR_RENT) {
      counts['For Rent']++;
    }
  });
  
  return counts;
};

// Search and filter combination
export const searchAndFilterProperties = (
  properties: Property[],
  searchTerm: string,
  type?: string,
  category?: string,
  minPrice?: number,
  maxPrice?: number
): Property[] => {
  let filtered = properties;
  
  // Apply search term filter
  if (searchTerm) {
    filtered = filtered.filter(p => 
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Apply type filter
  if (type) {
    filtered = filterByType(filtered, type);
  }
  
  // Apply category filter
  if (category) {
    filtered = filterByCategory(filtered, category);
  }
  
  // Apply price range filter
  if (minPrice !== undefined) {
    filtered = filtered.filter(p => p.price >= minPrice);
  }
  
  if (maxPrice !== undefined) {
    filtered = filtered.filter(p => p.price <= maxPrice);
  }
  
  return filtered;
};