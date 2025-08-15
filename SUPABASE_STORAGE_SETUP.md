# Supabase Storage Setup for Image Uploads

This guide explains how to set up Supabase storage to enable image uploads in the property listing form.

## Prerequisites

- A Supabase project with storage enabled
- Proper environment variables configured
- Storage policies set up for public access

## Environment Variables

Ensure these are set in your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Storage Bucket Setup

### 1. Create Storage Bucket

The application will automatically create a `property-images` bucket if it doesn't exist. However, you can also create it manually in the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to Storage → Buckets
3. Click "Create a new bucket"
4. Set bucket name: `property-images`
5. Make it public
6. Set file size limit to 5MB
7. Add allowed MIME types: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`

### 2. Storage Policies

Create storage policies to allow public access to uploaded images:

```sql
-- Allow public read access to property images
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'property-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own uploads
CREATE POLICY "Users can update own uploads" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'property-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads" ON storage.objects
FOR DELETE USING (
  bucket_id = 'property-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Features

### Image Upload Component

The `SupabaseImageUpload` component provides:

- **Drag & Drop**: Users can drag images directly onto the upload area
- **File Validation**: Checks file type and size
- **Preview**: Shows image preview after selection
- **Progress Indicator**: Visual feedback during upload
- **Error Handling**: Graceful fallback if storage is not configured

### Supported Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### File Size Limits

- Default: 5MB per image
- Configurable via component props

### Storage Structure

Images are stored in the following structure:
```
property-images/
├── properties/
│   ├── 1234567890-abc123.jpg
│   ├── 1234567891-def456.png
│   └── ...
```

## Usage

### Basic Usage

```tsx
import SupabaseImageUpload from '@/components/ui/supabase-image-upload';

<SupabaseImageUpload
  value={imageUrl}
  onChange={setImageUrl}
  onError={handleError}
/>
```

### Advanced Usage

```tsx
<SupabaseImageUpload
  value={imageUrl}
  onChange={setImageUrl}
  onError={handleError}
  label="Property Image"
  description="Upload a high-quality image of your property"
  required={true}
  maxSize={10} // 10MB
  acceptedTypes={['image/jpeg', 'image/png']}
  bucketName="custom-bucket"
  folderPath="custom-folder"
/>
```

## Fallback Behavior

If Supabase storage is not properly configured, the component will:

1. Show a warning in the console
2. Use a mock upload simulation
3. Return a placeholder image URL
4. Continue to function for development/testing

## Troubleshooting

### Common Issues

1. **"Bucket not found" errors**
   - Ensure the storage bucket exists
   - Check bucket name matches exactly

2. **Upload permission denied**
   - Verify storage policies are set correctly
   - Check if user is authenticated

3. **File size too large**
   - Increase bucket file size limit
   - Check component maxSize prop

4. **Invalid file type**
   - Verify allowed MIME types in bucket settings
   - Check component acceptedTypes prop

### Debug Mode

Enable debug logging by setting:
```env
VITE_DEBUG=true
```

This will show detailed upload information in the browser console.

## Security Considerations

- Images are stored in a public bucket
- File types are validated on both client and server
- File sizes are limited to prevent abuse
- Users can only modify their own uploads (with proper policies)

## Performance

- Images are cached with 1-hour cache control
- Unique filenames prevent conflicts
- Automatic bucket initialization
- Progress indicators for large files

## Future Enhancements

- Image compression and optimization
- Multiple image uploads
- Image cropping and editing
- CDN integration
- Automatic thumbnail generation
