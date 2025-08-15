import { supabase } from '@/lib/supabase';

export interface StorageConfig {
  bucketName: string;
  folderPath?: string;
  maxFileSize?: number; // in bytes
  allowedMimeTypes?: string[];
}

export interface UploadResult {
  url: string;
  path: string;
  size: number;
  mimeType: string;
}

/**
 * Initialize storage bucket if it doesn't exist
 */
export async function initializeStorageBucket(bucketName: string): Promise<boolean> {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      // Create bucket with public access
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return false;
      }
      
      console.log(`Bucket '${bucketName}' created successfully`);
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing storage bucket:', error);
    return false;
  }
}

/**
 * Upload file to Supabase storage
 */
export async function uploadFile(
  file: File,
  config: StorageConfig
): Promise<UploadResult> {
  try {
    // Initialize bucket if needed
    await initializeStorageBucket(config.bucketName);
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${config.folderPath || 'uploads'}/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    
    // Validate file size
    if (config.maxFileSize && file.size > config.maxFileSize) {
      throw new Error(`File size exceeds limit of ${config.maxFileSize / (1024 * 1024)}MB`);
    }
    
    // Validate MIME type
    if (config.allowedMimeTypes && !config.allowedMimeTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }
    
    // Upload file
    const { data, error } = await supabase.storage
      .from(config.bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(config.bucketName)
      .getPublicUrl(fileName);
    
    if (!urlData.publicUrl) {
      throw new Error('Failed to get public URL for uploaded file');
    }
    
    return {
      url: urlData.publicUrl,
      path: fileName,
      size: file.size,
      mimeType: file.type
    };
  } catch (error: any) {
    console.error('File upload error:', error);
    throw error;
  }
}

/**
 * Delete file from Supabase storage
 */
export async function deleteFile(bucketName: string, filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Get file URL from Supabase storage
 */
export function getFileUrl(bucketName: string, filePath: string): string {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

/**
 * List files in a bucket folder
 */
export async function listFiles(bucketName: string, folderPath?: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath || '');
    
    if (error) {
      console.error('Error listing files:', error);
      return [];
    }
    
    return data.map(item => item.name);
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
}
