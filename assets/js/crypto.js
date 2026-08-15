/*
 * Shared crypto module for the Family area.
 * Used by both the site's decryptor (assets/js/family.js) and the local
 * tools/encryptor.html, so encryption and decryption always stay compatible.
 *
 * Format: base64( salt[16 bytes] || iv[12 bytes] || AES-GCM ciphertext )
 * Key derivation: PBKDF2-SHA256, 200,000 iterations, AES-GCM 256-bit key.
 *
 * This file contains only the algorithm - no secrets. It is safe to commit.
 */
const FamilyCrypto = (() => {
  const SALT_LENGTH = 16;
  const IV_LENGTH = 12;
  const PBKDF2_ITERATIONS = 200000;

  function bytesToBase64(bytes) {
    let binary = "";
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    return btoa(binary);
  }

  function base64ToBytes(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  async function deriveKey(passphrase, salt, usages) {
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(passphrase),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: PBKDF2_ITERATIONS,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      usages
    );
  }

  async function encryptText(passphrase, plaintext) {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const key = await deriveKey(passphrase, salt, ["encrypt"]);

    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(plaintext)
    );

    const bundle = new Uint8Array(SALT_LENGTH + IV_LENGTH + ciphertext.byteLength);
    bundle.set(salt, 0);
    bundle.set(iv, SALT_LENGTH);
    bundle.set(new Uint8Array(ciphertext), SALT_LENGTH + IV_LENGTH);

    return bytesToBase64(bundle);
  }

  async function decryptText(passphrase, bundleBase64) {
    const bundle = base64ToBytes(bundleBase64);
    const salt = bundle.slice(0, SALT_LENGTH);
    const iv = bundle.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const ciphertext = bundle.slice(SALT_LENGTH + IV_LENGTH);
    const key = await deriveKey(passphrase, salt, ["decrypt"]);

    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    return new TextDecoder().decode(plaintext);
  }

  return { encryptText, decryptText };
})();
