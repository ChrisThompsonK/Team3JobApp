/**
 * Integration Tests: Admin-Protected Routes
 * Tests authentication and authorization for admin-only endpoints
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { createTestClient, setupIntegrationTest, testDataFactories } from './integration.setup.js';

setupIntegrationTest();

describe('Admin-Protected Routes Integration Tests', () => {
  let unauthenticatedClient = createTestClient();
  let authenticatedClient = createTestClient('test-admin-token');

  beforeAll(() => {
    unauthenticatedClient = createTestClient();
    // In a real scenario, this would be a valid JWT token
    authenticatedClient = createTestClient('test-admin-token');
  });

  describe('Job Admin Routes - POST /jobs/job', () => {
    it('should return error when creating job without authentication', async () => {
      const jobData = testDataFactories.createJobRolePayload();

      const response = await unauthenticatedClient.post('/jobs/job', jobData);

      // Should return 401 or 403 for unauthorized access
      expect([401, 403, 422]).toContain(response.status);
    });

    it('should reject job creation with invalid token', async () => {
      const jobData = testDataFactories.createJobRolePayload();
      const invalidTokenClient = createTestClient('invalid-token');

      const response = await invalidTokenClient.post('/jobs/job', jobData);

      expect([401, 403, 422]).toContain(response.status);
    });

    it('job creation should require all required fields', async () => {
      const incompleteData = {
        name: 'Test Job',
        // Missing other required fields
      };

      const response = await authenticatedClient.post('/jobs/job', incompleteData);

      // Should fail validation
      expect([400, 401, 403, 422]).toContain(response.status);
    });

    it('should validate job creation payload structure', async () => {
      const validJobData = testDataFactories.createJobRolePayload();

      // This is just testing that the structure is correct
      expect(validJobData).toHaveProperty('name');
      expect(validJobData).toHaveProperty('location');
      expect(validJobData).toHaveProperty('capabilityId');
      expect(validJobData).toHaveProperty('bandId');
      expect(validJobData).toHaveProperty('statusId');
      expect(validJobData).toHaveProperty('closingDate');
    });
  });

  describe('Job Admin Routes - DELETE /jobs/:id', () => {
    it('should return error when deleting job without authentication', async () => {
      const response = await unauthenticatedClient.delete('/jobs/1');

      expect([401, 403, 404, 405]).toContain(response.status);
    });

    it('should reject deletion with invalid token', async () => {
      const invalidTokenClient = createTestClient('invalid-token');

      const response = await invalidTokenClient.delete('/jobs/1');

      expect([401, 403, 404, 405]).toContain(response.status);
    });
  });

  describe('Job Admin Routes - PUT /jobs/:id', () => {
    it('should return error when updating job without authentication', async () => {
      const updateData = testDataFactories.updateJobRolePayload();

      const response = await unauthenticatedClient.put('/jobs/1', updateData);

      expect([401, 403, 404, 405]).toContain(response.status);
    });

    it('should reject update with invalid token', async () => {
      const updateData = testDataFactories.updateJobRolePayload();
      const invalidTokenClient = createTestClient('invalid-token');

      const response = await invalidTokenClient.put('/jobs/1', updateData);

      expect([401, 403, 404, 405]).toContain(response.status);
    });
  });

  describe('Application Admin Routes - GET /applications', () => {
    it('should return error when accessing admin endpoint without authentication', async () => {
      const response = await unauthenticatedClient.get('/applications');

      expect([401, 403, 404, 405]).toContain(response.status);
    });

    it('should reject access with invalid token', async () => {
      const invalidTokenClient = createTestClient('invalid-token');

      const response = await invalidTokenClient.get('/applications');

      expect([401, 403, 404, 405]).toContain(response.status);
    });
  });

  describe('Application Admin Routes - GET /applications/:id', () => {
    it('should return error when accessing admin endpoint without authentication', async () => {
      const response = await unauthenticatedClient.get('/applications/1');

      expect([401, 403, 404, 405]).toContain(response.status);
    });

    it('should reject access with invalid token', async () => {
      const invalidTokenClient = createTestClient('invalid-token');

      const response = await invalidTokenClient.get('/applications/1');

      expect([401, 403, 404, 405]).toContain(response.status);
    });
  });

  describe('Application Admin Routes - GET /applications/:id/details', () => {
    it('should return error when accessing admin endpoint without authentication', async () => {
      const response = await unauthenticatedClient.get('/applications/1/details');

      expect([401, 403, 404, 405]).toContain(response.status);
    });
  });

  describe('Application Admin Routes - GET /applications-with-roles', () => {
    it('should return error when accessing admin endpoint without authentication', async () => {
      const response = await unauthenticatedClient.get('/applications-with-roles');

      expect([401, 403, 404, 405]).toContain(response.status);
    });

    it('should reject access with invalid token', async () => {
      const invalidTokenClient = createTestClient('invalid-token');

      const response = await invalidTokenClient.get('/applications-with-roles');

      expect([401, 403, 404, 405]).toContain(response.status);
    });
  });

  describe('Application Admin Routes - GET /applications/job-role/:jobRoleId', () => {
    it('should return error when accessing admin endpoint without authentication', async () => {
      const response = await unauthenticatedClient.get('/applications/job-role/1');

      expect([401, 403, 404, 405]).toContain(response.status);
    });

    it('should reject access with invalid token', async () => {
      const invalidTokenClient = createTestClient('invalid-token');

      const response = await invalidTokenClient.get('/applications/job-role/1');

      expect([401, 403, 404, 405]).toContain(response.status);
    });
  });

  describe('Application Admin Routes - PUT /applications/:id/status', () => {
    it('should return error when updating status without authentication', async () => {
      const response = await unauthenticatedClient.put('/applications/1/status', {
        statusId: 2,
      });

      expect([401, 403, 404, 405]).toContain(response.status);
    });

    it('should reject update with invalid token', async () => {
      const invalidTokenClient = createTestClient('invalid-token');

      const response = await invalidTokenClient.put('/applications/1/status', {
        statusId: 2,
      });

      expect([401, 403, 404, 405]).toContain(response.status);
    });
  });

  describe('Application Admin Routes - PUT /applications/:id/hire', () => {
    it('should return error when hiring without authentication', async () => {
      const response = await unauthenticatedClient.put('/applications/1/hire', {});

      expect([401, 403, 404, 405]).toContain(response.status);
    });

    it('should reject request with invalid token', async () => {
      const invalidTokenClient = createTestClient('invalid-token');

      const response = await invalidTokenClient.put('/applications/1/hire', {});

      expect([401, 403, 404, 405]).toContain(response.status);
    });
  });

  describe('Application Admin Routes - PUT /applications/:id/reject', () => {
    it('should return error when rejecting without authentication', async () => {
      const response = await unauthenticatedClient.put('/applications/1/reject', {});

      expect([401, 403, 404, 405]).toContain(response.status);
    });

    it('should reject request with invalid token', async () => {
      const invalidTokenClient = createTestClient('invalid-token');

      const response = await invalidTokenClient.put('/applications/1/reject', {});

      expect([401, 403, 404, 405]).toContain(response.status);
    });
  });

  describe('Application Admin Routes - GET /analytics/applications', () => {
    it('should return error when accessing analytics without authentication', async () => {
      const response = await unauthenticatedClient.get('/analytics/applications');

      expect([401, 403, 404, 405]).toContain(response.status);
    });

    it('should reject access with invalid token', async () => {
      const invalidTokenClient = createTestClient('invalid-token');

      const response = await invalidTokenClient.get('/analytics/applications');

      expect([401, 403, 404, 405]).toContain(response.status);
    });
  });

  describe('Public Routes - Authorization Not Required', () => {
    it('should allow access to GET /jobs without authentication', async () => {
      const response = await unauthenticatedClient.get('/jobs');

      expect([200, 404, 405]).toContain(response.status);
      // Should not be 401 or 403
      expect([401, 403]).not.toContain(response.status);
    });

    it('should allow access to GET /capabilities without authentication', async () => {
      const response = await unauthenticatedClient.get('/capabilities');

      expect([200, 404, 405]).toContain(response.status);
      expect([401, 403]).not.toContain(response.status);
    });

    it('should allow access to GET /bands without authentication', async () => {
      const response = await unauthenticatedClient.get('/bands');

      expect([200, 404, 405]).toContain(response.status);
      expect([401, 403]).not.toContain(response.status);
    });

    it('should allow access to GET /statuses without authentication', async () => {
      const response = await unauthenticatedClient.get('/statuses');

      expect([200, 404, 405]).toContain(response.status);
      expect([401, 403]).not.toContain(response.status);
    });

    it('should allow posting applications without authentication', async () => {
      const applicationData = testDataFactories.createApplicationPayload();

      const response = await unauthenticatedClient.post('/applications', applicationData);

      // Should not be 401 for authentication - may be 400 for validation or 200 for success
      expect([401, 403]).not.toContain(response.status);
    });

    it('should allow retrieving applications by email without authentication', async () => {
      const response = await unauthenticatedClient.get('/applications/my-applications', {
        params: { email: 'test@example.com' },
      });

      // Should allow access (may return empty array)
      expect([200, 400, 422]).toContain(response.status);
      expect([401, 403]).not.toContain(response.status);
    });
  });

  describe('Authorization vs Authentication', () => {
    it('authenticated request should include authorization header', async () => {
      const client = createTestClient('valid-token');

      // The client should have the token in headers
      expect(client.defaults.headers.common['Authorization']).toBe('Bearer valid-token');
    });

    it('unauthenticated request should not include authorization header', async () => {
      const client = createTestClient();

      // The client should not have an authorization header
      expect(client.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });
});
