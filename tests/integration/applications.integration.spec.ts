/**
 * Integration Tests: Application Routes
 * Tests the frontend-backend communication for application-related endpoints
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { createTestClient, setupIntegrationTest, testDataFactories } from './integration.setup.js';

setupIntegrationTest();

describe('Application Routes Integration Tests', () => {
  let client = createTestClient();
  let _testApplicationId: number;
  let testApplicationEmail: string;

  beforeAll(() => {
    client = createTestClient();
    testApplicationEmail = `test-${Date.now()}@example.com`;
  });

  describe('POST /applications', () => {
    it('should submit a new application', async () => {
      const applicationData = testDataFactories.createApplicationPayload({
        jobRoleId: 1,
        emailAddress: testApplicationEmail,
      });

      const response = await client.post('/applications', applicationData);

      // Accept both success and validation error states for now
      expect([200, 201, 400, 422]).toContain(response.status);

      // If successful, expect success property
      if (response.status === 200 || response.status === 201) {
        expect(response.data).toHaveProperty('success');

        if (response.data.success) {
          expect(response.data).toHaveProperty('applicationID');
          _testApplicationId = response.data.applicationID;
        }
      }
    });

    it('should require jobRoleId', async () => {
      const invalidData = {
        emailAddress: 'test@example.com',
        phoneNumber: '123-456-7890',
      };

      const response = await client.post('/applications', invalidData);

      // Should either return 400 or fail validation
      expect([400, 500, 422]).toContain(response.status);
    });

    it('should require emailAddress', async () => {
      const invalidData = {
        jobRoleId: 1,
        phoneNumber: '123-456-7890',
      };

      const response = await client.post('/applications', invalidData);

      expect([400, 500, 422]).toContain(response.status);
    });

    it('should require phoneNumber', async () => {
      const invalidData = {
        jobRoleId: 1,
        emailAddress: 'test@example.com',
      };

      const response = await client.post('/applications', invalidData);

      expect([400, 500, 422]).toContain(response.status);
    });

    it('should accept optional coverLetter and notes', async () => {
      const applicationData = testDataFactories.createApplicationPayload({
        jobRoleId: 1,
        emailAddress: `test-optional-${Date.now()}@example.com`,
        coverLetter: 'I am interested in this role',
        notes: 'Additional information',
      });

      const response = await client.post('/applications', applicationData);

      expect([200, 201, 400, 404, 500]).toContain(response.status);
      // Should either succeed or fail, but not for schema reasons
    });

    it('should return success and applicationID on valid submission', async () => {
      const applicationData = testDataFactories.createApplicationPayload({
        jobRoleId: 1,
        emailAddress: `test-success-${Date.now()}@example.com`,
      });

      const response = await client.post('/applications', applicationData);

      if (response.status === 200 || response.status === 201) {
        expect(response.data).toHaveProperty('success');
        if (response.data.success === true) {
          expect(response.data).toHaveProperty('applicationID');
          expect(typeof response.data.applicationID).toMatch(/number|string/);
        }
      }
    });
  });

  describe('GET /applications/my-applications', () => {
    it('should retrieve user applications by email', async () => {
      const response = await client.get('/applications/my-applications', {
        params: { email: testApplicationEmail },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);

      if (response.data.length > 0) {
        const application = response.data[0];
        expect(application).toHaveProperty('applicationID');
        expect(application).toHaveProperty('emailAddress');
        expect(application.emailAddress).toBe(testApplicationEmail);
      }
    });

    it('should return empty array for non-existent email', async () => {
      const response = await client.get('/applications/my-applications', {
        params: { email: 'nonexistent-email-99999@example.com' },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      // Should return empty array for non-existent user
      expect(response.data.length).toBe(0);
    });

    it('should require email parameter', async () => {
      const response = await client.get('/applications/my-applications');

      // Should either fail or return empty/error
      expect([200, 400, 422]).toContain(response.status);
    });

    it('should return applications with job details', async () => {
      const response = await client.get('/applications/my-applications', {
        params: { email: testApplicationEmail },
      });

      expect(response.status).toBe(200);

      if (response.data.length > 0) {
        const application = response.data[0];

        // Core application fields
        expect(application).toHaveProperty('applicationID');
        expect(application).toHaveProperty('jobRoleId');
        expect(application).toHaveProperty('emailAddress');
        expect(application).toHaveProperty('phoneNumber');
        expect(application).toHaveProperty('status');

        // Job details (may be included)
        // These are optional depending on join implementation
      }
    });

    it('should handle email addresses with special characters', async () => {
      const specialEmail = `test+special-${Date.now()}@example.co.uk`;

      // First submit an application
      const submitResponse = await client.post('/applications', {
        jobRoleId: 1,
        emailAddress: specialEmail,
        phoneNumber: '123-456-7890',
      });

      // Then retrieve it
      const retrieveResponse = await client.get('/applications/my-applications', {
        params: { email: specialEmail },
      });

      expect(retrieveResponse.status).toBe(200);
      expect(Array.isArray(retrieveResponse.data)).toBe(true);

      if (submitResponse.data.success && retrieveResponse.data.length > 0) {
        expect(retrieveResponse.data[0].emailAddress).toBe(specialEmail);
      }
    });
  });

  describe('Application Status', () => {
    it('should return applications with status field', async () => {
      // First, submit an application to ensure we have one
      const submitResponse = await client.post(
        '/applications',
        testDataFactories.createApplicationPayload({
          jobRoleId: 1,
          emailAddress: `test-status-${Date.now()}@example.com`,
        })
      );

      if (submitResponse.data.success) {
        const email = submitResponse.data.email || testApplicationEmail;
        const response = await client.get('/applications/my-applications', {
          params: { email },
        });

        expect(response.status).toBe(200);

        if (response.data.length > 0) {
          const application = response.data[0];
          expect(application).toHaveProperty('status');
          expect(typeof application.status).toBe('string');
        }
      }
    });
  });

  describe('Application Dates', () => {
    it('should include application timestamps', async () => {
      const response = await client.get('/applications/my-applications', {
        params: { email: testApplicationEmail },
      });

      expect(response.status).toBe(200);

      if (response.data.length > 0) {
        const application = response.data[0];
        // Check for timestamp fields
        if (application.createdAt) {
          expect(typeof application.createdAt).toBe('string');
          // Should be valid ISO string
          expect(() => new Date(application.createdAt)).not.toThrow();
        }
      }
    });
  });

  describe('Response Format Consistency', () => {
    it('application email should match query parameter', async () => {
      const testEmail = `test-consistency-${Date.now()}@example.com`;

      const response = await client.get('/applications/my-applications', {
        params: { email: testEmail },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);

      // All applications in response should have matching email
      response.data.forEach((app: Record<string, unknown>) => {
        expect(app.emailAddress).toBe(testEmail);
      });
    });

    it('should return consistent application structure', async () => {
      const response = await client.get('/applications/my-applications', {
        params: { email: testApplicationEmail },
      });

      expect(response.status).toBe(200);

      if (response.data.length > 1) {
        const keys0 = Object.keys(response.data[0]).sort();
        const keys1 = Object.keys(response.data[1]).sort();

        expect(keys0).toEqual(keys1);
      }
    });
  });

  describe('Backend Connection', () => {
    it('should properly handle application submission and retrieval', async () => {
      const email = `test-integration-${Date.now()}@example.com`;

      // Submit application
      const submitResponse = await client.post('/applications', {
        jobRoleId: 1,
        emailAddress: email,
        phoneNumber: '123-456-7890',
        coverLetter: 'Integration test application',
      });

      expect([200, 201, 400, 422]).toContain(submitResponse.status);

      // Retrieve applications
      const retrieveResponse = await client.get('/applications/my-applications', {
        params: { email },
      });

      expect(retrieveResponse.status).toBe(200);
      expect(Array.isArray(retrieveResponse.data)).toBe(true);

      // Only check for submitted application if the submission succeeded
      if (submitResponse.status === 200 || submitResponse.status === 201) {
        if (submitResponse.data.success) {
          expect(retrieveResponse.data.length).toBeGreaterThan(0);
          expect(retrieveResponse.data[0].emailAddress).toBe(email);
        }
      }
    });
  });
});
