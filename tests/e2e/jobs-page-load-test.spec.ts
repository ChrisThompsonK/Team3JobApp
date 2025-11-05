import { expect, test } from '@playwright/test';
import { JobListingsPage } from '../pages/index.js';

test.describe('Jobs listed', () => {
    test('should load available jobs page successfully', async ({ page}) => {
        //initialize JobListingsPage object
        const jobListingsPage = new JobListingsPage(page);

        //Navigate to the application
        await jobListingsPage.goto();

        
        //Verify page title (basic check for a user)
        await expect(page).toHaveTitle(/Kainos.*Job.*Portal|Available Job Roles/i);

    })
})