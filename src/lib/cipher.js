/**
 * Simple Character-Interleaving Cipher
 * 
 * Encrypts by inserting a fixed key character after each character of the input.
 * Example: encryptPassword("apple", "t") → "atptptltet"
 * 
 * Decrypts by taking every other character (skipping the interleaved key chars).
 * Example: decryptPassword("atptptltet", "t") → "apple"
 */

const DEFAULT_KEY = "b";

export function encryptPassword(password, key = DEFAULT_KEY) {
  let encrypted = "";
  for (const char of password) {
    encrypted += char + key;
  }
  return encrypted;
}

export function decryptPassword(encrypted, key = DEFAULT_KEY) {
  let decrypted = "";
  for (let i = 0; i < encrypted.length; i += 2) {
    decrypted += encrypted[i];
  }
  return decrypted;
}
