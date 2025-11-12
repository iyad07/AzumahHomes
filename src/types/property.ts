// Property type definitions and enums for better type safety

export enum PropertyType {
  APARTMENT = 'Apartment',
  HOUSE = 'House'
}

export enum PropertyCategory {
  FOR_SALE = 'For Sale',
  FOR_RENT = 'For Rent'
}

// Enhanced Property interface with proper typing
export interface EnhancedProperty {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  image: string; // Keep for backward compatibility
  images?: string[]; // New field for multiple images
  beds: number;
  baths: number;
  type: PropertyType; // New field for property type
  tag: PropertyCategory; // Existing field with enum
  maxPaymentPlanMonths?: number;
  rating: number;
  isPopular: boolean;
  isNew: boolean;
  created_at: string;
  user_id: string;
}

// Utility functions for image handling
export const getPropertyImages = (property: EnhancedProperty): string[] => {
  // If images array exists and has content, use it
  if (property.images && property.images.length > 0) {
    return property.images;
  }
  // Fall back to single image field for backward compatibility
  if (property.image) {
    return [property.image];
  }
  // Return empty array if no images
  return [];
};

export const getPropertyMainImage = (property: EnhancedProperty): string => {
  const images = getPropertyImages(property);
  return images.length > 0 ? images[0] : '';
};

// Type guards for runtime type checking
export const isPropertyType = (value: string): value is PropertyType => {
  return Object.values(PropertyType).includes(value as PropertyType);
};

export const isPropertyCategory = (value: string): value is PropertyCategory => {
  return Object.values(PropertyCategory).includes(value as PropertyCategory);
};