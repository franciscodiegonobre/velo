import { test } from '@playwright/test'

import { generateOrderCode } from '../support/helpers'
import { NavBar } from '../support/components/NavBar'
import { LandingPage } from '../support/pages/LandingPage'
import { OrderLookupPage, type OrderDetails } from '../support/pages/OrderLookupPage'

/// AAA - Arrange, Act, Assert

test.describe('Order check', () => {

  let orderLookupPage: OrderLookupPage

  test.beforeEach(async ({ page }) => {
    const landingPage = new LandingPage(page)
    await landingPage.goto()

    // Doesn't need instantiation if it's being used only once
    await new NavBar(page).clickConsultarPedido()

    orderLookupPage = new OrderLookupPage(page)
    orderLookupPage.verifyPageLoaded()
  })

  test('check approved order', async () => {
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

    await orderLookupPage.searchOrder(order.number)

    await orderLookupPage.validateOrderDetails(order)

    await orderLookupPage.validateStatusBadge(order.status)

  })

  test('check disapproved order', async () => {
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

    await orderLookupPage.searchOrder(order.number)

    await orderLookupPage.validateOrderDetails(order)

    await orderLookupPage.validateStatusBadge(order.status)
  })

  test('check in analysis order', async () => {
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

    await orderLookupPage.searchOrder(order.number)

    await orderLookupPage.validateOrderDetails(order)

    await orderLookupPage.validateStatusBadge(order.status)
  })

  test('check not found message when order is in expected format', async () => {

    const order = generateOrderCode()

    await orderLookupPage.searchOrder(order)

    await orderLookupPage.validateOrderNotFound()

  })

  test('check not found message when order is NOT in expected format', async () => {

    await orderLookupPage.searchOrder('ABC123')

    await orderLookupPage.validateOrderNotFound()

  })
})