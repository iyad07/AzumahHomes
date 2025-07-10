import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Eye, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SEO from '@/components/SEO';

const SubmitBlogPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    image: '',
    readTime: '',
    tags: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.excerpt.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Here you would typically save the blog post to your database
      // For now, we'll simulate the API call
      
      const blogPost = {
        ...formData,
        id: Date.now(), // Temporary ID
        author: {
          name: user?.email || 'Admin',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
        },
        date: new Date().toISOString().split('T')[0],
        published: true
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Success!',
        description: 'Blog post has been published successfully.',
      });
      
      // Reset form
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        image: '',
        readTime: '',
        tags: ''
      });
      
      // Redirect to blog page
      navigate('/blog');
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish blog post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePreview = () => {
    setIsPreview(!isPreview);
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="pt-24 md:pt-32 pb-12 md:pb-20 min-h-screen bg-gray-50">
        <SEO 
          title="Submit Blog Post - Azumah Homes Admin"
          description="Create and publish new blog posts for Azumah Homes"
          keywords="admin, blog, create post, Azumah Homes"
          url="https://azumahhomes.vercel.app/submit-blog"
        />
      
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Button>
          
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Blog Post</h1>
            <p className="text-gray-600 mt-1">Share insights and updates with your audience</p>
          </div>
          
          <Button
            variant="outline"
            onClick={togglePreview}
            className="flex items-center gap-2"
          >
            <Eye size={16} />
            {isPreview ? 'Edit' : 'Preview'}
          </Button>
        </div>

        {!isPreview ? (
          /* Edit Mode */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Blog Content</CardTitle>
                    <CardDescription>Write your blog post content</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter blog post title"
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="excerpt">Excerpt *</Label>
                      <Textarea
                        id="excerpt"
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleInputChange}
                        placeholder="Brief description of your blog post (2-3 sentences)"
                        className="mt-1 h-20"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="content">Content *</Label>
                      <Textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        placeholder="Write your full blog post content here..."
                        className="mt-1 h-96"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Post Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-real-orange focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        <option value="Buying Guide">Buying Guide</option>
                        <option value="Selling Tips">Selling Tips</option>
                        <option value="Market Trends">Market Trends</option>
                        <option value="Investment">Investment</option>
                        <option value="Home Improvement">Home Improvement</option>
                        <option value="News">News</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="readTime">Read Time</Label>
                      <Input
                        id="readTime"
                        name="readTime"
                        value={formData.readTime}
                        onChange={handleInputChange}
                        placeholder="e.g., 5 min read"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="image">Featured Image URL</Label>
                      <Input
                        id="image"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        placeholder="real estate, buying, tips (comma separated)"
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-real-orange hover:bg-orange-600"
                    >
                      {isSubmitting ? (
                        <>
                          <Upload className="mr-2 h-4 w-4 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Publish Blog Post
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        ) : (
          /* Preview Mode */
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {formData.image && (
              <img 
                src={formData.image} 
                alt={formData.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            )}
            
            <div className="p-6 md:p-8">
              {formData.category && (
                <span className="inline-block bg-real-orange text-white px-3 py-1 rounded-full text-sm mb-4">
                  {formData.category}
                </span>
              )}
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {formData.title || 'Blog Post Title'}
              </h1>
              
              <div className="flex items-center gap-4 text-gray-600 mb-6">
                <span>{new Date().toLocaleDateString()}</span>
                {formData.readTime && <span>• {formData.readTime}</span>}
                <span>• By Admin</span>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-lg text-gray-600 mb-6">
                  {formData.excerpt || 'Blog post excerpt will appear here...'}
                </p>
                
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {formData.content || 'Blog post content will appear here...'}
                </div>
              </div>
              
              {formData.tags && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-semibold mb-2">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.split(',').map((tag, index) => (
                      <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SubmitBlogPage;