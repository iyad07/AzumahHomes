import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import SupabaseImageUpload from '@/components/ui/supabase-image-upload';
import SEO from '@/components/SEO';

const ImageUploadDemoPage = () => {
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    console.log('Image uploaded:', imageUrl);
  };

  const handleImageError = (error: string) => {
    toast({
      title: 'Upload Error',
      description: error,
      variant: 'destructive',
    });
  };

  const handleSubmit = async () => {
    if (!uploadedImage) {
      toast({
        title: 'No Image',
        description: 'Please upload an image first',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: 'Success!',
      description: 'Image uploaded successfully!',
    });
    
    setIsSubmitting(false);
  };

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <SEO 
        title="Image Upload Demo" 
        description="Test the image upload functionality for property listings"
      />
      
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Image Upload Demo
        </h1>
        
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Basic Upload Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Image Upload</CardTitle>
              <CardDescription>
                Simple image upload with drag & drop support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SupabaseImageUpload
                value={uploadedImage}
                onChange={handleImageChange}
                onError={handleImageError}
                label="Property Image"
                description="Upload a high-quality image of your property. Supported formats: JPEG, PNG, WebP up to 5MB."
                required={false}
                maxSize={5}
                acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                bucketName="property-images"
                folderPath="demo"
              />
            </CardContent>
          </Card>

          {/* Uploaded Image Display */}
          {uploadedImage && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Image</CardTitle>
                <CardDescription>
                  Preview of the uploaded image
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <img
                    src={uploadedImage}
                    alt="Uploaded property"
                    className="w-full max-w-md h-auto rounded-lg shadow-lg"
                  />
                  <div className="text-sm text-gray-600">
                    <p><strong>Image URL:</strong></p>
                    <p className="break-all bg-gray-100 p-2 rounded mt-1">
                      {uploadedImage}
                    </p>
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full md:w-auto"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Demo'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Features Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>
                What the image upload component provides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Upload Methods</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Click to browse files</li>
                    <li>• Drag & drop support</li>
                    <li>• File type validation</li>
                    <li>• File size validation</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">User Experience</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Image preview</li>
                    <li>• Upload progress</li>
                    <li>• Error handling</li>
                    <li>• Responsive design</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Supported Formats</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• JPEG (.jpg, .jpeg)</li>
                    <li>• PNG (.png)</li>
                    <li>• WebP (.webp)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Storage</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Supabase storage integration</li>
                    <li>• Automatic bucket creation</li>
                    <li>• Public URL generation</li>
                    <li>• Fallback to mock upload</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
              <CardDescription>
                How to configure Supabase storage for production use
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Environment Variables</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Ensure these are set in your .env file:
                  </p>
                  <code className="block bg-gray-100 p-2 rounded text-sm">
                    VITE_SUPABASE_URL=your_supabase_project_url<br/>
                    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
                  </code>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">2. Storage Bucket</h4>
                  <p className="text-sm text-gray-600">
                    The component will automatically create a 'property-images' bucket, 
                    or you can create it manually in the Supabase dashboard.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">3. Storage Policies</h4>
                  <p className="text-sm text-gray-600">
                    Set up appropriate storage policies for public read access and 
                    authenticated user uploads. See SUPABASE_STORAGE_SETUP.md for details.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadDemoPage;
