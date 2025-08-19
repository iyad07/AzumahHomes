import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Property } from '@/lib/supabase';
import { toast } from 'sonner';
import { Edit, Trash2, Home, MapPin, DollarSign, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getPropertyMainImage } from '@/types/property';
import { formatPrice } from '@/utils/paymentCalculations';

interface PropertyManagerProps {
  className?: string;
  onEditProperty?: (property: Property) => void;
}

const PropertyManager: React.FC<PropertyManagerProps> = ({ 
  className = '', 
  onEditProperty 
}) => {
  const { isAdmin, user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchProperties();
    }
  }, [isAdmin]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      setDeleting(propertyId);
      
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) {
        throw error;
      }

      // Update local state
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      toast.success('Property deleted successfully');
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    } finally {
      setDeleting(null);
    }
  };

  const handleEditProperty = (property: Property) => {
    if (onEditProperty) {
      onEditProperty(property);
    }
  };

  if (!isAdmin) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-700">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Home className="h-5 w-5" />
          Property Management
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Manage all properties - edit details or remove listings
        </p>
      </div>
      
      <div className="p-6">
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No properties found</p>
            <p className="text-gray-400 text-sm">Properties will appear here once they are added to the system.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Property Image */}
                  <div className="md:w-48 h-48 md:h-auto">
                    <img
                      src={getPropertyMainImage(property)}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Property Details */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">
                          {property.title}
                        </h4>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{property.location}</span>
                        </div>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center text-gray-600">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span className="font-semibold text-lg text-real-orange">
                              {formatPrice(property.price)}
                            </span>
                          </div>
                          <Badge variant={property.tag === 'For Sale' ? 'default' : 'secondary'}>
                            {property.tag}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Property Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">{property.beds}</span> Bedrooms
                      </div>
                      <div>
                        <span className="font-medium">{property.baths}</span> Bathrooms
                      </div>
                      <div>
                        <span className="font-medium">{property.sqft}</span> sqft
                      </div>
                    </div>
                    
                    {/* Created Date */}
                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <Calendar className="h-3 w-3 mr-1" />
                      Created: {new Date(property.created_at).toLocaleDateString()}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProperty(property)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                            disabled={deleting === property.id}
                          >
                            <Trash2 className="h-4 w-4" />
                            {deleting === property.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Property</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{property.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProperty(property.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Property
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyManager;