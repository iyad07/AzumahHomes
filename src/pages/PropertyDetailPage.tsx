
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Star, ArrowLeft, ShoppingCart, Heart, Calendar, Maximize, ChevronLeft, ChevronRight, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Property } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import { useProperty } from '@/hooks/useProperties';
import { formatPrice } from '@/utils/paymentCalculations';
import { PropertyCategory, getPropertyImages } from '@/types/property';
import SEO from '@/components/SEO';
import ContactAgentModal from '@/components/ContactAgentModal';
import { cn } from '@/lib/utils';

const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedPaymentPeriod, setSelectedPaymentPeriod] = useState(12);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authAction, setAuthAction] = useState<'whatsapp' | 'contact' | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const { toast } = useToast();
  const { addToCart, isInCart } = useCart();
  const { user, isAdmin } = useAuth();
  
  // Use the custom hook for fetching property
  const { property, loading, error } = useProperty(id || '');
  
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load property details.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Update selectedPaymentPeriod when property loads
  useEffect(() => {
    if (property && property.tag === PropertyCategory.FOR_SALE) {
      const maxMonths = property.maxPaymentPlanMonths || 12;
      // Set to the middle option (50% of max months, minimum 6)
      const defaultPeriod = Math.max(6, Math.round(maxMonths * 0.5));
      setSelectedPaymentPeriod(defaultPeriod);
    }
  }, [property]);

  // Get all images for this property
  const propertyImages = property ? getPropertyImages(property) : [];
  const hasMultipleImages = propertyImages.length > 1;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? propertyImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === propertyImages.length - 1 ? 0 : prev + 1
    );
  };

  const openImageModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  const handleAddToCart = () => {
    if (property) {
      addToCart(property.id);
    }
  };

  const handleContactAgent = () => {
    if (user) {
      // User is logged in, show contact modal
      setIsContactModalOpen(true);
    } else {
      // User is not logged in, show auth modal
      setAuthAction('contact');
      setIsAuthModalOpen(true);
    }
  };

  const handleWhatsAppContact = () => {
    if (!property) return;
    
    if (!user) {
      setAuthAction('whatsapp');
      setIsAuthModalOpen(true);
      return;
    }
    
    let message = `Hi! I'm interested in this property:\n\n`;
    message += `🏠 *${property.title}*\n`;
    message += `📍 Location: ${property.location}\n`;
    message += `💰 Price: ${formatPrice(property.price)}\n`;
    
    if (property.beds > 0) {
      message += `🛏️ Bedrooms: ${property.beds}\n`;
    }
    message += `🚿 Bathrooms: ${property.baths}\n`;
    message += `📐 Size: ${property.sqft} sq ft\n`;
    
    if (property.tag === PropertyCategory.FOR_SALE) {
      message += `\n💳 *Payment Plan Details:*\n`;
      message += `• Initial Payment (50%): ${formatPrice(property.price / 2)}\n`;
      message += `• Selected Plan: ${selectedPaymentPeriod} months\n`;
      message += `• Monthly Payment: ${formatPrice((property.price / 2) / selectedPaymentPeriod)}\n`;
    }
    
    const propertyUrl = window.location.href
      .replace('http://localhost:5173', 'https://azumah-homes-mu.vercel.app')
      .replace('https://localhost:5173', 'https://azumah-homes-mu.vercel.app')
      .replace('http://localhost:8081', 'https://azumah-homes-mu.vercel.app')
      .replace('https://localhost:8081', 'https://azumah-homes-mu.vercel.app');
    message += `\n🔗 *Property Link:*\n${propertyUrl}\n`;
    message += `\nCould you please provide more information about this property?`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/233551319363?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handleAuthSuccess = () => {
    if (authAction === 'whatsapp') {
      // After successful login, automatically trigger WhatsApp contact
      handleWhatsAppContact();
    } else if (authAction === 'contact') {
      // After successful login, show contact modal
      setIsContactModalOpen(true);
    }
    setAuthAction(null);
  };

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);
    setAuthAction(null);
  };

  if (loading) {
    return (
      <div className="pt-24 md:pt-32 pb-12 md:pb-20 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm md:text-base">Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="pt-24 md:pt-32 pb-12 md:pb-20 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">Property Not Found</h1>
            <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">The property you're looking for doesn't exist or has been removed.</p>
            <Link to="/properties">
              <Button className="text-sm md:text-base">
                <ArrowLeft className="mr-2" size={16} />
                Back to Properties
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-12 md:pb-20 min-h-screen">
      <div className="container mx-auto px-4">
        <Link to="/properties" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 md:mb-8">
          <ArrowLeft className="mr-2" size={16} />
          <span className="text-sm md:text-base">Back to Properties</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative group">
              <img 
                src={propertyImages[currentImageIndex]} 
                alt={`${property.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-[400px] md:h-[600px] lg:h-[700px] object-cover rounded-lg shadow-lg cursor-pointer"
                onClick={() => openImageModal(currentImageIndex)}
              />
              
              {/* Navigation Arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              
              {/* Property Tags */}
              <div className="absolute top-4 left-4 bg-real-orange text-white py-1 px-3 rounded-full text-xs md:text-sm">
                {property.tag}
              </div>
              {property.isPopular && (
                <div className="absolute top-4 right-4 bg-real-orange text-white py-1 px-3 rounded-full text-xs md:text-sm">
                  Popular
                </div>
              )}
              {property.isNew && (
                <div className="absolute top-4 right-4 bg-real-green text-white py-1 px-3 rounded-full text-xs md:text-sm">
                  New
                </div>
              )}
              
              {/* Image Counter */}
              {hasMultipleImages && (
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {currentImageIndex + 1} / {propertyImages.length}
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {hasMultipleImages && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {propertyImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                      currentImageIndex === index 
                        ? "border-real-orange" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <img
                      src={image}
                      alt={`${property.title} - Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Star size={18} className="text-yellow-400 fill-yellow-400" />
              <span className="text-base md:text-lg">{property.rating} Rating</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">{property.title}</h1>
            
            <div className="flex items-center text-gray-600 mb-4 md:mb-6">
              <MapPin size={18} className="mr-2" />
              <span className="text-sm md:text-base">{property.location}</span>
            </div>

            <div className="mb-4 md:mb-8">
              <div className="text-xl md:text-3xl font-bold text-real-blue">
                {formatPrice(property.price)}
              </div>
              {property.tag === PropertyCategory.FOR_SALE && (
                <div className="text-green-600 text-sm md:text-base font-medium mt-1">
                  50% accepted {formatPrice(property.price / 2)}
                </div>
              )}
            </div>

            {/* Payment Plan Section - Only for properties For Sale */}
            {property.tag === PropertyCategory.FOR_SALE && (
              <div className="bg-gray-50 p-4 md:p-6 rounded-lg mb-6 md:mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={20} className="text-real-orange" />
                  <h3 className="text-lg md:text-xl font-semibold">Payment Plan</h3>
                </div>
                
                <p className="text-gray-600 text-sm md:text-base mb-4">
                  Choose your preferred payment period for the remaining 50% ({formatPrice((property.price + 50000) / 2)})
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  {(() => {
                    // Generate payment plan options based on maxPaymentPlanMonths
                    const maxMonths = property.maxPaymentPlanMonths || 12; // Default to 12 if not set
                    const options = [];
                    
                    // Always start with 4 months
                    options.push(4);
                    
                    // Generate options in multiples of 4 up to the maximum
                    for (let months = 8; months <= maxMonths; months += 4) {
                      options.push(months);
                      if (options.length >= 3) break;
                    }
                    
                    // If we still don't have 3 options and maxMonths is not a multiple of 4,
                    // add the maxMonths as the final option
                    if (options.length < 3 && maxMonths % 4 !== 0 && !options.includes(maxMonths)) {
                      options.push(maxMonths);
                    }
                    
                    // Take first 3 options
                    const finalOptions = options.slice(0, 3);
                    
                    return finalOptions.map((months) => {
                      // Add 50,000 to property price for payment plan calculations
                      const adjustedPrice = property.price + 50000;
                      const monthlyPayment = (adjustedPrice / 2) / months;
                      const isSelected = selectedPaymentPeriod === months;
                      
                      return (
                        <button
                          key={months}
                          onClick={() => setSelectedPaymentPeriod(months)}
                          className={`p-3 md:p-4 rounded-lg border-2 transition-all text-left ${
                            isSelected 
                              ? 'border-real-orange bg-orange-50 text-real-orange' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="font-semibold text-sm md:text-base">{months} Months</div>
                          <div className="text-xs md:text-sm text-gray-600 mt-1">
                            {formatPrice(monthlyPayment)}/month
                          </div>
                        </button>
                      );
                    });
                  })()}
                </div>
                
                <div className="mt-4 p-3 md:p-4 bg-white rounded-lg border">
                  <div className="text-sm md:text-base text-gray-600">
                    Selected Plan: <span className="font-semibold text-gray-900">{selectedPaymentPeriod} months</span>
                  </div>
                  <div className="text-lg md:text-xl font-bold text-real-orange mt-1">
                    {formatPrice(((property.price + 50000) / 2) / selectedPaymentPeriod)}/month
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 md:gap-6 p-4 md:p-6 bg-gray-50 rounded-lg mb-6 md:mb-8">
              {property.beds > 0 && (
                <div className="text-center">
                  <Bed size={20} className="mx-auto mb-1 md:mb-2" />
                  <div className="font-semibold text-sm md:text-base">{property.beds}</div>
                  <div className="text-gray-600 text-xs md:text-sm">Bedrooms</div>
                </div>
              )}
              <div className="text-center">
                <Bath size={20} className="mx-auto mb-1 md:mb-2" />
                <div className="font-semibold text-sm md:text-base">{property.baths}</div>
                <div className="text-gray-600 text-xs md:text-sm">Bathrooms</div>
              </div>
              <div className="text-center">
                <Maximize size={20} className="mx-auto mb-1 md:mb-2" />
                <div className="font-semibold text-sm md:text-base">{property.sqft}</div>
                <div className="text-gray-600 text-xs md:text-sm">Square Feet</div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mt-6">
              <button 
                onClick={handleContactAgent}
                className="flex-1 bg-real-orange text-white py-2 md:py-3 px-4 md:px-6 rounded-md hover:bg-orange-600 transition-colors text-center font-medium text-sm md:text-base"
              >
                Contact Agent
              </button>
              
              <button 
                onClick={handleWhatsAppContact}
                className="flex-1 bg-green-500 text-white py-2 md:py-3 px-4 md:px-6 rounded-md hover:bg-green-600 transition-colors text-center font-medium text-sm md:text-base"
              >
                <MessageCircle className="inline-block mr-2" size={16} />
                WhatsApp
              </button>
              
              {user && !isAdmin && (
                <button 
                  onClick={handleAddToCart}
                  disabled={property && isInCart(property.id)}
                  className={`flex-1 py-2 md:py-3 px-4 md:px-6 rounded-md transition-colors text-center font-medium text-sm md:text-base ${property && isInCart(property.id) ? 'bg-gray-200 text-gray-700' : 'bg-white border border-real-orange text-real-orange hover:bg-orange-50'}`}
                >
                  <ShoppingCart className="inline-block mr-2" size={16} />
                  {property && isInCart(property.id) ? 'Added to Cart' : 'Add to Cart'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Contact Agent Modal */}
      {/* Full-screen Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X size={32} />
            </button>
            
            <img
              src={propertyImages[currentImageIndex]}
              alt={`${property?.title} - Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
            
            {hasMultipleImages && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
                >
                  <ChevronRight size={24} />
                </button>
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded">
                  {currentImageIndex + 1} / {propertyImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      <ContactAgentModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        agentId={property?.user_id || ''}
        propertyTitle={property?.title || ''}
      />
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default PropertyDetailPage;
