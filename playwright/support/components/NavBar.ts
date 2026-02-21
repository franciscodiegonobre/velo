import { Page } from '@playwright/test'

export class NavBar {
  constructor(private page: Page) {}

  async clickConsultarPedido() {
    await this.page.getByRole('link', { name: 'Consultar Pedido' }).click()
  }

  async clickConfigureSeu() {
    await this.page.getByRole('link', { name: 'Configure o Seu' }).click()
  }
}
