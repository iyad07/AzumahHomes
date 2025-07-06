
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bed, Bath, Maximize, Star, ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase, Property } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

// Sample property data
const properties = [
  {
    id: 1,
    title: "Modern Apartment with Sea View",
    location: "New York City, NY",
    price: 240000,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    beds: 3,
    baths: 2,
    sqft: 1200,
    tag: "For Sale",
    rating: 4.8,
    isPopular: true,
    isNew: false,
  },
  {
    id: 2,
    title: "Luxury Villa with Pool",
    location: "Miami, FL",
    price: 850000,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1175&q=80",
    beds: 5,
    baths: 4,
    sqft: 3500,
    tag: "For Sale",
    rating: 4.9,
    isPopular: true,
    isNew: false,
  },
  {
    id: 3,
    title: "Cozy Studio in Downtown",
    location: "Chicago, IL",
    price: 120000,
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80",
    beds: 1,
    baths: 1,
    sqft: 600,
    tag: "For Rent",
    rating: 4.5,
    isPopular: false,
    isNew: true,
  },
  {
    id: 4,
    title: "Family House with Garden",
    location: "Seattle, WA",
    price: 450000,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    beds: 4,
    baths: 3,
    sqft: 2200,
    tag: "For Sale",
    rating: 4.7,
    isPopular: false,
    isNew: true,
  },
  {
    id: 5,
    title: "Modern Office Space",
    location: "Austin, TX",
    price: 350000,
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80",
    beds: 0,
    baths: 2,
    sqft: 1500,
    tag: "For Rent",
    rating: 4.6,
    isPopular: false,
    isNew: false,
  },
  {
    id: 6,
    title: "Penthouse with City Views",
    location: "Los Angeles, CA",
    price: 980000,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80",
    beds: 3,
    baths: 3,
    sqft: 2000,
    tag: "For Sale",
    rating: 4.9,
    isPopular: true,
    isNew: false,
  }
];

const FeaturedProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('rating', { ascending: false }) // Get highest rated properties first
          .limit(6); // Limit to 6 featured properties

        if (error) {
          throw error;
        }

        if (data) {
          setProperties(data);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast({
          title: 'Error',
          description: 'Failed to load featured properties. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [toast]);

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

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
                    src={property.image} 
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
                    <span className="text-real-blue font-semibold">
                      {formatPrice(property.price)}
                    </span>
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
                    
                    <div className="meta-item">
                      <Maximize size={16} />
                      <span>{property.sqft} sq ft</span>
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
