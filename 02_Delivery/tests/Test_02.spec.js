import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Login class — private username and password fields
// ---------------------------------------------------------------------------
class Login {
  #username;
  #password = 'secret_sauce';

  constructor(page, username) {
    this.page      = page;
    this.url       = 'https://www.saucedemo.com/';
    this.#username = username;
  }

  async open() {
    await this.page.goto(this.url);
  }

  async login() {
    await this.page.locator('#user-name').fill(this.#username);
    await this.page.locator('#password').fill(this.#password);
    await this.page.locator('#login-button').click();
  }

  async handleDialog() {
    const dialog = await this.page.waitForEvent('dialog', { timeout: 2000 }).catch(() => null);
    if (dialog) {
      console.log(`Browser dialog: ${dialog.message()}`);
      await dialog.accept();
    }
  }

  async assertLoginSuccess() {
    await expect.soft(this.page).toHaveURL(/inventory/);
    await expect(this.page).toHaveTitle ('Swag Labs');
     await expect(this.page.locator('.inventory_list')).toBeVisible();
  }

  async assertLoginFailed(expectedMessage) {
    let errorBanner = this.page.locator('[data-test="error"]');
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText(expectedMessage);
  }
}

// ---------------------------------------------------------------------------
// Accepted saucedemo user instance variables
// ---------------------------------------------------------------------------
const users = {
  standard:          'standard_user',
  lockedOut:         'locked_out_user',
  problem:           'problem_user',
  performanceGlitch: 'performance_glitch_user',
  error:             'error_user',
  visual:            'visual_user',
};

//---------------------------------------------------------------------------
// Cleanup — runs after every test, pass or fail
// ---------------------------------------------------------------------------
test.afterEach(async ({ page }) => {
  await page.evaluate(() => localStorage.clear());
});

// ---------------------------------------------------------------------------
// Test cases
// ---------------------------------------------------------------------------
test.describe('SauceDemo — login validation for all users', () => {

  test('TC-01 | standard_user — login should succeed', async ({ page }) => {
    try {
      const login = new Login(page, users.standard);
      await login.open();
      await login.login();
      await login.handleDialog();
      await login.assertLoginSuccess();
    } catch (error) {
      throw new Error(`TC-01 failed: ${error.message}`);
    }
  });

  test('TC-02 | locked_out_user — login should fail with locked-out message', async ({ page }) => {
    try {
      const login = new Login(page, users.lockedOut);
      await login.open();
      await login.login();
      await login.assertLoginFailed('Sorry, this user has been locked out');
    } catch (error) {
      throw new Error(`TC-02 failed: ${error.message}`);
    }
  });

  test('TC-03 | problem_user — login should succeed', async ({ page }) => {
    try {
      const login = new Login(page, users.problem);
      await login.open();
      await login.login();
      await login.handleDialog();
      await login.assertLoginSuccess();
    } catch (error) {
      throw new Error(`TC-03 failed: ${error.message}`);
    }
  });

  test('TC-04 | performance_glitch_user — login should succeed (extended timeout)', async ({ page }) => {
    test.setTimeout(20_000);
    try {
      const login = new Login(page, users.performanceGlitch);
      await login.open();
      await login.login();
      await login.handleDialog();
      await expect(page).toHaveURL(/inventory/, { timeout: 10_000 });
    } catch (error) {
      throw new Error(`TC-04 failed: ${error.message}`);
    }
  });

  test('TC-05 | error_user — login should succeed', async ({ page }) => {
    try {
      const login = new Login(page, users.error);
      await login.open();
      await login.login();
      await login.handleDialog();
      await login.assertLoginSuccess();
    } catch (error) {
      throw new Error(`TC-05 failed: ${error.message}`);
    }
  });

  test('TC-06 | visual_user — login should succeed', async ({ page }) => {
    try {
      const login = new Login(page, users.visual);
      await login.open();
      await login.login();
      await login.handleDialog();
      await login.assertLoginSuccess();
    } catch (error) {
      throw new Error(`TC-06 failed: ${error.message}`);
    }
  });

});


// ---------------------------------------------------------------------------
// Parenthesis Validator — code challenge
// ---------------------------------------------------------------------------
class ParenthesisValidator {
  #pairs = { ')': '(', ']': '[', '}': '{' };

  diagnose(input) {
    try {
      if (typeof input !== 'string') throw new Error('Input must be a string');

      const stack = [];

      for (const char of input) {
        if ('([{'.includes(char)) {
          stack.push(char);
        } else if (')]}'.includes(char)) {
          if (stack.pop() !== this.#pairs[char]) {
            return `Invalid: mismatched closing bracket "${char}"`;
          }
        }
      }

      return stack.length === 0
        ? 'Valid: all brackets are balanced'
        : `Invalid: ${stack.length} unclosed bracket(s) remaining — "${stack.join(', ')}"`;

    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
}

// Quick console check
const validator = new ParenthesisValidator();
console.log(validator.diagnose('({[]})'));   // Valid: all brackets are balanced
console.log(validator.diagnose('(]'));        // Invalid: mismatched closing bracket "]"
console.log(validator.diagnose('((('));       // Invalid: 3 unclosed bracket(s) remaining

