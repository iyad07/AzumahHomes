
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SEO from '@/components/SEO';
import SupabaseImageUpload from '@/components/ui/supabase-image-upload';

// Environment validation and debugging
const checkEnvironment = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Debug logging for production troubleshooting
  console.log('Environment check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseKey?.length || 0,
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
  });
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables:', {
      VITE_SUPABASE_URL: supabaseUrl ? 'SET' : 'MISSING',
      VITE_SUPABASE_ANON_KEY: supabaseKey ? 'SET' : 'MISSING',
    });
    return false;
  }
  
  if (supabaseUrl.includes('your_supabase') || supabaseKey.includes('your_supabase')) {
    console.error('Environment variables contain placeholder values');
    return false;
  }
  
  return true;
};

// Debug utility for production
const debugLog = (message: string, data?: any) => {
  if (import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true') {
    console.log(`[SubmitListingPage] ${message}`, data);
  }
};

// Define the form schema with Zod
const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters' }),
  location: z.string().min(3, { message: 'Location is required' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number' }),
  beds: z.coerce.number().int().positive({ message: 'Number of beds must be a positive integer' }),
  baths: z.coerce.number().positive({ message: 'Number of baths must be a positive number' }),
  sqft: z.coerce.number().int().positive({ message: 'Square footage must be a positive integer' }),
  tag: z.string().min(1, { message: 'Property tag is required' }),
  image: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const SubmitListingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { id: editId } = useParams();
  const isEditMode = !!editId;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [environmentError, setEnvironmentError] = useState(false);
  
  // Check environment on component mount
  useEffect(() => {
    debugLog('Component mounting', { isEditMode, editId, userId: user?.id });
    
    const isEnvValid = checkEnvironment();
    if (!isEnvValid) {
      debugLog('Environment validation failed');
      setEnvironmentError(true);
      toast({
        title: 'Configuration Error',
        description: 'Application is not properly configured. Please contact support.',
        variant: 'destructive',
      });
    } else {
      debugLog('Environment validation passed');
    }
    
    if (!isEditMode) {
      debugLog('Not in edit mode, setting loading to false');
      setIsLoading(false);
    }
  }, [isEditMode, toast, user?.id]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      price: 0,
      beds: 0,
      baths: 0,
      sqft: 0,
      tag: 'For Sale',
      image: '',
    },
  });

  // Fetch property data when in edit mode
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!isEditMode || !editId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        debugLog('Starting property data fetch', { editId });
        
        // Check if Supabase is properly configured
        if (!supabase) {
          debugLog('Supabase client not available');
          throw new Error('Database connection not available');
        }
        
        debugLog('Making Supabase query');
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', editId)
          .single();
        
        debugLog('Supabase query result', { hasData: !!data, error: error?.message });
        
        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Failed to fetch property: ${error.message}`);
        }
        
        if (data) {
          // Ensure all form fields have valid values
          form.reset({
            title: data.title || '',
            description: data.description || '',
            location: data.location || '',
            price: data.price || 0,
            beds: data.beds || 1,
            baths: data.baths || 1,
            sqft: data.sqft || 0,
            tag: data.tag || 'For Sale',
            image: data.image || '',
          });
        } else {
          throw new Error('Property not found');
        }
      } catch (error: any) {
        console.error('Error loading property data:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load property data. Please try again.',
          variant: 'destructive'
        });
        // Don't navigate away immediately, give user a chance to retry
        setTimeout(() => navigate('/dashboard'), 3000);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPropertyData();
  }, [isEditMode, editId, form, navigate]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) {
      debugLog('Form submission blocked - already submitting');
      return; // Prevent double submission
    }
    
    debugLog('Starting form submission', { isEditMode, editId, values });
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!values.title?.trim() || !values.location?.trim() || !values.description?.trim()) {
        debugLog('Form validation failed - missing required fields');
        throw new Error('Please fill in all required fields');
      }
      
      // Check if user is authenticated
      if (!user?.id) {
        debugLog('User authentication failed', { hasUser: !!user, userId: user?.id });
        throw new Error('You must be logged in to submit a property');
      }
      
      // Check if Supabase is properly configured
      if (!supabase) {
        debugLog('Supabase client not available during submission');
        throw new Error('Database connection not available. Please check your internet connection.');
      }
      
      debugLog('All validations passed, preparing data');
      
      // Sanitize and prepare data
      const propertyData = {
        title: values.title.trim(),
        description: values.description.trim(),
        location: values.location.trim(),
        price: Number(values.price) || 0,
        beds: Number(values.beds) || 1,
        baths: Number(values.baths) || 1,
        sqft: Number(values.sqft) || 0,
        tag: values.tag || 'For Sale',
        image: values.image?.trim() || '',
        rating: 4.5, // Default rating
        isPopular: false,
        isNew: true,
      };
      
      if (isEditMode && editId) {
        // Update existing property
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', editId)
          .eq('user_id', user.id); // Ensure user owns the property
        
        if (error) {
          console.error('Update error:', error);
          throw new Error(`Failed to update property: ${error.message}`);
        }
        
        toast({
          title: 'Success',
          description: 'Property updated successfully!',
        });
        navigate('/dashboard');
      } else {
        // Create new property
        const { error } = await supabase
          .from('properties')
          .insert([{ ...propertyData, user_id: user.id }]);
        
        if (error) {
          console.error('Insert error:', error);
          throw new Error(`Failed to submit property: ${error.message}`);
        }
        
        toast({
          title: 'Success',
          description: 'Property submitted successfully!',
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast({
        title: 'Error',
        description: error.message || `Failed to ${isEditMode ? 'update' : 'submit'} property. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show environment error if configuration is invalid
  if (environmentError) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="pt-32 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <h3 className="font-bold">Configuration Error</h3>
              <p className="text-sm mt-2">
                The application is not properly configured for deployment. 
                Please ensure environment variables are set correctly.
              </p>
            </div>
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }
  
  if (isLoading) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="pt-32 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading property data...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="pt-32 pb-20 min-h-screen">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-6">
            {isEditMode ? 'Edit Property' : 'Submit a Listing'}
          </h1>
          
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>{isEditMode ? 'Edit Property Details' : 'Property Details'}</CardTitle>
              <CardDescription>
                {isEditMode 
                  ? 'Update the details of your property listing'
                  : 'Enter the details of the property you want to list'
                }
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Modern Apartment with Sea View" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="New York City, NY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the property in detail..." 
                            className="min-h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tag"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="For Sale">For Sale</SelectItem>
                              <SelectItem value="For Rent">For Rent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="beds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="baths"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="sqft"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Square Footage</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <SupabaseImageUpload
                            value={field.value}
                            onChange={field.onChange}
                            onError={(error) => {
                              toast({
                                title: 'Upload Error',
                                description: error,
                                variant: 'destructive',
                              });
                            }}
                            label="Property Image"
                            description="Upload a high-quality image of your property. Supported formats: JPEG, PNG, WebP up to 5MB."
                            required={false}
                            disabled={isSubmitting}
                            maxSize={5}
                            acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                            bucketName="property-images"
                            folderPath="properties"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting 
                      ? (isEditMode ? 'Updating...' : 'Submitting...') 
                      : (isEditMode ? 'Update Property' : 'Submit Property')
                    }
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SubmitListingPage;
