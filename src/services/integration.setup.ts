/**
 * Integration Test Setup
 * Provides utilities for testing frontend-backend communication
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { beforeAll, afterAll, afterEach } from 'vitest';

// Use test backend URL or fallback to localhost
export const BACKEND_URL = process.env['INTEGRATION_TEST_BACKEND_URL'] || 'http://localhost:3001';

/**
 * Creates a test API client with optional authentication
 */
export const createTestClient = (accessToken?: string): AxiosInstance => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const client = axios.create({
    baseURL: BACKEND_URL,
    headers,
    validateStatus: () => true, // Don't throw on any status code
  });

  // Ensure header is available at client.defaults.headers.common for tests that inspect it
  // axios may not populate nested `defaults.headers.common` on creation in some versions
  if (!client.defaults.headers) client.defaults.headers = {} as any;
  if (!client.defaults.headers.common) client.defaults.headers.common = {} as any;
  if (accessToken) {
    client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  return client;
};


/**
 * Test data factories
 */
export const testDataFactories = {
  /**
   * Create a test job application payload
   */
  createApplicationPayload: (overrides?: Partial<{
    jobRoleId: number;
    emailAddress: string;
    phoneNumber: string;
    coverLetter?: string;
    notes?: string;
  }>) => ({
    jobRoleId: 1,
    emailAddress: `test-${Date.now()}@example.com`,
    phoneNumber: '123-456-7890',
    coverLetter: 'I am very interested in this role.',
    notes: 'Additional notes about the application.',
    ...overrides,
  }),

  /**
   * Create a test job role payload
   */
  createJobRolePayload: (overrides?: Partial<{
    name: string;
    location: string;
    capabilityId: number;
    bandId: number;
    statusId: number;
    closingDate: string;
    description?: string;
    responsibilities?: string;
    jobSpecUrl?: string;
    openPositions?: number;
  }>) => ({
    name: `Test Role ${Date.now()}`,
    location: 'London',
    capabilityId: 1,
    bandId: 1,
    statusId: 1,
    closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Test job description',
    responsibilities: 'Test responsibilities',
    openPositions: 1,
    ...overrides,
  }),

  /**
   * Create an update job role payload
   */
  updateJobRolePayload: (overrides?: Partial<{
    name?: string;
    location?: string;
    closingDate?: string;
    statusId?: number;
  }>) => ({
    location: 'Manchester',
    statusId: 2,
    ...overrides,
  }),
};

/**
 * Helper to check if a response matches expected shape
 */
export const assertResponseShape = (
  data: unknown,
  expectedKeys: string[]
): boolean => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;
  return expectedKeys.every((key) => key in obj);
};

/**
 * Helper to check if response is an array of objects with expected keys
 */
export const assertArrayResponseShape = (
  data: unknown,
  expectedKeys: string[]
): boolean => {
  if (!Array.isArray(data)) {
    return false;
  }

  return data.length > 0 && data.every((item) => assertResponseShape(item, expectedKeys));
};

/**
 * Setup and teardown utilities for integration tests
 */
export const setupIntegrationTest = () => {
  beforeAll(() => {
    // Verify backend is running
    console.log(`Integration tests will run against: ${BACKEND_URL}`);
  });

  afterEach(async () => {
    // Add any cleanup needed between tests here
    // For example: clear test data, reset state, etc.
  });

  afterAll(async () => {
    // Final cleanup after all tests
    console.log('Integration tests completed');
  });
};

/**
 * Wait for a condition to be true or timeout
 */
export const waitFor = async (
  condition: () => boolean | Promise<boolean>,
  timeoutMs = 5000,
  intervalMs = 100
): Promise<void> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Condition not met within ${timeoutMs}ms`);
};
