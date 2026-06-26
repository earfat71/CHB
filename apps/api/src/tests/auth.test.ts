import { generateOTP } from '../lib/sms';
import { signToken, verifyToken } from '../lib/jwt';

process.env.JWT_SECRET = 'test_secret_key_at_least_16_chars';
process.env.JWT_EXPIRES_IN = '1h';

describe('Auth', () => {
  test('OTP is 6 digits', () => {
    const otp = generateOTP();
    expect(otp).toMatch(/^\d{6}$/);
  });

  test('JWT round-trip', () => {
    const payload = { userId: 'user123', role: 'CUSTOMER' };
    const token = signToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe('user123');
    expect(decoded.role).toBe('CUSTOMER');
  });

  test('invalid token throws', () => {
    expect(() => verifyToken('invalid.token.here')).toThrow();
  });
});
