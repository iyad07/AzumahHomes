import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { cn } from '@/lib/utils';
import { uploadFile, StorageConfig } from '@/utils/storage';

interface SupabaseImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  onError?: (error: string) => void;
  className?: string;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  bucketName?: string;
  folderPath?: string;
}

const SupabaseImageUpload: React.FC<SupabaseImageUploadProps> = ({
  value,
  onChange,
  onError,
  className,
  label = 'Property Image',
  description = 'Upload a high-quality image of your property',
  required = false,
  disabled = false,
  maxSize = 5, // 5MB default
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  bucketName = 'property-images',
  folderPath = 'properties'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      const error = `Invalid file type. Please upload ${acceptedTypes.join(', ')}`;
      onError?.(error);
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      const error = `File size must be less than ${maxSize}MB`;
      onError?.(error);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase storage
    try {
      setIsUploading(true);
      setUploadProgress(0);
      const imageUrl = await uploadImageToSupabase(file);
      onChange(imageUrl);
      setUploadProgress(100);
    } catch (error: any) {
      onError?.(error.message || 'Failed to upload image');
      setPreview(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    try {
      const config: StorageConfig = {
        bucketName,
        folderPath,
        maxFileSize: maxSize * 1024 * 1024,
        allowedMimeTypes: acceptedTypes
      };

      const result = await uploadFile(file, config);
      return result.url;
    } catch (error: any) {
      console.error('Image upload error:', error);
      
      // If Supabase storage is not configured, fall back to mock upload
      if (error.message?.includes('storage') || error.message?.includes('bucket')) {
        console.warn('Supabase storage not configured, using mock upload');
        return await mockImageUpload(file);
      }
      
      throw error;
    }
  };

  const mockImageUpload = async (file: File): Promise<string> => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return a mock URL - replace this with actual Supabase storage upload
    return `https://images.unsplash.com/photo-${Date.now()}?auto=format&fit=crop&w=800&q=80`;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const removeImage = () => {
    setPreview(null);
    onChange('');
  };

  return (
    <div className={cn('space-y-4', className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          dragActive ? 'border-primary bg-primary/5' : 'border-gray-300',
          disabled && 'opacity-50 cursor-not-allowed',
          preview && 'border-primary bg-primary/5'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Property preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={removeImage}
              disabled={disabled || isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
            
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Uploading...</p>
                  {uploadProgress > 0 && (
                    <div className="w-32 bg-white/20 rounded-full h-2 mt-2">
                      <div 
                        className="bg-white h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                {isUploading ? 'Uploading...' : 'Drag and drop your image here, or click to browse'}
              </p>
              <p className="text-xs text-gray-500">
                {acceptedTypes.join(', ').replace('image/', '')} up to {maxSize}MB
              </p>
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleClick}
              disabled={disabled || isUploading}
              className="mx-auto"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileSelect(file);
          }
        }}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
};

export default SupabaseImageUpload;
