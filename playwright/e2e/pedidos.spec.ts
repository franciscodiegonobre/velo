import { test, expect } from '@playwright/test'

import { generateOrderCode } from '../support/helpers'

import { OrderLookupPage, type OrderDetails } from '../support/pages/OrderLookupPage'

/// AAA - Arrange, Act, Assert

test.describe('Order check', () => {

  test.beforeEach(async ({ page }) => {
    // Arrange
    await page.goto('http://localhost:5173/')
    await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')

    await page.getByRole('link', { name: 'Consultar Pedido' }).click()
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido')
  })

  test('check approved order', async ({ page }) => {

    // Test Data
    const order: OrderDetails = {
      number: 'VLO-5QGHJX',
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
    await orderLookupPage.searchOrder(order.number)

    // Assert
    await orderLookupPage.validateOrderDetails(order)

    // Validação do badge de status encapsulada no Page Object
    await orderLookupPage.validateStatusBadge(order.status)

  })

  test('check disapproved order', async ({ page }) => {

    // Test Data
    const order: OrderDetails = {
      number: 'VLO-JMXE4O',
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
    await orderLookupPage.searchOrder(order.number)

    // Assert
    await orderLookupPage.validateOrderDetails(order)

    // Validação do badge de status encapsulada no Page Object
    await orderLookupPage.validateStatusBadge(order.status)
  })

  test('check in analysis order', async ({ page }) => {

    // Test Data
    const order: OrderDetails = {
      number: 'VLO-FI4H5T',
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
    await orderLookupPage.searchOrder(order.number)

    // Assert
    await orderLookupPage.validateOrderDetails(order)

    // Validação do badge de status encapsulada no Page Object
    await orderLookupPage.validateStatusBadge(order.status)
  })

  test('check not found message when order is in expected format', async ({ page }) => {

    const order = generateOrderCode()

    const orderLookupPage = new OrderLookupPage(page)
    await orderLookupPage.searchOrder(order)


    await orderLookupPage.validateOrderNotFound()

  })

  test('check not found message when order is NOT in expected format', async ({ page }) => {

    const orderLookupPage = new OrderLookupPage(page)
    await orderLookupPage.searchOrder('ABC123')
    await orderLookupPage.validateOrderNotFound()

  })
})