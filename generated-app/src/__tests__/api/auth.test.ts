import { NextRequest } from 'next/server';
import { POST, GET } from '../../app/api/auth/route';

// Mock the Next.js request/response
const createMockRequest = (method: string, body?: Record<string, unknown>, headers?: Record<string, string>) => {
  const request = {
    method,
    json: jest.fn().mockResolvedValue(body),
    headers: new Map(Object.entries(headers || {})),
  } as unknown as NextRequest;

  return request;
};

describe('/api/auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth', () => {
    it('should authenticate demo user successfully', async () => {
      const request = createMockRequest('POST', {
        provider: 'demo'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.provider).toBe('demo');
      expect(data.session).toBeDefined();
    });

    it('should authenticate Google user with email', async () => {
      const request = createMockRequest('POST', {
        provider: 'google',
        email: 'test@example.com'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe('test@example.com');
      expect(data.user.provider).toBe('google');
    });

    it('should authenticate Phantom wallet user', async () => {
      const request = createMockRequest('POST', {
        provider: 'phantom',
        walletAddress: '0x1234567890abcdef'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.walletAddress).toBe('0x1234567890abcdef');
      expect(data.user.provider).toBe('phantom');
    });

    it('should fail validation for invalid provider', async () => {
      const request = createMockRequest('POST', {
        provider: 'invalid'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should fail validation for Google without email', async () => {
      const request = createMockRequest('POST', {
        provider: 'google'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should fail validation for wallet provider without address', async () => {
      const request = createMockRequest('POST', {
        provider: 'phantom'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });
  });

  describe('GET /api/auth', () => {
    it('should validate session with valid token', async () => {
      const request = createMockRequest('GET', undefined, {
        authorization: 'Bearer valid-session-token'
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.session).toBeDefined();
    });

    it('should fail without authorization header', async () => {
      const request = createMockRequest('GET');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('No authorization header');
    });
  });
});
