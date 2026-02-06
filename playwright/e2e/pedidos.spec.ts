import { test, expect } from '@playwright/test';

test('check approved order', async ({ page }) => {

    // Test data
    const orderID = 'VLO-5QGHJX'

    // AAA pattern: Arrange, Act, Assert
    // Arrange
    await page.goto('http://localhost:5173');
    await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint');
    await page.getByRole('link', { name: 'Consultar Pedido' }).click();
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido');

    // Act
    await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(orderID);
    await page.getByRole('button', { name: 'Buscar Pedido' }).click();

    // Assert without ID
    // Xpath locator: const orderId = page.locator('//p[text()="Pedido"/..//p[text()=orderID]]');

    // PW locator strategy:
    const orderContainer = page.getByRole('paragraph').filter({ hasText: /^Pedido$/ }).locator('..'); // climb to the parent element
    await expect(orderContainer).toContainText(orderID);

    // Simpler validation but more prone to errors if part of the page has the text "APROVADO"
    await expect(page.getByText('APROVADO')).toBeVisible();

});

test('check order not found message', async({ page }) => {

    const orderNotFound = 'VLO-123ABC'

    // Arrange
    await page.goto('http://localhost:5173');
    await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint');
    await page.getByRole('link', { name: 'Consultar Pedido' }).click();
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido');

    // Act
    await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(orderNotFound);
    await page.getByRole('button', { name: 'Buscar Pedido' }).click();

    // Assert
    // Snapshot locator strategy
    await expect(page.locator('#root')).toMatchAriaSnapshot(`
        - img
        - heading "Pedido não encontrado" [level=3]
        - paragraph: Verifique o número do pedido e tente novamente
        `);

})