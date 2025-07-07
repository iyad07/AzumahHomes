
import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, Property } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Bed, Bath, Maximize, Star, MapPin, Home, Heart, User, Clock, XIcon, X, Menu } from "lucide-react";
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart } from 'lucide-react';
import PaymentPage from './PaymentPage';
import { formatPrice } from "@/utils/paymentCalculations";

// Enhanced DashboardHome component with real data
const DashboardHome = () => {
  const { user, profile, isAdmin } = useAuth();
  const { cartItems } = useCart();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProperties = async () => {
      if (!user || !isAdmin) return; // Only fetch properties for admin users
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        if (data) {
          setProperties(data);
        }
      } catch (error) {
        console.error('Error fetching user properties:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your properties. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProperties();
  }, [user, toast, isAdmin]);



  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Dashboard Home</h2>
      
      {/* Welcome message with user email */}
      <div className="bg-orange-50 p-6 rounded-lg mb-8 border border-orange-100">
        <h3 className="text-xl font-medium mb-2">Welcome, {profile?.email}</h3>
        <p className="text-gray-600">
          {isAdmin 
            ? "Manage your real estate listings and favorites from your personal dashboard." 
            : "Browse properties and manage your favorites from your personal dashboard."}
        </p>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {isAdmin && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-full">
              <Home className="h-6 w-6 text-real-orange" />
              </div>
              <div>
                <h4 className="text-lg font-medium">My Properties</h4>
                <p className="text-3xl font-bold">{properties.length}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h4 className="text-lg font-medium">Favorites</h4>
              <p className="text-3xl font-bold">0</p>
            </div>
          </div>
        </div>
        
        {!isAdmin && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-full">
              <ShoppingCart className="h-6 w-6 text-real-orange" />
              </div>
              <div>
                <h4 className="text-lg font-medium">Cart Items</h4>
                <p className="text-3xl font-bold">{cartItems?.length || 0}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h4 className="text-lg font-medium">Account Type</h4>
              <p className="text-xl font-medium capitalize">{profile?.role || 'User'}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent properties - only show for admin users */}
      {isAdmin && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium">My Recent Properties</h3>
            <Link to="/dashboard/listings" className="text-real-orange hover:text-orange-600 text-sm font-medium">View All</Link>
          </div>
          
          {loading ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <p>Loading your properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <p>You haven't added any properties yet.</p>
              <Link to="/submit-listing" className="text-real-orange hover:text-orange-600 mt-2 inline-block">Add your first property</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.slice(0, 2).map((property) => (
                <div key={property.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex">
                  <img 
                    src={property.image} 
                    alt={property.title} 
                    className="w-24 h-24 object-cover rounded-md mr-4"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{property.title}</h4>
                    <div className="flex items-center text-gray-500 text-sm mb-2">
                      <MapPin size={14} className="mr-1" />
                      {property.location}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-real-orange font-medium">{formatPrice(property.price)}</span>
                      <Link to={`/properties/${property.id}`} className="text-sm text-real-orange hover:text-orange-600">View Details</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* For non-admin users, show recommended properties section instead */}
      {!isAdmin && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium">My Cart</h3>
            <Link to="/dashboard/cart" className="text-real-orange hover:text-orange-600 text-sm font-medium">View All</Link>
          </div>
          
          {!cartItems || cartItems.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <p>Your cart is empty.</p>
              <Link to="/properties" className="text-real-orange hover:text-orange-600 mt-2 inline-block">Browse properties</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cartItems?.slice(0, 2).map((item) => (
                <div key={item.property_id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex">
                  <img 
                    src={item.property.image} 
                    alt={item.property.title} 
                    className="w-24 h-24 object-cover rounded-md mr-4"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{item.property.title}</h4>
                    <div className="flex items-center text-gray-500 text-sm mb-2">
                      <MapPin size={14} className="mr-1" />
                      {item.property.location}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-real-orange font-medium">{formatPrice(item.property.price)}</span>
                      <Link to={`/properties/${item.property.id}`} className="text-sm text-real-orange hover:text-orange-600">View Details</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Quick actions - already has conditional rendering for admin/non-admin */}
      <div>
        <h3 className="text-xl font-medium mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isAdmin ? (
            <Link to="/submit-listing" className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-orange-300 transition-colors text-center">
            <Home className="h-6 w-6 mx-auto mb-2 text-real-orange" />
              <span className="font-medium">Add New Property</span>
            </Link>
          ) : (
            <Link to="/dashboard/cart" className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-orange-300 transition-colors text-center">
            <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-real-orange" />
              <span className="font-medium">View Cart {cartItems?.length > 0 && `(${cartItems.length})`}</span>
            </Link>
          )}
          <Link to="/dashboard/favorites" className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-purple-300 transition-colors text-center">
            <Heart className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <span className="font-medium">View Favorites</span>
          </Link>
          <Link to="/dashboard/settings" className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-green-300 transition-colors text-center">
            <User className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <span className="font-medium">Update Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

const MyListings = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProperties = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        if (data) {
          setProperties(data);
        }
      } catch (error) {
        console.error('Error fetching user properties:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your properties. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProperties();
  }, [user, toast]);

  const handleDeleteProperty = async (propertyId: number, propertyTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${propertyTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
        .eq('user_id', user?.id); // Extra security check

      if (error) throw error;

      // Remove the property from the local state
      setProperties(prev => prev.filter(property => property.id !== propertyId));
      
      toast({
        title: 'Success',
        description: 'Property deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete property. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">My Listings</h2>
        <Link 
          to="/submit-listing" 
          className="bg-real-orange hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Add New Property
        </Link>
      </div>

      {loading ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
          <p>Loading your properties...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
          <h3 className="text-xl font-medium mb-2">No Properties Found</h3>
          <p className="text-gray-600 mb-4">You haven't added any properties to your listings yet.</p>
          <Link 
            to="/submit-listing" 
            className="bg-real-orange hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Add Your First Property
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-12 gap-4 font-medium text-gray-600 hidden md:grid">
            <div className="col-span-5">Property</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Actions</div>
          </div>

          {properties.map((property) => (
            <div key={property.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Mobile view - stacked layout */}
              <div className="md:hidden space-y-3">
                <div className="flex items-center space-x-3">
                  <img 
                    src={property.image} 
                    alt={property.title} 
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div>
                    <h3 className="font-medium">{property.title}</h3>
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin size={14} className="mr-1" />
                      {property.location}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-500">Price</div>
                    <div className="font-medium text-real-orange">{formatPrice(property.price)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link 
                    to={`/properties/${property.id}`} 
                    className="text-real-orange hover:text-orange-600 text-sm font-medium px-3 py-1 border border-orange-200 rounded-md hover:bg-orange-50 transition-colors flex-1 text-center"
                  >
                    View
                  </Link>
                  <Link 
                    to={`/submit-listing?edit=${property.id}`} 
                    className="text-amber-600 hover:text-amber-800 text-sm font-medium px-3 py-1 border border-amber-200 rounded-md hover:bg-amber-50 transition-colors flex-1 text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteProperty(property.id, property.title)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 border border-red-200 rounded-md hover:bg-red-50 transition-colors flex-1"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Desktop view - grid layout */}
              <div className="col-span-5 hidden md:flex items-center space-x-3">
                <img 
                  src={property.image} 
                  alt={property.title} 
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div>
                  <h3 className="font-medium">{property.title}</h3>
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin size={14} className="mr-1" />
                    {property.location}
                  </div>
                </div>
              </div>
              <div className="col-span-2 hidden md:block font-medium text-real-orange">
                {formatPrice(property.price)}
              </div>
              <div className="col-span-2 hidden md:block">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <div className="col-span-3 hidden md:flex space-x-2">
                <Link 
                  to={`/properties/${property.id}`} 
                  className="text-real-orange hover:text-orange-600 text-sm font-medium px-3 py-1 border border-orange-200 rounded-md hover:bg-orange-50 transition-colors"
                >
                  View
                </Link>
                <Link 
                  to={`/submit-listing?edit=${property.id}`} 
                  className="text-amber-600 hover:text-amber-800 text-sm font-medium px-3 py-1 border border-amber-200 rounded-md hover:bg-amber-50 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteProperty(property.id, property.title)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        // First get the favorite property IDs for this user
        const { data: favoriteData, error: favoriteError } = await supabase
          .from('user_favorites')
          .select('property_id')
          .eq('user_id', user.id);

        if (favoriteError) throw favoriteError;
        
        if (favoriteData && favoriteData.length > 0) {
          // Get the property details for each favorite
          const propertyIds = favoriteData.map(fav => fav.property_id);
          
          const { data: propertyData, error: propertyError } = await supabase
            .from('properties')
            .select('*')
            .in('id', propertyIds);

          if (propertyError) throw propertyError;
          
          if (propertyData) {
            setFavorites(propertyData);
          }
        } else {
          // User has no favorites
          setFavorites([]);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your favorite properties',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, toast]);

  const removeFavorite = async (propertyId: number) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) throw error;
      
      // Update the UI by removing the property from the list
      setFavorites(favorites.filter(property => property.id !== propertyId));
      
      toast({
        title: 'Success',
        description: 'Property removed from favorites',
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove property from favorites',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">My Favorite Properties</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-real-orange"></div>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Favorites Yet</h3>
          <p className="text-gray-500 mb-6">You haven't added any properties to your favorites yet.</p>
          <Link to="/properties">
            <button className="bg-real-orange hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Browse Properties</button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {favorites.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="relative">
                <img 
                  src={property.image} 
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      removeFavorite(property.id);
                    }}
                    className="bg-white p-1.5 rounded-full shadow hover:bg-gray-100"
                  >
                    <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <Link to={`/properties/${property.id}`} state={{ property }}>
                  <h3 className="font-bold text-lg mb-2 hover:text-real-blue transition-colors">{property.title}</h3>
                </Link>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin size={16} className="mr-1" />
                  <span className="text-sm">{property.location}</span>
                </div>
                
                <div className="text-real-blue font-bold text-lg mb-3">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(property.price)}
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  {property.beds > 0 && (
                    <div className="flex items-center">
                      <Bed size={16} className="mr-1" />
                      <span>{property.beds} Beds</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Bath size={16} className="mr-1" />
                    <span>{property.baths} Baths</span>
                  </div>
                  <div className="flex items-center">
                    <Maximize size={16} className="mr-1" />
                    <span>{property.sqft} sqft</span>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <Link 
                    to={`/properties/${property.id}`} 
                    state={{ property }}
                    className="flex-1"
                  >
                    <button className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">View Details</button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProfileSettings = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    bio: ''
  });

  useEffect(() => {
    const fetchExtendedProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        // Initialize form with existing data
        setFormData({
          fullName: data.full_name || '',
          email: user.email || '',
          phone: data.phone || '',
          address: data.address || '',
          bio: data.bio || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your profile information',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExtendedProfile();
  }, [user, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setUpdating(true);
      
      // Log the data being sent for debugging
      console.log('Updating profile with data:', {
        full_name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
        updated_at: new Date().toISOString()
      });
      
      // Update profile in Supabase
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Detailed error:', error);
        throw error;
      }
      
      console.log('Update response:', data);
      
      toast({
        title: 'Success',
        description: 'Your profile has been updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: `Failed to update your profile: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-real-orange"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Profile Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tell us a bit about yourself..."
          ></textarea>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updating}
            className={`px-6 py-2 bg-real-orange text-white rounded-md hover:bg-orange-600 transition-colors ${updating ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {updating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
      
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Account Security</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Change Password</h4>
            <button 
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => {
                toast({
                  title: 'Feature Coming Soon',
                  description: 'Password reset functionality will be available soon.',
                });
              }}
            >
              Reset Password
            </button>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Delete Account</h4>
            <button 
              className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
              onClick={() => {
                toast({
                  title: 'Feature Coming Soon',
                  description: 'Account deletion functionality will be available soon.',
                });
              }}
            >
              Delete My Account
            </button>
            <p className="text-xs text-gray-500 mt-1">This action cannot be undone.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add this new component
const Cart = () => {
  const { cartItems, loading, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    // Check if there are any properties for sale in the cart
    const hasForSaleProperties = cartItems.some(item => item.property.tag === 'For Sale');
    // Check if there are any rental properties in the cart
    const hasRentals = cartItems.some(item => item.property.tag === 'For Rent');
    
    if (hasRentals) {
      // Navigate to the rental payment page
      navigate('/dashboard/payment');
    } else if (hasForSaleProperties) {
      // Navigate to the payment page for properties for sale
      navigate('/dashboard/payment');
    } else {
      toast({
        title: 'Feature Coming Soon',
        description: 'Checkout functionality will be available soon.',
      });
    }
  };

  const handleRequestProperty = async (propertyId: number) => {
    toast({
      title: 'Request Sent',
      description: 'Your property request has been sent to an agent.',
    });
    // In a real implementation, you would send a notification to an agent
    // or create a record in a requests table
    await removeFromCart(propertyId);
  };

  // Group cart items by property type (For Sale or For Rent)
  const rentalProperties = cartItems.filter(item => item.property.tag === 'For Rent');
  const saleProperties = cartItems.filter(item => item.property.tag === 'For Sale');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-semibold">My Cart</h2>
        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            className="text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            Clear Cart
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-real-orange"></div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your Cart is Empty</h3>
          <p className="text-gray-500 mb-6">You haven't added any properties to your cart yet.</p>
          <Link to="/properties">
            <button className="bg-real-orange hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Browse Properties</button>
          </Link>
        </div>
      ) : (
        <div>
          {/* Rental Properties Section */}
          {rentalProperties.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg md:text-xl font-semibold mb-4">Rental Properties</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                {rentalProperties.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img 
                        src={item.property.image} 
                        alt={item.property.title}
                        className="w-full h-40 md:h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            removeFromCart(item.property_id);
                          }}
                          className="bg-white p-1.5 rounded-full shadow hover:bg-gray-100"
                        >
                          <X className="h-5 w-5 text-red-500" />
                        </button>
                      </div>
                      <div className="absolute top-2 left-2 bg-blue-500 text-white py-1 px-3 rounded-full text-sm">
                        For Rent
                      </div>
                    </div>
                    
                    <div className="p-3 md:p-4">
                      <Link to={`/properties/${item.property.id}`} state={{ property: item.property }}>
                        <h3 className="font-bold text-lg mb-2 hover:text-real-blue transition-colors">{item.property.title}</h3>
                      </Link>
                      
                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin size={16} className="mr-1" />
                        <span className="text-sm">{item.property.location}</span>
                      </div>
                      
                      <div className="text-real-blue font-bold text-lg mb-3">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(item.property.price)}
                        <span className="text-sm font-normal text-gray-600">/month</span>
                      </div>
                      
                      <div className="flex flex-wrap md:flex-nowrap justify-between text-xs md:text-sm text-gray-600 mb-4">
                        <div className="flex items-center mr-2 mb-2 md:mb-0">
                          <Bed size={14} className="mr-1" />
                          <span>{item.property.beds}</span>
                        </div>
                        <div className="flex items-center mr-2 mb-2 md:mb-0">
                          <Bath size={14} className="mr-1" />
                          <span>{item.property.baths}</span>
                        </div>
                        <div className="flex items-center">
                          <Maximize size={14} className="mr-1" />
                          <span>{item.property.sqft} sqft</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Link 
                          to={`/properties/${item.property.id}`} 
                          className="flex-1 border border-real-blue text-real-blue px-4 py-2 rounded-md hover:bg-blue-50 transition-colors text-center text-sm md:text-base"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Total Rental Properties:</span>
                  <span className="text-lg">{rentalProperties.length}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-real-blue text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm md:text-base"
                >
                  Proceed to Rent Now
                </button>
              </div>
            </div>
          )}
          
          // Sale Properties Section */
          {saleProperties.length > 0 && (
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-4">Properties For Sale</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                {saleProperties.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img 
                        src={item.property.image} 
                        alt={item.property.title}
                        className="w-full h-40 md:h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            removeFromCart(item.property_id);
                          }}
                          className="bg-white p-1.5 rounded-full shadow hover:bg-gray-100"
                        >
                          <X className="h-5 w-5 text-red-500" />
                        </button>
                      </div>
                      <div className="absolute top-2 left-2 bg-green-500 text-white py-1 px-3 rounded-full text-sm">
                        For Sale
                      </div>
                    </div>
                    
                    <div className="p-3 md:p-4">
                      <Link to={`/properties/${item.property.id}`} state={{ property: item.property }}>
                        <h3 className="font-bold text-lg mb-2 hover:text-real-blue transition-colors">{item.property.title}</h3>
                      </Link>
                      
                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin size={16} className="mr-1" />
                        <span className="text-sm">{item.property.location}</span>
                      </div>
                      
                      <div className="text-real-blue font-bold text-lg mb-3">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(item.property.price)}
                      </div>
                      
                      <div className="flex flex-wrap md:flex-nowrap justify-between text-xs md:text-sm text-gray-600 mb-4">
                        <div className="flex items-center mr-2 mb-2 md:mb-0">
                          <Bed size={14} className="mr-1" />
                          <span>{item.property.beds}</span>
                        </div>
                        <div className="flex items-center mr-2 mb-2 md:mb-0">
                          <Bath size={14} className="mr-1" />
                          <span>{item.property.baths}</span>
                        </div>
                        <div className="flex items-center">
                          <Maximize size={14} className="mr-1" />
                          <span>{item.property.sqft} sqft</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Link 
                          to={`/properties/${item.property.id}`} 
                          className="flex-1 border border-real-blue text-real-blue px-4 py-2 rounded-md hover:bg-blue-50 transition-colors text-center text-sm md:text-base"
                        >
                          View Details
                        </Link>
                        <button 
                          onClick={() => handleRequestProperty(item.property_id)}
                          className="flex-1 bg-real-blue text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm md:text-base"
                        >
                          Request Property
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Total Sale Properties:</span>
                  <span className="text-lg">{saleProperties.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Update the DashboardPage component to include the Cart route
const DashboardPage = () => {
  const { signOut, isAdmin } = useAuth(); // Add isAdmin here
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">My Dashboard</h1>
          <button 
            className="md:hidden bg-gray-100 p-2 rounded-md"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Mobile Sidebar Overlay */}
          <div className={`
            fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300
            ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `} onClick={() => setSidebarOpen(false)}></div>
          
          {/* Sidebar Navigation */}
          <div className={`
            fixed top-0 left-0 h-full w-3/4 max-w-xs bg-white p-6 shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:static md:h-auto md:w-auto md:max-w-none md:shadow-md md:z-auto md:transform-none
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            <div className="flex justify-between items-center mb-6 md:hidden">
              <h2 className="text-xl font-bold">Menu</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="space-y-2">
              <Link 
                to="/dashboard" 
                className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                Dashboard Home
              </Link>
              {isAdmin && (
                <Link 
                  to="/dashboard/listings" 
                  className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  My Listings
                </Link>
              )}
              {!isAdmin && (
                <Link 
                  to="/dashboard/favorites" 
                  className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  Favorites
                </Link>
              )}
              {!isAdmin && (
                <Link 
                  to="/dashboard/cart" 
                  className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  My Cart
                </Link>
              )}
              <Link 
                to="/dashboard/settings" 
                className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                Profile Settings
              </Link>
              
              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors mt-6"
              >
                Logout
              </button>
            </nav>
          </div>
          
          {/* Content Area */}
          <div className="lg:col-span-3 bg-white p-4 md:p-6 rounded-lg shadow-md">
            <Routes>
              <Route index element={<DashboardHome />} />
              {isAdmin && <Route path="listings" element={<MyListings />} />}
              {!isAdmin && <Route path="favorites" element={<Favorites />} />}
              {!isAdmin && <Route path="cart" element={<Cart />} />}
              <Route path="settings" element={<ProfileSettings />} />
              <Route path="payment" element={<PaymentPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
