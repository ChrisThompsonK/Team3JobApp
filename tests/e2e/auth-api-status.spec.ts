import { expect, test } from '@playwright/test';
import { testUsers } from '../fixtures/data/test-data.js';

test.describe('Authentication API Status Codes', () => {
  const baseURL = 'http://localhost:3000';

  test('GET /auth/login should return 200 with error query params', async ({ request }) => {
    const response = await request.get(
      `${baseURL}/auth/login?error=Invalid%20email%20or%20password&returnUrl=%2F`,
      {
        headers: {
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
          'Cache-Control': 'max-age=0',
          Connection: 'keep-alive',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
          'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
        },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('Invalid email or password'); // Check that error message is displayed
  });

  test('GET /auth/login should return 200 without query params', async ({ request }) => {
    const response = await request.get(`${baseURL}/auth/login`);
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('Sign in to your account'); // Check for login form title
  });

  test('GET /auth/register should return 200 with error query params', async ({ request }) => {
    const response = await request.get(
      `${baseURL}/auth/register?error=Please%20enter%20a%20valid%20email%20address`,
      {
        headers: {
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
          'Cache-Control': 'max-age=0',
          Connection: 'keep-alive',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
          'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
        },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('Please enter a valid email address'); // Check that error message is displayed
  });

  test('POST /auth/login with valid credentials should redirect (302)', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth/login`, {
      form: {
        email: testUsers.admin.email,
        password: testUsers.admin.password,
        returnUrl: '/',
      },
      maxRedirects: 0, // Don't follow redirects to check status code
    });

    expect(response.status()).toBe(302);
    expect(response.headers()['location']).toBe('/');
  });

  test('POST /auth/login with invalid credentials should redirect to login with error (302)', async ({
    request,
  }) => {
    const response = await request.post(`${baseURL}/auth/login`, {
      form: {
        email: 'invalid@test.com',
        password: 'wrongpassword',
        returnUrl: '/',
      },
      maxRedirects: 0,
    });

    expect(response.status()).toBe(302);
    const location = response.headers()['location'];
    expect(location).toContain('/auth/login?error=');
    expect(location).toContain('returnUrl=%2F');
  });

  test('POST /auth/login with missing email should redirect with error (302)', async ({
    request,
  }) => {
    const response = await request.post(`${baseURL}/auth/login`, {
      form: {
        password: 'password123',
        returnUrl: '/',
      },
      maxRedirects: 0,
    });

    expect(response.status()).toBe(302);
    const location = response.headers()['location'];
    expect(location).toContain('/auth/login?error=');
    expect(location).toContain('Email%20and%20password%20are%20required');
  });

  test('POST /auth/login with missing password should redirect with error (302)', async ({
    request,
  }) => {
    const response = await request.post(`${baseURL}/auth/login`, {
      form: {
        email: 'test@test.com',
        returnUrl: '/',
      },
      maxRedirects: 0,
    });

    expect(response.status()).toBe(302);
    const location = response.headers()['location'];
    expect(location).toContain('/auth/login?error=');
    expect(location).toContain('Email%20and%20password%20are%20required');
  });

  test('GET /auth/register should return 200 without query params', async ({ request }) => {
    const response = await request.get(`${baseURL}/auth/register`);
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('Register'); // Basic check for register form
  });

  test('POST /auth/register with valid data should redirect (302)', async ({ request }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const response = await request.post(`${baseURL}/auth/register`, {
      form: {
        email: uniqueEmail,
        password: 'ValidPassword123!',
        confirmPassword: 'ValidPassword123!',
      },
      maxRedirects: 0,
    });

    expect(response.status()).toBe(302);
    expect(response.headers()['location']).toBe('/');
  });

  test('POST /auth/register with missing fields should redirect with error (302)', async ({
    request,
  }) => {
    const response = await request.post(`${baseURL}/auth/register`, {
      form: {
        email: 'test@example.com',
        // missing password and confirmPassword
      },
      maxRedirects: 0,
    });

    expect(response.status()).toBe(302);
    const location = response.headers()['location'];
    expect(location).toContain('/auth/register?error=');
    expect(location).toContain('All%20fields%20are%20required');
  });

  test('POST /auth/register with password mismatch should redirect with error (302)', async ({
    request,
  }) => {
    const response = await request.post(`${baseURL}/auth/register`, {
      form: {
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
      },
      maxRedirects: 0,
    });

    expect(response.status()).toBe(302);
    const location = response.headers()['location'];
    expect(location).toContain('/auth/register?error=');
  });

  test('POST /auth/register with existing email should redirect with error (302)', async ({
    request,
  }) => {
    const response = await request.post(`${baseURL}/auth/register`, {
      form: {
        email: testUsers.admin.email, // existing email
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      },
      maxRedirects: 0,
    });

    expect(response.status()).toBe(302);
    const location = response.headers()['location'];
    expect(location).toContain('/auth/register?error=');
  });

  test('POST /auth/login with malformed data should handle gracefully', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth/login`, {
      data: 'invalid json',
      headers: {
        'Content-Type': 'application/json',
      },
      maxRedirects: 0,
    });

    // Express returns 500 for malformed JSON
    expect(response.status()).toBe(500);
  });
});
