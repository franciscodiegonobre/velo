import { test, expect } from '../support/fixtures'
import { deleteOrderByEmail } from '../support/database/orderRepository'

test.describe('Checkout', () => {



  test.describe('Validações de campos obrigatórios', () => {

    let alerts: any

    test.beforeEach(async ({ page, app }) => {
      await page.goto('/order')
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()

      alerts = app.checkout.elements.alerts
    })


    test('deve validar obrigatoriedade de todos os campos em branco', async ({ app }) => {
      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
      await expect(alerts.email).toHaveText('Email inválido')
      await expect(alerts.phone).toHaveText('Telefone inválido')
      await expect(alerts.document).toHaveText('CPF inválido')
      await expect(alerts.store).toHaveText('Selecione uma loja')
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })

    test('deve validar limite mínimo de caracteres para Nome e Sobrenome', async ({ app }) => {

      const customer = {
        name: 'A',
        lastname: 'B',
        email: 'papito@teste.com',
        document: '00000014141',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
    })

    test('deve exibir erro para e-mail com formato inválido', async ({ app }) => {
      const customer = {
        name: 'Fernando',
        lastname: 'Papito',
        email: 'papito@.com',
        document: '00000014141',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.email).toHaveText('Email inválido')
    })

    test('deve exibir erro para CPF inválido', async ({ app }) => {

      const customer = {
        name: 'Fernando',
        lastname: 'Papito',
        email: 'papito@test.com',
        document: '00000014199',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.document).toHaveText('CPF inválido')
    })

    test('deve exigir o aceite dos termos ao finalizar com dados válidos', async ({ app }) => {

      const customer = {
        name: 'Fernando',
        lastname: 'Papito',
        email: 'papito@test.com',
        document: '00000014199',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')

      await expect(app.checkout.elements.terms).not.toBeChecked()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })
  })

  test.describe('Pagamento à vista - fluxo feliz', () => {

    test('deve criar pedido aprovado com pagamento à vista', async ({ app }) => {
      const checkoutData = {
        customer: {
          name: 'Mariana',
          lastname: 'Oliveira',
          email: 'mariana.oliveira@velo.dev',
          document: '780.228.290-05',
          phone: '(11) 98765-4321',
        },
        store: 'Velô Paulista',
        storeFullName: 'Velô Paulista - Av. Paulista, 1000',
        totalPrice: 'R$ 40.000,00',
        expectedStatus: 'Pedido Aprovado!',
        paymentMethod: 'À Vista',
      }

      await deleteOrderByEmail(checkoutData.customer.email)

      // Arrange
      await app.configurator.open()
      await app.configurator.validateDefaultConfiguratorState()
      await app.configurator.goToCheckout()
      await app.checkout.expectLoaded()

      // Act
      await app.checkout.fillCustomerlData(checkoutData.customer)
      await app.checkout.selectStore(checkoutData.store)
      await app.checkout.expectNoFieldErrors()
      await app.checkout.selectPaymentMethod(checkoutData.paymentMethod)
      await app.checkout.expectSummaryTotal(checkoutData.totalPrice)
      await app.checkout.expectAvistaTotal(checkoutData.totalPrice)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await app.checkout.expectSuccessPage({
        status: checkoutData.expectedStatus,
        customerName: `${checkoutData.customer.name} ${checkoutData.customer.lastname}`,
        email: checkoutData.customer.email,
        store: checkoutData.storeFullName,
        totalPrice: checkoutData.totalPrice,
      })
    })

    test('deve aprovar automaticamente o crédito quando o score do CPF for maior que 700 no financiamento.', async ({ app, page }) => {
      const checkoutData = {
        customer: {
          name: 'Steve',
          lastname: 'Jobs',
          email: 'steve.jobs@velo.dev',
          document: '65493881047',
          phone: '(11) 98765-4321',
        },
        store: 'Velô Paulista',
        storeFullName: 'Velô Paulista - Av. Paulista, 1000',
        totalPrice: 'R$ 40.800,00',
        expectedStatus: 'Pedido Aprovado!',
        paymentMethod: 'Financiamento',
      }
      
      await deleteOrderByEmail(checkoutData.customer.email)

      await page.route('**/functions/v1/credit-analysis', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'Done',
            score: 710,
          }),
        })
      })

      // Arrange
      await app.configurator.open()
      await app.configurator.validateDefaultConfiguratorState()
      await app.configurator.goToCheckout()
      await app.checkout.expectLoaded()

      // Act
      await app.checkout.fillCustomerlData(checkoutData.customer)
      await app.checkout.selectStore(checkoutData.store)
      await app.checkout.expectNoFieldErrors()
      await app.checkout.selectPaymentMethod(checkoutData.paymentMethod)
      await app.checkout.expectSummaryTotal(checkoutData.totalPrice)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await app.checkout.expectSuccessPage({
        status: checkoutData.expectedStatus,
        customerName: `${checkoutData.customer.name} ${checkoutData.customer.lastname}`,
        email: checkoutData.customer.email,
        store: checkoutData.storeFullName,
        totalPrice: checkoutData.totalPrice,
      })
    })
  })

})