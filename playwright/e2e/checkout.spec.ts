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

    test('deve aprovar automaticamente o crédito quando o score do CPF for maior que 700 no financiamento.', async ({ app }) => {
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
        creditScore: 710,
      }

      await deleteOrderByEmail(checkoutData.customer.email)

      await app.checkout.mockCreditAnalysis(checkoutData.creditScore)

      // Arrange
      await app.configurator.openDefaultAndGoToCheckout()
      await app.checkout.expectLoaded()

      // Act
      await app.checkout.completeFinancingCheckout({
        customer: checkoutData.customer,
        store: checkoutData.store,
        paymentMethod: checkoutData.paymentMethod,
        summaryTotal: checkoutData.totalPrice,
      })

      // Assert
      await app.checkout.expectSuccessPage({
        status: checkoutData.expectedStatus,
        customerName: `${checkoutData.customer.name} ${checkoutData.customer.lastname}`,
        email: checkoutData.customer.email,
        store: checkoutData.storeFullName,
        totalPrice: checkoutData.totalPrice,
      })
    })

    test('deve manter o pedido em análise quando o score do CPF estiver entre 501 e 700 no financiamento.', async ({ app }) => {
      const checkoutData = {
        customer: {
          name: 'Ana',
          lastname: 'Costa',
          email: 'ana.costa@velo.dev',
          document: '74690225117',
          phone: '(11) 98765-4321',
        },
        store: 'Velô Paulista',
        storeFullName: 'Velô Paulista - Av. Paulista, 1000',
        totalPrice: 'R$ 40.800,00',
        expectedStatus: 'Pedido Em Análise!',
        paymentMethod: 'Financiamento',
        creditScore: 600,
      }

      await deleteOrderByEmail(checkoutData.customer.email)

      await app.checkout.mockCreditAnalysis(checkoutData.creditScore)

      // Arrange
      await app.configurator.openDefaultAndGoToCheckout()
      await app.checkout.expectLoaded()

      // Act
      await app.checkout.completeFinancingCheckout({
        customer: checkoutData.customer,
        store: checkoutData.store,
        paymentMethod: checkoutData.paymentMethod,
        summaryTotal: checkoutData.totalPrice,
      })

      // Assert
      await app.checkout.expectSuccessPage({
        status: checkoutData.expectedStatus,
        customerName: `${checkoutData.customer.name} ${checkoutData.customer.lastname}`,
        email: checkoutData.customer.email,
        store: checkoutData.storeFullName,
        totalPrice: checkoutData.totalPrice,
      })
    })

    test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento sem entrada.', async ({ app }) => {
      const checkoutData = {
        customer: {
          name: 'Carlos',
          lastname: 'Silva',
          email: 'carlos.silva.sem.entrada@velo.dev',
          document: '12345678909',
          phone: '(11) 98765-4321',
        },
        store: 'Velô Paulista',
        storeFullName: 'Velô Paulista - Av. Paulista, 1000',
        totalPrice: 'R$ 40.800,00',
        expectedStatus: 'Crédito Reprovado',
        paymentMethod: 'Financiamento',
        creditScore: 500,
      }

      await deleteOrderByEmail(checkoutData.customer.email)

      await app.checkout.mockCreditAnalysis(checkoutData.creditScore)

      // Arrange
      await app.configurator.openDefaultAndGoToCheckout()
      await app.checkout.expectLoaded()

      // Act
      await app.checkout.completeFinancingCheckout({
        customer: checkoutData.customer,
        store: checkoutData.store,
        paymentMethod: checkoutData.paymentMethod,
        summaryTotal: checkoutData.totalPrice,
      })

      // Assert
      await app.checkout.expectSuccessPage({
        status: checkoutData.expectedStatus,
        customerName: `${checkoutData.customer.name} ${checkoutData.customer.lastname}`,
        email: checkoutData.customer.email,
        store: checkoutData.storeFullName,
        totalPrice: checkoutData.totalPrice,
      })
    })

    test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada menor que 50%.', async ({ app }) => {
      const checkoutData = {
        customer: {
          name: 'Bruno',
          lastname: 'Almeida',
          email: 'bruno.almeida.entrada@velo.dev',
          document: '98765432100',
          phone: '(11) 98765-4321',
        },
        store: 'Velô Paulista',
        storeFullName: 'Velô Paulista - Av. Paulista, 1000',
        totalPrice: 'R$ 30.600,00',
        totalFinalPrice: 'R$ 40.600,00',
        expectedStatus: 'Crédito Reprovado',
        paymentMethod: 'Financiamento',
        downPayment: '10000',
        creditScore: 450,
      }

      await deleteOrderByEmail(checkoutData.customer.email)

      await app.checkout.mockCreditAnalysis(checkoutData.creditScore)

      // Arrange
      await app.configurator.openDefaultAndGoToCheckout()
      await app.checkout.expectLoaded()

      // Act
      await app.checkout.completeFinancingCheckout({
        customer: checkoutData.customer,
        store: checkoutData.store,
        paymentMethod: checkoutData.paymentMethod,
        summaryTotal: checkoutData.totalPrice,
        downPayment: checkoutData.downPayment,
      })

      // Assert
      await app.checkout.expectSuccessPage({
        status: checkoutData.expectedStatus,
        customerName: `${checkoutData.customer.name} ${checkoutData.customer.lastname}`,
        email: checkoutData.customer.email,
        store: checkoutData.storeFullName,
        totalPrice: checkoutData.totalFinalPrice,
      })
    })

    test('deve aprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada igual a 50%.', async ({ app }) => {
      const checkoutData = {
        customer: {
          name: 'Richard',
          lastname: 'Gomes',
          email: 'richard.gomes.entrada@velo.dev',
          document: '39434745004',
          phone: '(11) 98765-4321',
        },
        store: 'Velô Paulista',
        storeFullName: 'Velô Paulista - Av. Paulista, 1000',
        totalPrice: 'R$ 20.400,00',
        totalFinalPrice: 'R$ 40.400,00',
        expectedStatus: 'Pedido Aprovado!',
        paymentMethod: 'Financiamento',
        downPayment: '20000',
        creditScore: 450,
      }

      await deleteOrderByEmail(checkoutData.customer.email)

      await app.checkout.mockCreditAnalysis(checkoutData.creditScore)

      // Arrange
      await app.configurator.openDefaultAndGoToCheckout()
      await app.checkout.expectLoaded()

      // Act
      await app.checkout.completeFinancingCheckout({
        customer: checkoutData.customer,
        store: checkoutData.store,
        paymentMethod: checkoutData.paymentMethod,
        summaryTotal: checkoutData.totalPrice,
        downPayment: checkoutData.downPayment,
      })

      // Assert
      await app.checkout.expectSuccessPage({
        status: checkoutData.expectedStatus,
        customerName: `${checkoutData.customer.name} ${checkoutData.customer.lastname}`,
        email: checkoutData.customer.email,
        store: checkoutData.storeFullName,
        totalPrice: checkoutData.totalFinalPrice,
      })
    })

    test('deve aprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada maior que 50%.', async ({ app }) => {
      const checkoutData = {
        customer: {
          name: 'Gustavo',
          lastname: 'Santos',
          email: 'gustavo.santos.entrada@velo.dev',
          document: '79327557000',
          phone: '(11) 98765-4321',
        },
        store: 'Velô Paulista',
        storeFullName: 'Velô Paulista - Av. Paulista, 1000',
        totalPrice: 'R$ 10.200,00',
        totalFinalPrice: 'R$ 40.200,00',
        expectedStatus: 'Pedido Aprovado!',
        paymentMethod: 'Financiamento',
        downPayment: '30000',
        creditScore: 450,
      }

      await deleteOrderByEmail(checkoutData.customer.email)

      await app.checkout.mockCreditAnalysis(checkoutData.creditScore)

      // Arrange
      await app.configurator.openDefaultAndGoToCheckout()
      await app.checkout.expectLoaded()

      // Act
      await app.checkout.completeFinancingCheckout({
        customer: checkoutData.customer,
        store: checkoutData.store,
        paymentMethod: checkoutData.paymentMethod,
        summaryTotal: checkoutData.totalPrice,
        downPayment: checkoutData.downPayment,
      })

      // Assert
      await app.checkout.expectSuccessPage({
        status: checkoutData.expectedStatus,
        customerName: `${checkoutData.customer.name} ${checkoutData.customer.lastname}`,
        email: checkoutData.customer.email,
        store: checkoutData.storeFullName,
        totalPrice: checkoutData.totalFinalPrice,
      })
    })
  })

})