// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for client-side usage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Avoid throwing at import time; log a warning if missing
if (!supabaseUrl || !supabaseAnonKey) {
  // In development, missing envs can break import; keep module loadable
  console.warn('Supabase environment variables are missing. Client operations will fail until configured.');
}

// Client for browser usage (with anonymous key)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Create a separate admin client for server-side operations
// This will only be used in server components or API routes
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase server environment variables');
  }
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
    if (!supabase) {
      console.error('Supabase client is not initialized. Check environment variables.');
      return null;
    }
    // Create a numeric-only base name to simplify storage/search
    const timestamp = Date.now();
    const rand = Math.floor(Math.random() * 1e9);
    const numericBase = `${timestamp}${rand}`; // e.g., 1730797923456123456789

    // Preserve extension if available (from fileName), but base stays numeric
    const extMatch = (fileName || '').match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? `.${extMatch[1]}` : '';
    const uniqueFileName = `${numericBase}${ext}`;
    
    // Upload the file to the product-images bucket
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file?.type || 'image/jpeg',
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
    if (!supabase) {
      console.error('Supabase client is not initialized. Check environment variables.');
      return false;
    }
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