process.env.ENCRYPTION_KEY = '32charencryptionkeychangeinprod0';

import { encryptNID, decryptNID, maskNID } from '../lib/encryption';

describe('NID Encryption', () => {
  const testNID = '1234567890123456';

  test('encrypts NID', () => {
    const encrypted = encryptNID(testNID);
    expect(encrypted).not.toBe(testNID);
    expect(encrypted.length).toBeGreaterThan(0);
  });

  test('decrypts back to original', () => {
    const encrypted = encryptNID(testNID);
    const decrypted = decryptNID(encrypted);
    expect(decrypted).toBe(testNID);
  });

  test('masks to last 4 digits', () => {
    const masked = maskNID(testNID);
    expect(masked).toBe('3456');
  });
});
