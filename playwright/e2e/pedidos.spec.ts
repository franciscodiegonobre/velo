import { test, expect } from '../support/fixtures'
import { generateOrderCode } from '../support/helpers'
import { insertOrder, deleteOrderByNumber, toOrderDetails } from '../support/database/orderRepository'
import type { OrderSeed } from '../support/database/orderRepository'

import testData from '../support/fixtures/orders.json' with { type: 'json' }

test.describe('Consulta de Pedido', () => {

  test.beforeEach(async ({ app }) => {
    await app.orderLookup.open()
  })

  test('deve consultar um pedido aprovado', async ({ app }) => {
    const order: OrderSeed = testData.aprovado as OrderSeed
    const orderDetails = toOrderDetails(order)

    await deleteOrderByNumber(order.number)
    await insertOrder(order)

    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(orderDetails)
    await app.orderLookup.validateStatusBadge(orderDetails.status)
  })

  test('deve consultar um pedido reprovado', async ({ app }) => {
    const order: OrderSeed = testData.reprovado as OrderSeed
    const orderDetails = toOrderDetails(order)

    await deleteOrderByNumber(order.number)
    await insertOrder(order)

    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(orderDetails)
    await app.orderLookup.validateStatusBadge(orderDetails.status)
  })

  test('deve consultar um pedido em analise', async ({ app }) => {
    const order: OrderSeed = testData.em_analise as OrderSeed
    const orderDetails = toOrderDetails(order)

    await deleteOrderByNumber(order.number)
    await insertOrder(order)

    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(orderDetails)
    await app.orderLookup.validateStatusBadge(orderDetails.status)
  })

  test('deve exibir mensagem quando o pedido não é encontrado', async ({ app }) => {
    const order = generateOrderCode()
    await app.orderLookup.searchOrder(order)
    await app.orderLookup.validateOrderNotFound()
  })

  test('deve exibir mensagem quando o código do pedido está fora do padrão', async ({ app }) => {
    const orderCode = 'XYZ-999-INVALIDO'
    await app.orderLookup.searchOrder(orderCode)
    await app.orderLookup.validateOrderNotFound()
  })

  test('deve manter o botão de busca desabilitado com campo vazio ou apenas espaços', async ({ app, page }) => {
    const button = app.orderLookup.elements.searchButton
    await expect(button).toBeDisabled()

    await app.orderLookup.elements.orderInput.fill('     ')
    await expect(button).toBeDisabled()
  })
})