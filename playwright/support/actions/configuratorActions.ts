import { Page, expect } from '@playwright/test'

export type ExteriorColorId = 'glacier-blue' | 'lunar-white' | 'midnight-black'
export type WheelTypeId = 'aero' | 'sport'

export function createConfiguratorActions(page: Page) {
  const totalPrice = page.getByTestId('total-price')
  const carImage = page.getByTestId('car-exterior-image')

  return {
    elements: {
      totalPrice,
      carImage,
    },

    async open() {
      await page.goto('/')
      await expect(page.getByTestId('landing-page')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Velô Sprint', level: 1 })).toBeVisible()

      await page.getByRole('link', { name: 'Configure o Seu' }).click()
      await expect(page).toHaveURL(/\/configure$/)
    },

    async selectExteriorColor(label: string) {
      await page.getByRole('button', { name: label }).click()
    },

    async selectWheels(name: string | RegExp) {
      await page.getByTestId('section-rodas').getByRole('button', { name }).click()
    },

    async expectPrice(price: string) {
      const priceElement = page.getByTestId('total-price')
      await expect(priceElement).toBeVisible()
      await expect(priceElement).toHaveText(price)
    },

    async setOptional(name: string | RegExp, checked: boolean) {
      const optional = page.getByRole('checkbox', { name })
      if (checked) {
        await optional.check()
        await expect(optional).toBeChecked()
      } else {
        await optional.uncheck()
        await expect(optional).not.toBeChecked()
      }
    },

    async validateTotalPrice(expected: string) {
      await expect(totalPrice).toHaveText(expected)
    },

    async validateCarPreview(color: ExteriorColorId, wheels: WheelTypeId) {
      await expect(carImage).toHaveAttribute(
        'alt',
        new RegExp(`${color} with ${wheels} wheels`),
      )
    },

    async validateDefaultConfiguratorState() {
      await this.validateTotalPrice('R$ 40.000,00')
      await this.validateCarPreview('glacier-blue', 'aero')
    },

    async openDefaultAndGoToCheckout() {
      await this.open()
      await this.validateDefaultConfiguratorState()
      await this.goToCheckout()
    },

    async goToCheckout() {
      await page.getByTestId('checkout-button').click()
      await expect(page).toHaveURL(/\/order$/)
    },

    async finishConfigurator() {
      await page.getByRole('button', { name: 'Monte o Seu' }).click()
    },
  }
}
