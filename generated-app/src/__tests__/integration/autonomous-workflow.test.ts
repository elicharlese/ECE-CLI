import { NextRequest } from 'next/server';
import { POST as authPost } from '../../app/api/auth/route';
import { GET as healthGet } from '../../app/api/health/route';
import { POST as buildPost } from '../../app/api/build/route';

describe('Integration Tests - Full Autonomous Workflow', () => {
  let userId: string;

  const createMockRequest = (method: string, body?: Record<string, unknown>, headers?: Record<string, string>) => {
    const request = {
      method,
      json: jest.fn().mockResolvedValue(body),
      headers: new Map(Object.entries(headers || {})),
    } as unknown as NextRequest;

    return request;
  };

  describe('Complete User Journey', () => {
    it('should complete full autonomous app building workflow', async () => {
      // Step 1: Health check
      const healthResponse = await healthGet();
      const healthData = await healthResponse.json();

      expect(healthResponse.status).toBe(200);
      expect(healthData.success).toBe(true);
      expect(healthData.health.status).toBe('healthy');

      // Step 2: User authentication
      const authRequest = createMockRequest('POST', {
        provider: 'demo'
      });

      const authResponse = await authPost(authRequest);
      const authData = await authResponse.json();

      expect(authResponse.status).toBe(200);
      expect(authData.success).toBe(true);
      expect(authData.session).toBeDefined();
      
      userId = authData.user.id;

      // Step 3: Start app building
      const buildRequest = createMockRequest('POST', {
        name: 'Test Social Media Platform',
        description: 'A comprehensive social media platform with real-time features',
        userId: userId
      });

      const buildResponse = await buildPost(buildRequest);
      const buildData = await buildResponse.json();

      expect(buildResponse.status).toBe(200);
      expect(buildData.success).toBe(true);
      expect(buildData.app.name).toBe('Test Social Media Platform');
      expect(buildData.app.status).toBe('building');
      expect(buildData.buildSteps).toBeDefined();
      expect(buildData.buildSteps.length).toBeGreaterThan(0);
    });

    it('should handle invalid workflows gracefully', async () => {
      // Try to build app without authentication
      const buildRequest = createMockRequest('POST', {
        name: 'Unauthorized App',
        description: 'This should fail without proper auth'
      });

      const buildResponse = await buildPost(buildRequest);
      const buildData = await buildResponse.json();

      expect(buildResponse.status).toBe(400);
      expect(buildData.error).toBeDefined();
    });

    it('should validate all required fields', async () => {
      // Authentication with invalid provider
      const authRequest = createMockRequest('POST', {
        provider: 'invalid-provider'
      });

      const authResponse = await authPost(authRequest);
      const authData = await authResponse.json();

      expect(authResponse.status).toBe(400);
      expect(authData.error).toBe('Validation failed');
      expect(authData.details).toBeDefined();
    });
  });

  describe('API Endpoint Integration', () => {
    beforeAll(async () => {
      // Setup: Authenticate user for subsequent tests
      const authRequest = createMockRequest('POST', {
        provider: 'demo'
      });

      const authResponse = await authPost(authRequest);
      const authData = await authResponse.json();
      
      userId = authData.user.id;
    });

    it('should maintain session consistency across requests', async () => {
      // Multiple requests should work with same session
      const requests = Array.from({ length: 3 }, (_, i) => 
        createMockRequest('POST', {
          name: `Test App ${i + 1}`,
          description: `Test application number ${i + 1}`,
          userId: userId
        })
      );

      const responses = await Promise.all(
        requests.map(req => buildPost(req))
      );

      const responsesData = await Promise.all(
        responses.map(res => res.json())
      );

      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(responsesData[index].success).toBe(true);
        expect(responsesData[index].app.name).toBe(`Test App ${index + 1}`);
      });
    });

    it('should handle concurrent build requests', async () => {
      const concurrentRequests = Array.from({ length: 5 }, (_, i) => 
        buildPost(createMockRequest('POST', {
          name: `Concurrent App ${i + 1}`,
          description: `Concurrent test application ${i + 1}`,
          userId: userId
        }))
      );

      const responses = await Promise.all(concurrentRequests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed JSON requests', async () => {
      const request = {
        method: 'POST',
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        headers: new Map(),
      } as unknown as NextRequest;

      const response = await authPost(request);
      expect(response.status).toBe(500);
    });

    it('should handle extremely long app names', async () => {
      const longAppName = 'A'.repeat(1000);
      
      const buildRequest = createMockRequest('POST', {
        name: longAppName,
        description: 'App with extremely long name',
        userId: userId
      });

      const buildResponse = await buildPost(buildRequest);

      // Should either succeed or fail gracefully
      expect([200, 400].includes(buildResponse.status)).toBe(true);
    });

    it('should handle special characters in app names', async () => {
      const specialAppName = '测试应用 🚀 <script>alert("test")</script>';
      
      const buildRequest = createMockRequest('POST', {
        name: specialAppName,
        description: 'App with special characters and potential XSS',
        userId: userId
      });

      const buildResponse = await buildPost(buildRequest);
      const buildData = await buildResponse.json();

      expect(buildResponse.status).toBe(200);
      expect(buildData.app.name).toBe(specialAppName);
    });
  });
});
