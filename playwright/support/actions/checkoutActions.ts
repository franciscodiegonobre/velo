import { Page, expect } from '@playwright/test'

export function createCheckoutActions(page: Page) {

  const terms = page.getByTestId('checkout-terms')

  const alerts = {
    name: page.getByTestId('error-name'),
    lastname: page.getByTestId('error-lastname'),
    email: page.getByTestId('error-email'),
    phone: page.getByTestId('error-phone'),
    document: page.getByTestId('error-document'),
    store: page.getByTestId('error-store'),
    terms: page.getByTestId('error-terms')
  }


  return {

    elements: {
      terms,
      alerts
    },

    async expectLoaded() {
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
    },

    async expectSummaryTotal(price: string) {
      await expect(page.getByTestId('summary-total-price')).toHaveText(price)
    },

    async fillCustomerlData(data: {
      name: string
      lastname: string
      email: string
      phone: string
      document: string
    }) {
      await page.getByTestId('checkout-name').fill(data.name)
      await page.getByTestId('checkout-lastname').fill(data.lastname)
      await page.getByTestId('checkout-email').fill(data.email)
      await page.getByTestId('checkout-phone').fill(data.phone)
      await page.getByTestId('checkout-document').fill(data.document)
    },

    async selectStore(storeName: string) {
      await page.getByTestId('checkout-store').click()
      await page.getByRole('option', { name: storeName }).click()
    },

    async selectPaymentMethod(method: string) {
      await page.getByRole('button', { name: new RegExp(method, 'i') }).click()
    },

    async fillDownPayment(value: string) {
      await page.getByTestId('input-entry-value').fill(value)
    },

    async acceptTerms() {
      await terms.check()
    },

    async submit() {
      await page.getByRole('button', { name: 'Confirmar Pedido' }).click()
    },

    async expectResult(status: string) {
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: status })).toBeVisible()
    },

    async expectNoFieldErrors() {
      await expect(alerts.name).not.toBeVisible()
      await expect(alerts.lastname).not.toBeVisible()
      await expect(alerts.email).not.toBeVisible()
      await expect(alerts.phone).not.toBeVisible()
      await expect(alerts.document).not.toBeVisible()
      await expect(alerts.store).not.toBeVisible()
      await expect(alerts.terms).not.toBeVisible()
    },

    async expectAvistaTotal(price: string) {
      await expect(page.getByTestId('payment-avista')).toContainText(price)
    },

    async expectSubmitProcessing() {
      await expect(page.getByRole('button', { name: 'Processando...' })).toBeVisible()
    },

    async expectSuccessPage(data: {
      status: string
      customerName: string
      email: string
      store: string
      totalPrice: string
    }) {
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByTestId('success-status')).toHaveText(data.status)
      await expect(page.getByTestId('order-id')).toHaveText(/^VLO-[A-Z0-9]{6}$/)
      await expect(page.getByText(data.customerName)).toBeVisible()
      await expect(page.getByText(data.email)).toBeVisible()
      await expect(page.getByText(data.store)).toBeVisible()
      await expect(page.getByText(data.totalPrice)).toBeVisible()
    },

  }
}