import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Star, ShoppingCart, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Property } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/utils/paymentCalculations';
import { PropertyCategory, PropertyType } from '@/types/property';
import { getPropertyImages, getPropertyMainImage } from '@/types/property';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface PropertyCardProps {
  property: Property;
  className?: string;
  showAddToCart?: boolean;
  imageHeight?: string;
}

const PropertyCard = ({ 
  property, 
  className, 
  showAddToCart = true,
  imageHeight = 'h-64'
}: PropertyCardProps) => {
  const { addToCart, isInCart } = useCart();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get all images for this property
  const propertyImages = getPropertyImages(property);
  const hasMultipleImages = propertyImages.length > 1;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInCart(property.id)) {
      toast({
        title: 'Already in cart',
        description: 'This property is already in your cart.',
        variant: 'default',
      });
      return;
    }

    addToCart(property.id);
    toast({
      title: 'Added to cart',
      description: `${property.title} has been added to your cart.`,
      variant: 'default',
    });
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? propertyImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === propertyImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <Card className={cn('group hover:shadow-lg transition-all duration-300', className)}>
      <Link to={`/property/${property.id}`} className="block">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={propertyImages[currentImageIndex]}
            alt={`${property.title} - Image ${currentImageIndex + 1}`}
            className={cn(
              'w-full object-cover transition-transform duration-300 group-hover:scale-105 shadow-lg',
              imageHeight
            )}
          />
          
          {/* Image navigation arrows - only show if multiple images */}
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
          
          {/* Image indicators - only show if multiple images */}
          {hasMultipleImages && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {propertyImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-300',
                    index === currentImageIndex 
                      ? 'bg-white' 
                      : 'bg-white/50 hover:bg-white/75'
                  )}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
          
          {/* Property badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {property.isNew && (
              <Badge className="bg-green-500 hover:bg-green-600 text-white">
                New
              </Badge>
            )}
            {property.isPopular && (
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                Popular
              </Badge>
            )}
          </div>
          
          {/* Property category */}
          <div className="absolute top-4 right-4">
            <Badge 
              variant={property.tag === PropertyCategory.FOR_SALE ? 'default' : 'secondary'}
              className={property.tag === PropertyCategory.FOR_SALE ? 'bg-blue-500 hover:bg-blue-600' : ''}
            >
              {property.tag}
            </Badge>
          </div>
          
          {/* Add to cart button */}
          {showAddToCart && (
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="sm"
                onClick={handleAddToCart}
                className={cn(
                  'bg-white text-gray-800 hover:bg-gray-100 shadow-md',
                  isInCart(property.id) && 'bg-green-100 text-green-800'
                )}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <CardContent className="p-4 md:p-6">
          {/* Property title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>
          
          {/* Location */}
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{property.location}</span>
          </div>
          
          {/* Property features */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{property.beds}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{property.baths}</span>
            </div>
            {property.type && (
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">
                  {property.type}
                </Badge>
              </div>
            )}
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-4">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{property.rating}</span>
            <span className="text-sm text-gray-500">(4.5)</span>
          </div>
          
          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl md:text-2xl font-bold text-gray-900">
                {formatPrice(property.price)}
                {property.tag === PropertyCategory.FOR_RENT && (
                  <span className="text-sm font-normal text-gray-600">/month</span>
                )}
              </div>
              {property.tag === PropertyCategory.FOR_SALE && (
                <div className="text-green-600 text-sm font-medium mt-1">
                  50% accepted {formatPrice(property.price / 2)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default PropertyCard;