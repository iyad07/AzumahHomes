
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bed, Bath, Maximize, Star, MapPin, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase, Property } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import SEO from "@/components/SEO";

const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();
  
        if (error) {
          if (error.code === 'PGRST116') {
            // No rows returned (property not found)
            setProperty(null);
          } else {
            throw error;
          }
        } else if (data) {
          setProperty(data);
        }
      } catch (error: any) {
        console.error('Error fetching property:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load property details. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, toast]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (property) {
      addToCart(property.id);
    }
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
          <div className="relative">
            <img 
              src={property.image} 
              alt={property.title}
              className="w-full h-[300px] md:h-[500px] object-cover rounded-lg"
            />
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

            <div className="text-xl md:text-3xl font-bold text-real-blue mb-4 md:mb-8">
              {formatPrice(property.price)}
            </div>

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
              <Link 
                to={`/agents/${property.user_id}`} 
                className="flex-1 bg-real-orange text-white py-2 md:py-3 px-4 md:px-6 rounded-md hover:bg-orange-600 transition-colors text-center font-medium text-sm md:text-base"
              >
                Contact Agent
              </Link>
              
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
    </div>
  );
};

export default PropertyDetailPage;
