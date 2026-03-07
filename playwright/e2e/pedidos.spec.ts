import { generateOrderCode } from '../support/helpers'
import { test, expect } from '../support/fixtures'
import type { OrderDetails } from '../support/actions/orderLookupActions'

/// AAA - Arrange, Act, Assert

test.describe('Order check', () => {
  test.beforeEach(async ({ app }) => {
    await app.orderLookup.open()
  })

  test('check approved order', async ({ app }) => {
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

    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(order)
    await app.orderLookup.validateStatusBadge(order.status)

  })

  test('check disapproved order', async ({ app }) => {
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

    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(order)
    await app.orderLookup.validateStatusBadge(order.status)
  })

  test('check in analysis order', async ({ app }) => {
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

    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(order)
    await app.orderLookup.validateStatusBadge(order.status)
  })

  test('check not found message when order is in expected format', async ({ app }) => {

    const order = generateOrderCode()

    await app.orderLookup.searchOrder(order)

    await app.orderLookup.validateOrderNotFound()

  })

  test('check not found message when order is NOT in expected format', async ({ app }) => {

    await app.orderLookup.searchOrder('ABC123')

    await app.orderLookup.validateOrderNotFound()

  })

  test('keep the search button disabled if the order is empty or has spaces', async ({ app }) => {

    const button = app.orderLookup.elements.searchButton
    await expect(button).toBeDisabled()

    await app.orderLookup.elements.orderInput.fill(' ')
    await expect(button).toBeDisabled()

    await app.orderLookup.elements.orderInput.fill('VLO-ABC123')
    await expect(button).toBeEnabled()
  })
})