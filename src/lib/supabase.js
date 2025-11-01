// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for client-side usage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for browser usage (with anonymous key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a separate admin client for server-side operations
// This will only be used in server components or API routes
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return createClient(supabaseUrl, supabaseServiceKey);
};

// Storage bucket name for product images
export const STORAGE_BUCKET = 'images';

/**
 * Uploads an image to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} fileName - The name to save the file as
 * @returns {Promise<{path: string, url: string} | null>} - The file path and public URL or null if upload failed
 */
export async function uploadProductImage(file, fileName) {
  try {
    // Create a unique file name to avoid collisions
    const uniqueFileName = `${Date.now()}-${fileName}`;
    
    // Upload the file to the product-images bucket
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(uniqueFileName);
    
    return {
      path: data.path,
      url: publicUrl
    };
  } catch (error) {
    console.error('Error in uploadProductImage:', error);
    return null;
  }
}

/**
 * Deletes an image from Supabase Storage
 * @param {string} filePath - The path of the file to delete
 * @returns {Promise<boolean>} - Whether the deletion was successful
 */
export async function deleteProductImage(filePath) {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteProductImage:', error);
    return false;
  }
}