class CartPage {
  constructor(page) {
    this.page = page;
    this.checkoutButton = page.locator('#checkout');
    this.cartItems = page.locator('.cart_item');
  }

  async getItemCount() {
    return this.cartItems.count();
  }

  async removeItem(itemName) {
    const item = this.page.locator('.cart_item').filter({ hasText: itemName });
    await item.locator('button').click();
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }
}

module.exports = { CartPage };
