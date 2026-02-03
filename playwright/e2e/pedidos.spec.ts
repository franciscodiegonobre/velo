import { test, expect } from '@playwright/test';

test('check approved order', async ({ page }) => {
  // AAA pattern: Arrange, Act, Assert
  // Arrange
  await page.goto('http://localhost:5173');
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint');
  await page.getByRole('link', { name: 'Consultar Pedido' }).click();
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido');

  // Act
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill('VLO-5QGHJX');
  await page.getByRole('button', { name: 'Buscar Pedido' }).click();

  // Assert
  // PW locator strategy
  await expect(page.getByText('VLO-5QGHJX')).toBeVisible({ timeout: 10000 });
  // Xpath locator
  await expect(page.locator('//p[text()="VLO-5QGHJX"]')).toContainText('VLO-5QGHJX');
  await expect(page.getByText('APROVADO')).toBeVisible();
  // CSS locator
  await expect(page.locator('div.text-green-700')).toContainText('APROVADO');
});