import type { Page } from '@playwright/test';

export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    // Look for authenticated user elements - avatar with user initial
    const userAvatar = page.locator('.avatar.placeholder');
    const signInButton = page.locator('text="Sign In"');

    // Check if user avatar is visible and sign in button is NOT visible
    const hasUserAvatar = await userAvatar.isVisible({ timeout: 3000 });
    const hasSignIn = await signInButton.isVisible({ timeout: 1000 }).catch(() => false);

    return hasUserAvatar && !hasSignIn;
  } catch {
    return false;
  }
}

export async function logout(page: Page, baseURL: string): Promise<void> {
  // Logout is done via POST to /auth/logout
  // We'll use page.request to make the POST request
  await page.request.post(`${baseURL}/auth/logout`);
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
}
