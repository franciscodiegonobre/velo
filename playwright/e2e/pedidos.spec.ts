import { test, expect } from '@playwright/test';

test('check approved order', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  // checkpoint 1
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint');
  
  await page.getByRole('link', { name: 'Consultar Pedido' }).click();
  // checkpoint 2
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido');
  await page.getByTestId('search-order-id').fill('VLO-5QGHJX');
  await page.getByTestId('search-order-button').click();

  // checkpoint 3
  await expect(page.getByTestId('order-result-id')).toBeVisible();
  await expect(page.getByTestId('order-result-id')).toContainText('VLO-5QGHJX');
  await expect(page.getByTestId('order-result-status')).toBeVisible();
  await expect(page.getByTestId('order-result-status')).toContainText('APROVADO');
});