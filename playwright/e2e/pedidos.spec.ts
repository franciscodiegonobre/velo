import { test, expect } from '@playwright/test';
import { generateOrderId } from '../support/helpers';
import { OrderLookupPage } from '../support/pages/OrderLookupPage';

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
        const orderLookupPage = new OrderLookupPage(page)
        await orderLookupPage.searchOrder(order.orderID)

        // Assert
        await expect(page.getByTestId(`order-result-${order.orderID}`)).toMatchAriaSnapshot(`
            - img
            - paragraph: Pedido
            - paragraph: ${order.orderID}
            - status:
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

        // Validate badge style = css classes
        const statusBadge = page.getByRole('status').filter({ hasText: order.status })
        await expect(statusBadge).toContainClass('bg-green-100')
        await expect(statusBadge).toContainClass('text-green-700')

        const statusIcon = statusBadge.locator('svg')
        await expect(statusIcon).toContainClass('lucide-circle-check-big')

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
        const orderLookupPage = new OrderLookupPage(page)
        await orderLookupPage.searchOrder(order.orderID)

        // Assert
        await expect(page.getByTestId(`order-result-${order.orderID}`)).toMatchAriaSnapshot(`
            - img
            - paragraph: Pedido
            - paragraph: ${order.orderID}
            - status:
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

        // Validate badge style = css classes
        const statusBadge = page.getByRole('status').filter({ hasText: order.status })
        await expect(statusBadge).toContainClass('bg-red-100')
        await expect(statusBadge).toContainClass('text-red-700')

        const statusIcon = statusBadge.locator('svg')
        await expect(statusIcon).toContainClass('lucide-circle-x')

    });

    test('check in analysis order', async ({ page }) => {

        const order = {
            orderID: 'VLO-FI4H5T',
            status: 'EM_ANALISE',
            color: 'Lunar White',
            wheels: 'aero Wheels',
            customer: {
                name: 'Joao da Silva',
                email: 'joao@velo.dev'
            },
            payment: 'À Vista'
        }

        // Act
        const orderLookupPage = new OrderLookupPage(page)
        await orderLookupPage.searchOrder(order.orderID)

        // Assert
        await expect(page.getByTestId(`order-result-${order.orderID}`)).toMatchAriaSnapshot(`
            - img
            - paragraph: Pedido
            - paragraph: ${order.orderID}
            - status:
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

        // Validate badge style = css classes
        const statusBadge = page.getByRole('status').filter({ hasText: order.status })
        await expect(statusBadge).toContainClass('bg-amber-100')
        await expect(statusBadge).toContainClass('text-amber-700')

        const statusIcon = statusBadge.locator('svg')
        await expect(statusIcon).toContainClass('lucide-clock')

    });

    test('check order not found message', async ({ page }) => {

        const orderNotFound = generateOrderId()

        // Act
        const orderLookupPage = new OrderLookupPage(page)
        await orderLookupPage.searchOrder(orderNotFound)

        // Assert
        // Snapshot locator strategy
        await expect(page.locator('#root')).toMatchAriaSnapshot(`
            - img
            - heading "Pedido não encontrado" [level=3]
            - paragraph: Verifique o número do pedido e tente novamente
            `);

    })

})