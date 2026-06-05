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

  test('Validate dynamic base price calculation with optionals', async ({ app }) => {
    await app.configurator.validateDefaultConfiguratorState()

    // Step 1: Select an external color different from the default (e.g., `lunar-white`)
    await app.configurator.selectExteriorColor('Lunar White')
    await app.configurator.validateCarPreview('lunar-white', 'aero')
    await app.configurator.validateTotalPrice('R$ 40.000,00')

    // Step 2: In the "Rodas" tab, change to `Sport Wheels`
    await app.configurator.selectWheels(/Sport Wheels/)
    await app.configurator.validateCarPreview('lunar-white', 'sport')
    await app.configurator.validateTotalPrice('R$ 42.000,00')

    // Step 3: In the "Opcionais" tab, check `Precision Park`
    await app.configurator.setOptional(/Precision Park/, true)
    await app.configurator.validateTotalPrice('R$ 47.500,00')

    // Step 4: In the "Opcionais" tab, checks and unchecks `Flux Capacitor`
    await app.configurator.setOptional(/Flux Capacitor/, true)
    await app.configurator.validateTotalPrice('R$ 52.500,00')

    await app.configurator.setOptional(/Flux Capacitor/, false)
    await app.configurator.validateTotalPrice('R$ 47.500,00')
  })
})
