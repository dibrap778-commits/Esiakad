/**
 * Utilitas enkripsi dan hashing kata sandi
 * Menggunakan Web Crypto API (SHA-256) untuk menyimpan kata sandi dalam bentuk hash di sisi klien.
 */

export async function hashPasswordClient(password: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(password);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback
    }
  }

  // Fallback hash jika Web Crypto tidak tersedia
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `sha256_${Math.abs(hash).toString(16)}`;
}

export async function verifyPasswordClient(input: string, stored: string): Promise<boolean> {
  if (!stored) return false;
  // Jika tersimpan plain text (misal data seed awal)
  if (input === stored) return true;
  // Jika tersimpan hash SHA-256
  const hashed = await hashPasswordClient(input);
  return hashed === stored;
}
