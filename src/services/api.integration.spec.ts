/**
 * Integration Tests: Job Routes
 * Tests the frontend-backend communication for job-related endpoints
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  BACKEND_URL,
  createTestClient,
  testDataFactories,
  assertResponseShape,
  assertArrayResponseShape,
  setupIntegrationTest,
} from './integration.setup.js';

setupIntegrationTest();

describe('Job Routes Integration Tests', () => {
  let client = createTestClient();

  beforeAll(() => {
    client = createTestClient();
  });

  describe('GET /jobs', () => {
    it('should return a list of jobs', async () => {
      const response = await client.get('/jobs');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);

      if (response.data.length > 0) {
        const expectedJobKeys = [
          'id',
          'name',
          'location',
          'capabilityName',
          'bandName',
          'statusName',
          'closingDate',
        ];
        expect(assertArrayResponseShape(response.data, expectedJobKeys)).toBe(true);
      }
    });

    it('should return jobs with all required fields', async () => {
      const response = await client.get('/jobs');

      expect(response.status).toBe(200);

      if (response.data.length > 0) {
        const job = response.data[0];
        expect(job).toHaveProperty('id');
        expect(job).toHaveProperty('name');
        expect(job).toHaveProperty('location');
        expect(job).toHaveProperty('capabilityName');
        expect(job).toHaveProperty('bandName');
        expect(job).toHaveProperty('statusName');
        expect(job).toHaveProperty('closingDate');
      }
    });

    it('should handle query parameters for sorting and pagination', async () => {
      const response = await client.get('/jobs', {
        params: {
          sortBy: 'name',
          sortOrder: 'asc',
          limit: 10,
          offset: 0,
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('GET /jobs/:id', () => {
    it('should return a single job by ID', async () => {
      // First get a list of jobs to get a valid ID
      const listResponse = await client.get('/jobs');
      expect(listResponse.status).toBe(200);
      expect(listResponse.data.length).toBeGreaterThan(0);

      const jobId = listResponse.data[0].id;

      // Now get the specific job
      const response = await client.get(`/jobs/${jobId}`);

      expect(response.status).toBe(200);
      // Could be array or single object depending on backend implementation
      const jobData = Array.isArray(response.data) ? response.data[0] : response.data;
      expect(jobData).toHaveProperty('id');
      expect(jobData).toHaveProperty('name');
    });

    it('should return 404 for non-existent job', async () => {
      const response = await client.get('/jobs/99999');

      expect([404, 500]).toContain(response.status);
    });

    it('should return job with extended details', async () => {
      const listResponse = await client.get('/jobs');
      if (listResponse.data.length > 0) {
        const jobId = listResponse.data[0].id;
        const response = await client.get(`/jobs/${jobId}`);

        expect(response.status).toBe(200);
        const jobData = Array.isArray(response.data) ? response.data[0] : response.data;
        // These fields may or may not be present depending on the job
        expect(jobData).toHaveProperty('id');
        expect(jobData).toHaveProperty('closingDate');
      }
    });
  });

  describe('GET /capabilities', () => {
    it('should return a list of capabilities', async () => {
      const response = await client.get('/capabilities');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);

      if (response.data.length > 0) {
        const expectedKeys = ['id', 'name'];
        expect(assertArrayResponseShape(response.data, expectedKeys)).toBe(true);
      }
    });

    it('should return capabilities with id and name fields', async () => {
      const response = await client.get('/capabilities');

      expect(response.status).toBe(200);

      if (response.data.length > 0) {
        const capability = response.data[0];
        expect(capability).toHaveProperty('id');
        expect(capability).toHaveProperty('name');
        expect(typeof capability.id).toMatch(/number|string/);
        expect(typeof capability.name).toBe('string');
      }
    });
  });

  describe('GET /bands', () => {
    it('should return a list of bands', async () => {
      const response = await client.get('/bands');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);

      if (response.data.length > 0) {
        const expectedKeys = ['id', 'name'];
        expect(assertArrayResponseShape(response.data, expectedKeys)).toBe(true);
      }
    });

    it('should return bands with id and name fields', async () => {
      const response = await client.get('/bands');

      expect(response.status).toBe(200);

      if (response.data.length > 0) {
        const band = response.data[0];
        expect(band).toHaveProperty('id');
        expect(band).toHaveProperty('name');
        expect(typeof band.id).toMatch(/number|string/);
        expect(typeof band.name).toBe('string');
      }
    });
  });

  describe('GET /statuses', () => {
    it('should return a list of statuses', async () => {
      const response = await client.get('/statuses');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should return statuses with expected structure', async () => {
      const response = await client.get('/statuses');

      expect(response.status).toBe(200);

      if (response.data.length > 0) {
        const status = response.data[0];
        // Status should have at least an id and name
        expect(status).toHaveProperty('id');
        expect(status).toHaveProperty('name');
      }
    });
  });

  describe('Response Shape Consistency', () => {
    it('job data from list should match data from detail endpoint', async () => {
      const listResponse = await client.get('/jobs');
      expect(listResponse.status).toBe(200);

      if (listResponse.data.length > 0) {
        const jobFromList = listResponse.data[0];
        const detailResponse = await client.get(`/jobs/${jobFromList.id}`);

        expect(detailResponse.status).toBe(200);
        const jobFromDetail = Array.isArray(detailResponse.data)
          ? detailResponse.data[0]
          : detailResponse.data;

        // Should have matching core fields
        expect(jobFromDetail.id).toBe(jobFromList.id);
        expect(jobFromDetail.name).toBe(jobFromList.name);
        expect(jobFromDetail.location).toBe(jobFromList.location);
      }
    });

    it('should return consistent data types across requests', async () => {
      const response1 = await client.get('/jobs');
      const response2 = await client.get('/jobs');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      // Both should be arrays
      expect(Array.isArray(response1.data)).toBe(true);
      expect(Array.isArray(response2.data)).toBe(true);

      // If both have data, they should have same structure
      if (response1.data.length > 0 && response2.data.length > 0) {
        const job1 = response1.data[0];
        const job2 = response2.data[0];

        expect(Object.keys(job1).sort()).toEqual(Object.keys(job2).sort());
      }
    });
  });

  describe('Backend Connection', () => {
    it('should be able to reach the backend', async () => {
      const response = await client.get('/');

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    it('should return proper error for invalid routes', async () => {
      const response = await client.get('/invalid-endpoint-12345');

      expect([404, 405]).toContain(response.status);
    });
  });
});
