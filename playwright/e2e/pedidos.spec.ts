import { test, expect } from '@playwright/test';
import { generateOrderId } from '../support/helpers';

test.describe('Order check', () => {

    test.beforeEach(async ({ page }) => {
        // Arrange
        await page.goto('http://localhost:5173');
        await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint');
        await page.getByRole('link', { name: 'Consultar Pedido' }).click();
        await expect(page.getByRole('heading')).toContainText('Consultar Pedido');

    })

    test('check approved order', async ({ page }) => {

        // Test data
        // const orderID = 'VLO-5QGHJX'
        const order = {
            orderID: 'VLO-5QGHJX',
            status: 'APROVADO',
            color: 'Lunar White',
            wheels: 'aero Wheels',
            customer: {
                name: 'francisco nobre',
                email: 'fran@test.com'
            },
            payment: 'À Vista'
        }

        // Act
        await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order.orderID);
        await page.getByRole('button', { name: 'Buscar Pedido' }).click();

        await expect(page.getByTestId(`order-result-${order.orderID}`)).toMatchAriaSnapshot(`
            - img
            - paragraph: Pedido
            - paragraph: ${order.orderID}
            - img
            - text: ${order.status}
            - img "Velô Sprint"
            - paragraph: Modelo
            - paragraph: Velô Sprint
            - paragraph: Cor
            - paragraph: ${order.color}
            - paragraph: Interior
            - paragraph: cream
            - paragraph: Rodas
            - paragraph: ${order.wheels}
            - heading "Dados do Cliente" [level=4]
            - paragraph: Nome
            - paragraph: ${order.customer.name}
            - paragraph: Email
            - paragraph: ${order.customer.email}
            - paragraph: Loja de Retirada
            - paragraph
            - paragraph: Data do Pedido
            - paragraph: /\\d+\\/\\d+\\/\\d+/
            - heading "Pagamento" [level=4]
            - paragraph: ${order.payment}
            - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
            `);

        // // Assert without ID
        // // Xpath locator: const orderId = page.locator('//p[text()="Pedido"/..//p[text()=orderID]]');

        // // PW locator strategy:
        // const orderContainer = page.getByRole('paragraph').filter({ hasText: /^Pedido$/ }).locator('..'); // climb to the parent element
        // await expect(orderContainer).toContainText(orderID);

        // // Simpler validation but more prone to errors if part of the page has the text "APROVADO"
        // await expect(page.getByText('APROVADO')).toBeVisible();

    });

    test('check disapproved order', async ({ page }) => {

        // Test data
        // const orderID = 'VLO-JMXE4O'

        const order = {
            orderID: 'VLO-JMXE4O',
            status: 'REPROVADO',
            color: 'Midnight Black',
            wheels: 'sport Wheels',
            customer: {
                name: 'Steven Jobs',
                email: 'jobs@apple.com'
            },
            payment: 'À Vista'
        }

        // Act
        await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order.orderID);
        await page.getByRole('button', { name: 'Buscar Pedido' }).click();

        await expect(page.getByTestId(`order-result-${order.orderID}`)).toMatchAriaSnapshot(`
            - img
            - paragraph: Pedido
            - paragraph: ${order.orderID}
            - img
            - text: ${order.status}
            - img "Velô Sprint"
            - paragraph: Modelo
            - paragraph: Velô Sprint
            - paragraph: Cor
            - paragraph: ${order.color}
            - paragraph: Interior
            - paragraph: cream
            - paragraph: Rodas
            - paragraph: ${order.wheels}
            - heading "Dados do Cliente" [level=4]
            - paragraph: Nome
            - paragraph: ${order.customer.name}
            - paragraph: Email
            - paragraph: ${order.customer.email}
            - paragraph: Loja de Retirada
            - paragraph
            - paragraph: Data do Pedido
            - paragraph: /\\d+\\/\\d+\\/\\d+/
            - heading "Pagamento" [level=4]
            - paragraph: ${order.payment}
            - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
            `);

        // // Assert without ID
        // // Xpath locator: const orderId = page.locator('//p[text()="Pedido"/..//p[text()=orderID]]');

        // // PW locator strategy:
        // const orderContainer = page.getByRole('paragraph').filter({ hasText: /^Pedido$/ }).locator('..'); // climb to the parent element
        // await expect(orderContainer).toContainText(orderID);

        // // Simpler validation but more prone to errors if part of the page has the text "APROVADO"
        // await expect(page.getByText('APROVADO')).toBeVisible();

    });

    test('check order not found message', async ({ page }) => {

        const orderNotFound = generateOrderId()

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

})