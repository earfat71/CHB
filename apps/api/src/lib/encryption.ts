import CryptoJS from 'crypto-js';
import { env } from './env';

export function encryptNID(nid: string): string {
  return CryptoJS.AES.encrypt(nid, env.ENCRYPTION_KEY).toString();
}

export function decryptNID(encrypted: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, env.ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function maskNID(nid: string): string {
  return nid.slice(-4);
}
