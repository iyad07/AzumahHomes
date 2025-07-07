import { Property } from '@/lib/supabase';
import { PropertyCategory } from '@/types/property';

// Payment calculation utilities
export interface PaymentBreakdown {
  subtotal: number;
  fees: number;
  total: number;
}

export interface RentalPaymentBreakdown extends PaymentBreakdown {
  monthlyRent: number;
  securityDeposit: number;
  applicationFee: number;
}

export interface SalePaymentBreakdown extends PaymentBreakdown {
  propertyPrice: number;
  downPaymentPercentage: number;
  downPayment: number;
  processingFee: number;
}

// Constants for payment calculations
export const PAYMENT_CONSTANTS = {
  SALE_DOWN_PAYMENT_PERCENTAGE: 0.5, // 50%
  RENTAL_APPLICATION_FEE: 50,
  SALE_PROCESSING_FEE: 100,
} as const;

// Calculate rental payment breakdown
export const calculateRentalPayment = (properties: Property[]): RentalPaymentBreakdown => {
  const monthlyRent = properties.reduce((total, property) => total + property.price, 0);
  const securityDeposit = monthlyRent; // Security deposit equals monthly rent
  const applicationFee = PAYMENT_CONSTANTS.RENTAL_APPLICATION_FEE;
  
  const subtotal = monthlyRent + securityDeposit;
  const fees = applicationFee;
  const total = subtotal + fees;
  
  return {
    monthlyRent,
    securityDeposit,
    applicationFee,
    subtotal,
    fees,
    total
  };
};

// Calculate sale payment breakdown
export const calculateSalePayment = (properties: Property[]): SalePaymentBreakdown => {
  const propertyPrice = properties.reduce((total, property) => total + property.price, 0);
  const downPaymentPercentage = PAYMENT_CONSTANTS.SALE_DOWN_PAYMENT_PERCENTAGE;
  const downPayment = propertyPrice * downPaymentPercentage;
  const processingFee = PAYMENT_CONSTANTS.SALE_PROCESSING_FEE;
  
  const subtotal = downPayment;
  const fees = processingFee;
  const total = subtotal + fees;
  
  return {
    propertyPrice,
    downPaymentPercentage,
    downPayment,
    processingFee,
    subtotal,
    fees,
    total
  };
};

// Calculate payment for mixed cart (both rental and sale properties)
export const calculateMixedPayment = (rentalProperties: Property[], saleProperties: Property[]) => {
  const rentalBreakdown = rentalProperties.length > 0 ? calculateRentalPayment(rentalProperties) : null;
  const saleBreakdown = saleProperties.length > 0 ? calculateSalePayment(saleProperties) : null;
  
  const totalAmount = (rentalBreakdown?.total || 0) + (saleBreakdown?.total || 0);
  
  return {
    rental: rentalBreakdown,
    sale: saleBreakdown,
    totalAmount,
    hasRentals: rentalProperties.length > 0,
    hasSales: saleProperties.length > 0
  };
};

// Format price utility
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

// Calculate percentage
export const calculatePercentage = (amount: number, percentage: number): number => {
  return amount * (percentage / 100);
};

// Validate payment amount
export const validatePaymentAmount = (amount: number): boolean => {
  return amount > 0 && Number.isFinite(amount);
};