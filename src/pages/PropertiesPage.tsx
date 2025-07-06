import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize, Star, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { supabase, Property } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import SEO from "@/components/SEO";

// Add these imports
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart } from 'lucide-react';

const PropertiesPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  // Add these hooks at the component level
  const { user, isAdmin } = useAuth();
  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*');

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
          description: 'Failed to load properties. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [toast]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const [sortBy, setSortBy] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const sortOptions = [
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'date', label: 'Latest' }
  ];

  const currentSortLabel = sortOptions.find(option => option.value === sortBy)?.label || 'Sort By';

  const sortedAndFilteredProperties = [...properties]
    .filter(property => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        property.title.toLowerCase().includes(searchLower) ||
        property.location.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <SEO 
        title="Properties for Sale & Rent in Ghana | Azumah Homes"
        description="Browse our extensive collection of properties for sale and rent in Ghana. Find apartments, houses, commercial properties in Accra, Kumasi and other prime locations."
        keywords="properties for sale Ghana, houses for rent, apartments Ghana, commercial properties, Accra real estate, Kumasi properties"
        url="https://azumahhomes.vercel.app/properties"
      />
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Properties</h1>
            <p className="text-gray-600">Find your perfect property from our listings</p>
          </div>
          <div className="flex gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[180px] justify-between">
                  {currentSortLabel}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[180px]">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Input 
              type="search" 
              placeholder="Search properties..."
              className="max-w-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Loading properties...</p>
          </div>
        ) : sortedAndFilteredProperties.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">No properties found. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedAndFilteredProperties.map((property) => (
              <div key={property.id} className="property-card relative bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                {/* Add to cart button for non-admin users */}
                {user && !isAdmin && (
                  <div className="absolute top-4 right-4 z-10">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(property.id);
                      }}
                      className={`p-2 rounded-full shadow ${isInCart(property.id) ? 'bg-real-blue text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                      aria-label="Add to cart"
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                )}
                
                <div className="relative overflow-hidden">
                  <img 
                    src={property.image} 
                    alt={property.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-real-blue text-white py-1 px-3 rounded-full text-sm">
                    {property.tag}
                  </div>
                  {property.isPopular && (
                    <div className="absolute top-4 right-4 bg-real-orange text-white py-1 px-3 rounded-full text-sm">
                      Popular
                    </div>
                  )}
                  {property.isNew && (
                    <div className="absolute top-4 right-4 bg-real-green text-white py-1 px-3 rounded-full text-sm">
                      New
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-white py-1 px-3 rounded-full flex items-center gap-1 text-sm">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span>{property.rating}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{property.title}</h3>
                    <span className="text-real-blue font-semibold">
                      {formatPrice(property.price)}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin size={16} className="mr-1" />
                    {property.location}
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    {property.beds > 0 && (
                      <div className="flex items-center gap-1">
                        <Bed size={16} />
                        <span>{property.beds} Beds</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Bath size={16} />
                      <span>{property.baths} Baths</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Maximize size={16} />
                      <span>{property.sqft} sq ft</span>
                    </div>
                  </div>
                </div>
                
                {/* Add to cart button at the bottom of the card */}
                {user && !isAdmin && (
                  <div className="mt-4">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(property.id);
                      }}
                      className={`w-full py-2 rounded-md transition-colors ${isInCart(property.id) ? 'bg-gray-200 text-gray-700' : 'bg-real-blue text-white hover:bg-blue-700'}`}
                      disabled={isInCart(property.id)}
                    >
                      {isInCart(property.id) ? 'Added to Cart' : 'Add to Cart'}
                    </button>
                  </div>
                )}
                
                <Link
                  to={`/properties/${property.id}`}
                  state={{ property }}
                  className="absolute inset-0"
                  aria-label={`View details for ${property.title}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPage;
