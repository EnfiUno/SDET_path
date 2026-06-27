const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');

const VALID_USER = 'standard_user';
const LOCKED_USER = 'locked_out_user';
const PASSWORD = 'secret_sauce';
const ITEM_NAME = 'Sauce Labs Backpack';

test.describe('SauceDemo POM Suite', () => {

  test('TC01 - Successful login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(VALID_USER, PASSWORD);

    await expect(page).toHaveURL(/.*inventory/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('TC02 - Login fails for locked out user', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(LOCKED_USER, PASSWORD);

    const error = await loginPage.getErrorMessage();
    expect(error).toContain('Sorry, this user has been locked out');
  });

  test('TC03 - Add a product to the cart', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(VALID_USER, PASSWORD);
    await inventoryPage.addItemToCart(ITEM_NAME);

    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('TC04 - Remove a product from the cart', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(VALID_USER, PASSWORD);
    await inventoryPage.addItemToCart(ITEM_NAME);
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.removeItemFromCart(ITEM_NAME);

    await expect(inventoryPage.cartBadge).not.toBeVisible();
  });

  test('TC05 - Complete full checkout flow', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login(VALID_USER, PASSWORD);
    await inventoryPage.addItemToCart(ITEM_NAME);
    await inventoryPage.goToCart();

    expect(await cartPage.getItemCount()).toBe(1);
    await cartPage.proceedToCheckout();

    await checkoutPage.fillShippingInfo('John', 'Doe', '12345');
    await checkoutPage.finish();

    const confirmation = await checkoutPage.getConfirmationText();
    expect(confirmation).toBe('Thank you for your order!');
  });

});
