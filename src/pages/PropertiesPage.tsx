import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, MapPin, Bed, Bath, Square, Heart, ShoppingCart, ChevronDown, Maximize, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Property } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useProperties } from "@/hooks/useProperties";
import { formatPrice } from "@/utils/paymentCalculations";
import { PropertyCategory } from "@/types/property";
import SEO from "@/components/SEO";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";

const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart, isInCart } = useCart();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  // Get filter values from URL params
  const category = searchParams.get('category');
  const type = searchParams.get('type');
  
  const [filters, setFilters] = useState({
    tag: category || '',
    type: type || '',
    minPrice: '',
    maxPrice: '',
    beds: '',
    baths: ''
  });

  // Use the custom hook for properties
  const { 
    properties, 
    filteredProperties: hookFilteredProperties, 
    loading, 
    searchProperties 
  } = useProperties({
    searchTerm,
    type: filters.type,
    category: filters.tag,
    minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined
  });

  // Additional filtering for beds and baths (not in the hook yet)
  const filteredProperties = hookFilteredProperties.filter(property => {
    if (filters.beds && property.beds < parseInt(filters.beds)) return false;
    if (filters.baths && property.baths < parseInt(filters.baths)) return false;
    return true;
  });

  useEffect(() => {
    // Update filters when URL params change
    setFilters(prev => ({
      ...prev,
      tag: category || '',
      type: type || ''
    }));
  }, [category, type]);



  const [sortBy, setSortBy] = useState('');
  
  const sortOptions = [
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'date', label: 'Latest' }
  ];

  const currentSortLabel = sortOptions.find(option => option.value === sortBy)?.label || 'Sort By';
  
  const clearFilters = () => {
    setFilters({ tag: '', type: '', minPrice: '', maxPrice: '', beds: '', baths: '' });
    setSearchTerm('');
    window.history.pushState({}, '', '/properties');
  };

  const sortedAndFilteredProperties = filteredProperties
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'date':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
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
            
            {/* Show active filters */}
            {(filters.tag || filters.type || filters.minPrice || filters.maxPrice || filters.beds || filters.baths) && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filters.tag && (
                  <span className="bg-real-orange text-white px-2 py-1 rounded text-sm">
                    Category: {filters.tag}
                  </span>
                )}
                {filters.type && (
                  <span className="bg-real-orange text-white px-2 py-1 rounded text-sm">
                    Type: {filters.type}
                  </span>
                )}
                {filters.minPrice && (
                  <span className="bg-real-blue text-white px-2 py-1 rounded text-sm">
                    Min: {formatPrice(parseInt(filters.minPrice))}
                  </span>
                )}
                {filters.maxPrice && (
                  <span className="bg-real-blue text-white px-2 py-1 rounded text-sm">
                    Max: {formatPrice(parseInt(filters.maxPrice))}
                  </span>
                )}
                {filters.beds && (
                  <span className="bg-real-blue text-white px-2 py-1 rounded text-sm">
                    Beds: {filters.beds}+
                  </span>
                )}
                {filters.baths && (
                  <span className="bg-real-blue text-white px-2 py-1 rounded text-sm">
                    Baths: {filters.baths}+
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600"
                >
                  Clear All
                </button>
              </div>
            )}
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                <div className="relative overflow-hidden">
                  <img 
                    src={property.image} 
                    alt={property.title}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-300 shadow-lg"
                  />
                  
                  {/* Property badges - left side */}
                  <div className="absolute top-4 left-4 bg-real-orange text-white py-1 px-3 rounded-full text-sm">
                    {property.tag}
                  </div>
                  
                  {/* Property status badges - right side with proper stacking */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    {user && !isAdmin && (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToCart(property.id);
                        }}
                        className={`p-2 rounded-full shadow z-20 ${isInCart(property.id) ? 'bg-real-orange text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                        aria-label="Add to cart"
                      >
                        <ShoppingCart size={16} />
                      </button>
                    )}
                    {property.isPopular && (
                      <div className="bg-real-orange text-white py-1 px-3 rounded-full text-sm">
                        Popular
                      </div>
                    )}
                    {property.isNew && (
                      <div className="bg-green-500 text-white py-1 px-3 rounded-full text-sm">
                        New
                      </div>
                    )}
                  </div>
                  
                  {/* Rating badge - bottom left */}
                  <div className="absolute bottom-4 left-4 bg-white py-1 px-3 rounded-full flex items-center gap-1 text-sm">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span>{property.rating}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{property.title}</h3>
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
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin size={16} className="mr-1" />
                    {property.location}
                  </div>
                  
                  <div className="flex justify-between text-gray-600 mb-4">
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
                  
                  {/* Add to cart button at the bottom of the card */}
                  {user && !isAdmin && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(property.id);
                      }}
                      className={`w-full py-2 rounded-md transition-colors ${isInCart(property.id) ? 'bg-gray-200 text-gray-700' : 'bg-real-orange text-white hover:bg-orange-600'}`}
                      disabled={isInCart(property.id)}
                    >
                      {isInCart(property.id) ? 'Added to Cart' : 'Add to Cart'}
                    </button>
                  )}
                </div>
                
                <Link
                  to={`/properties/${property.id}`}
                  state={{ property }}
                  className="absolute inset-0 z-10"
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
