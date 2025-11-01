// src/lib/generateEsewaSignature.js
import crypto from 'crypto';

/**
 * Generates a signature for eSewa payment gateway
 * @param {string} secretKey - The eSewa secret key
 * @param {string} signatureString - The string to be signed
 * @returns {string} - The generated signature
 */
export function generateEsewaSignature(secretKey, signatureString) {
  try {
    // Create HMAC object with SHA256 algorithm and the secret key
    const hmac = crypto.createHmac('sha256', secretKey);
    
    // Update HMAC with the signature string
    hmac.update(signatureString);
    
    // Get the digest in base64 format as required by eSewa
    return hmac.digest('base64');
  } catch (error) {
    console.error('Error generating eSewa signature:', error);
    throw new Error('Failed to generate eSewa signature');
  }
}