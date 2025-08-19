import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Plus, GripVertical } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { cn } from '@/lib/utils';
import { uploadFile, StorageConfig } from '@/utils/storage';

interface MultipleImageUploadProps {
  value?: string[];
  onChange: (value: string[]) => void;
  onError?: (error: string) => void;
  className?: string;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  maxSize?: number; // in MB
  maxImages?: number; // maximum number of images
  acceptedTypes?: string[];
  bucketName?: string;
  folderPath?: string;
}

const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({
  value = [],
  onChange,
  onError,
  className,
  label = 'Property Images',
  description = 'Upload high-quality images of your property. You can upload multiple images and reorder them.',
  required = false,
  disabled = false,
  maxSize = 5, // 5MB default
  maxImages = 10, // 10 images max
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  bucketName = 'property-images',
  folderPath = 'properties'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please use: ${acceptedTypes.join(', ')}`;
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    
    return null;
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

  const handleFileSelect = async (files: FileList) => {
    if (disabled || isUploading) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - value.length;
    
    if (fileArray.length > remainingSlots) {
      onError?.(`You can only upload ${remainingSlots} more image(s). Maximum ${maxImages} images allowed.`);
      return;
    }

    // Validate all files first
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        onError?.(error);
        return;
      }
    }

    setIsUploading(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const fileId = `${Date.now()}-${i}`;
        
        // Update progress
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: Math.min((prev[fileId] || 0) + 10, 90)
          }));
        }, 100);

        try {
          const imageUrl = await uploadImageToSupabase(file);
          newImages.push(imageUrl);
          
          // Complete progress
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
          clearInterval(progressInterval);
          
          // Remove progress after a delay
          setTimeout(() => {
            setUploadProgress(prev => {
              const newPrev = { ...prev };
              delete newPrev[fileId];
              return newPrev;
            });
          }, 1000);
        } catch (error) {
          clearInterval(progressInterval);
          setUploadProgress(prev => {
            const newPrev = { ...prev };
            delete newPrev[fileId];
            return newPrev;
          });
          throw error;
        }
      }

      onChange([...value, ...newImages]);
    } catch (error: any) {
      onError?.(error.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...value];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onChange(newImages);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverImage = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveImage(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const canAddMore = value.length < maxImages;

  return (
    <div className={cn('space-y-4', className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      {/* Existing Images */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((imageUrl, index) => (
            <div
              key={`${imageUrl}-${index}`}
              className="relative group cursor-move"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOverImage(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors">
                <img
                  src={imageUrl}
                  alt={`Property image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image controls */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImage(index)}
                    disabled={disabled || isUploading}
                    className="h-8 w-8 p-0"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
              
              {/* Drag handle */}
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <GripVertical size={16} className="text-white drop-shadow-lg" />
              </div>
              
              {/* Image number */}
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-sm text-gray-600">Uploading images...</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                  {value.length === 0 ? (
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  ) : (
                    <Plus className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {value.length === 0 ? 'Upload property images' : 'Add more images'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Drag and drop or click to browse ({value.length}/{maxImages})
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled || isUploading}
                  className="mt-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Images
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}

      {/* File input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        multiple
        onChange={(e) => {
          const files = e.target.files;
          if (files) {
            handleFileSelect(files);
          }
        }}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
};

export default MultipleImageUpload;