
import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Square, Star, ShoppingCart, ArrowLeft, ArrowRight, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useProperties } from "@/hooks/useProperties";
import { formatPrice } from "@/utils/paymentCalculations";
import { PropertyCategory, getPropertyMainImage } from "@/types/property";
import { useState } from "react";
import { cn } from "@/lib/utils";

const FeaturedProperties = () => {
  const { properties: allProperties, loading } = useProperties({ 
    limit: 6 
  });
  
  // Filter for popular properties, fallback to all properties if none are popular
  const properties = allProperties.filter(p => p.isPopular).length > 0 
    ? allProperties.filter(p => p.isPopular) 
    : allProperties;
  const { addToCart, isInCart } = useCart();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;

  const totalPages = Math.ceil(properties.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + itemsPerPage >= properties.length 
        ? 0 
        : prevIndex + itemsPerPage
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - itemsPerPage < 0 
        ? properties.length - (properties.length % itemsPerPage || itemsPerPage) 
        : prevIndex - itemsPerPage
    );
  };

  const visibleProperties = properties.slice(
    currentIndex,
    currentIndex + itemsPerPage
  );



  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="section-title">Featured Listings</h2>
            <p className="section-subtitle">
              Discover our handpicked selection of exceptional properties
            </p>
          </div>

          <div className="flex gap-2 mt-6 md:mt-0">
            <button 
              onClick={prevSlide}
              className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Previous properties"
              disabled={loading || properties.length <= itemsPerPage}
            >
              <ArrowLeft size={20} />
            </button>
            <button 
              onClick={nextSlide}
              className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Next properties"
              disabled={loading || properties.length <= itemsPerPage}
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Loading featured properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">No properties found. Add some properties to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleProperties.map((property) => (
              <div key={property.id} className="property-card">
                <div className="relative overflow-hidden">
                  <img 
                    src={getPropertyMainImage(property)} 
                    alt={property.title}
                    className="property-image"
                  />
                  <div className="property-badge bg-real-orange text-white">
                    {property.tag}
                  </div>
                  {property.isPopular && (
                    <div className="property-badge bg-real-orange text-white" style={{ left: 'auto', right: '16px' }}>
                      Popular
                    </div>
                  )}
                  {property.isNew && (
                    <div className="property-badge bg-real-green text-white" style={{ left: 'auto', right: '16px' }}>
                      New
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-white py-1 px-3 rounded-full flex items-center gap-1 text-sm">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span>{property.rating}</span>
                  </div>
                </div>
                
                <div className="property-details">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="property-title">{property.title}</h3>
                    <div className="text-right">
                      <span className="text-real-blue font-semibold block">
                        {formatPrice(property.price)}
                      </span>
                      {property.tag === PropertyCategory.FOR_SALE && (
                        <span className="text-green-600 text-sm font-medium">
                          50% accepted {formatPrice(property.price / 2)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="property-location">
                    <MapPin size={16} className="mr-1" />
                    {property.location}
                  </div>
                  
                  <div className="property-meta">
                    {property.beds > 0 && (
                      <div className="meta-item">
                        <Bed size={16} />
                        <span>{property.beds} Beds</span>
                      </div>
                    )}
                    
                    <div className="meta-item">
                      <Bath size={16} />
                      <span>{property.baths} Baths</span>
                    </div>
                  </div>
                </div>
                
                <Link
                  to={`/properties/${property.id}`}
                  state={{ property: property }}
                  className="absolute inset-0"
                  aria-label={`View details for ${property.title}`}
                />
              </div>
            ))}
          </div>
        )}

        {!loading && properties.length > itemsPerPage && (
          <div className="mt-10 flex justify-center">
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index * itemsPerPage)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-colors",
                    currentIndex === index * itemsPerPage
                      ? "bg-real-orange"
                      : "bg-gray-300"
                  )}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProperties;

// Import needed for MapPin icon
//import { MapPin } from "lucide-react";
