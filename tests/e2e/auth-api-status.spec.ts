import { expect, test } from '@playwright/test';
import { testUsers } from '../fixtures/data/test-data.js';

test.describe('Authentication API Status Codes', () => {
  const baseURL = 'http://localhost:3000';

  test('GET /auth/login with error params returns 200', async ({ request }) => {
    const response = await request.get(
      `${baseURL}/auth/login?error=Invalid%20email%20or%20password&returnUrl=%2F`
    );
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('Invalid email or password');
  });

  test('GET /auth/login returns 200', async ({ request }) => {
    const response = await request.get(`${baseURL}/auth/login`);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('Sign in to your account');
  });

  test('GET /auth/register with error params returns 200', async ({ request }) => {
    const response = await request.get(
      `${baseURL}/auth/register?error=Please%20enter%20a%20valid%20email%20address`
    );
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('Please enter a valid email address');
  });

  test('POST /auth/login valid credentials redirects 302', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth/login`, {
      form: { email: testUsers.admin.email, password: testUsers.admin.password, returnUrl: '/' },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(302);
    expect(response.headers()['location']).toBe('/');
  });

  test('POST /auth/login invalid credentials redirects 302', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth/login`, {
      form: { email: 'invalid@test.com', password: 'wrong', returnUrl: '/' },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(302);
    expect(response.headers()['location']).toContain('/auth/login?error=');
  });

  test('POST /auth/login missing email redirects 302', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth/login`, {
      form: { password: 'pass', returnUrl: '/' },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(302);
    expect(response.headers()['location']).toContain('/auth/login?error=');
  });

  test('POST /auth/login missing password redirects 302', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth/login`, {
      form: { email: 'test@test.com', returnUrl: '/' },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(302);
    expect(response.headers()['location']).toContain('/auth/login?error=');
  });

  test('GET /auth/register returns 200', async ({ request }) => {
    const response = await request.get(`${baseURL}/auth/register`);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('Register');
  });

  test('POST /auth/register valid data redirects 302', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth/register`, {
      form: {
        email: `test-${Date.now()}@example.com`,
        password: 'ValidPass123!',
        confirmPassword: 'ValidPass123!',
      },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(302);
    expect(response.headers()['location']).toBe('/');
  });

  test('POST /auth/register missing fields redirects 302', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth/register`, {
      form: { email: 'test@example.com' },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(302);
    expect(response.headers()['location']).toContain('/auth/register?error=');
  });

  test('POST /auth/register password mismatch redirects 302', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth/register`, {
      form: {
        email: 'test@example.com',
        password: 'Pass123!',
        confirmPassword: 'Different123!',
      },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(302);
    expect(response.headers()['location']).toContain('/auth/register?error=');
  });

  test('POST /auth/register existing email redirects 302', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth/register`, {
      form: {
        email: testUsers.admin.email,
        password: 'NewPass123!',
        confirmPassword: 'NewPass123!',
      },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(302);
    expect(response.headers()['location']).toContain('/auth/register?error=');
  });

  test('POST /auth/login malformed data returns 500', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth/login`, {
      data: 'invalid json',
      headers: { 'Content-Type': 'application/json' },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(500);
  });
});
