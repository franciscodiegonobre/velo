import { test, expect } from '../support/fixtures';

test('webapp should be online', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Velô by Papito/);
}); 
