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
  image: string;
  beds: number;
  baths: number;
  sqft: number;
  type: PropertyType; // New field for property type
  tag: PropertyCategory; // Existing field with enum
  rating: number;
  isPopular: boolean;
  isNew: boolean;
  created_at: string;
  user_id: string;
}

// Type guards for runtime type checking
export const isPropertyType = (value: string): value is PropertyType => {
  return Object.values(PropertyType).includes(value as PropertyType);
};

export const isPropertyCategory = (value: string): value is PropertyCategory => {
  return Object.values(PropertyCategory).includes(value as PropertyCategory);
};