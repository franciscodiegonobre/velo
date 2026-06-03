import { test } from '../support/fixtures'

test.describe('Vehicle Configurator', () => {
  test.beforeEach(async ({ app }) => {
    await app.configurator.open()
  })

  test('Validate vehicle color change', async ({ app }) => {
    await app.configurator.validateDefaultConfiguratorState()

    await app.configurator.selectExteriorColor('Lunar White')
    await app.configurator.validateCarPreview('lunar-white', 'aero')
    await app.configurator.validateTotalPrice('R$ 40.000,00')
  })

  test('Validate vehicle wheels and optionals change', async ({ app }) => {
    await app.configurator.selectWheels(/Sport Wheels/)
    await app.configurator.validateCarPreview('glacier-blue', 'sport')
    await app.configurator.validateTotalPrice('R$ 42.000,00')

    await app.configurator.setOptional(/Precision Park/, true)
    await app.configurator.validateTotalPrice('R$ 47.500,00')

    await app.configurator.setOptional(/Flux Capacitor/, true)
    await app.configurator.validateTotalPrice('R$ 52.500,00')

    await app.configurator.setOptional(/Flux Capacitor/, false)
    await app.configurator.validateTotalPrice('R$ 47.500,00')
  })
})
