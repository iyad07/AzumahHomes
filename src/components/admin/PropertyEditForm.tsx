import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Property } from '@/lib/supabase';
import { PropertyCategory, PropertyType } from '@/types/property';
import { toast } from 'sonner';
import { Save, X, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MultipleImageUpload from '@/components/ui/multiple-image-upload';

interface PropertyEditFormProps {
  property: Property;
  onSave?: (updatedProperty: Property) => void;
  onCancel?: () => void;
  className?: string;
}

const PropertyEditForm: React.FC<PropertyEditFormProps> = ({
  property,
  onSave,
  onCancel,
  className = ''
}) => {
  const { isAdmin, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: property.title || '',
    description: property.description || '',
    price: property.price || 0,
    location: property.location || '',
    bedrooms: property.beds || 1,
    bathrooms: property.baths || 1,
    area: property.sqft || 0,
    category: property.category || PropertyCategory.APARTMENT,
    type: property.type || PropertyType.APARTMENT,
    tag: property.tag || 'For Sale',
    images: property.images || (property.image ? [property.image] : []),
    image: property.image || ''
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImagesChange = (newImages: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: newImages,
      // Keep backward compatibility - set first image as main image
      image: newImages.length > 0 ? newImages[0] : ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      return;
    }

    if (!formData.title || !formData.description || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        location: formData.location,
        beds: formData.bedrooms,
      baths: formData.bathrooms,
      sqft: formData.area,
        category: formData.category,
        type: formData.type,
        tag: formData.tag,
        images: formData.images,
        image: formData.image, // Backward compatibility
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', property.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('Property updated successfully!');
      
      if (onSave && data) {
        onSave(data);
      }
    } catch (error: any) {
      console.error('Error updating property:', error);
      toast.error(error.message || 'Failed to update property');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-700">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Edit Property
            </CardTitle>
            <CardDescription>
              Update property details and images
            </CardDescription>
          </div>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter property title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter property location"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter property description"
              rows={4}
              required
            />
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', Number(e.target.value))}
                placeholder="Enter price"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => handleInputChange('bedrooms', Number(e.target.value))}
                min="1"
                max="10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => handleInputChange('bathrooms', Number(e.target.value))}
                min="1"
                max="10"
                step="0.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area">Area (sqft)</Label>
              <Input
                id="area"
                type="number"
                value={formData.area}
                onChange={(e) => handleInputChange('area', Number(e.target.value))}
                placeholder="Enter area in sqft"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PropertyCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tag">Listing Type</Label>
              <Select
                value={formData.tag}
                onValueChange={(value) => handleInputChange('tag', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select listing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="For Sale">For Sale</SelectItem>
                  <SelectItem value="For Rent">For Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Property Images */}
          <div className="space-y-2">
            <Label>Property Images</Label>
            <MultipleImageUpload
              value={formData.images}
              onChange={handleImagesChange}
              maxImages={10}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Updating...' : 'Update Property'}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PropertyEditForm;