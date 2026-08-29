const { test, expect } = require('@playwright/test');

test('homepage renders a featured product', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Birthday return gifts made easy.' })).toBeVisible();
  await expect(page.getByText('Creative Fun Bundle')).toBeVisible();
});

test('homepage has no horizontal overflow at 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('budget page renders active catalog and strips private fields', async ({ page }) => {
  await page.goto('/shop/100-149');
  await expect(page.getByRole('heading', { name: '₹100–₹149 return gifts' })).toBeVisible();
  await expect(page.getByText('Creative Fun Bundle')).toBeVisible();
  expect(await page.locator('body').innerText()).not.toContain('estimated_unit_cost_paise');
});

test('bundle quantity, MOV, bag, personalization, and cart work', async ({ page }) => {
  await page.goto('/bundles/creative-fun');
  await expect(page.getByRole('heading', { name: 'Creative Fun Bundle' })).toBeVisible();
  await expect(page.getByText('Add ₹551.00 more to reach the ₹700 minimum order.')).toBeVisible();
  await page.getByLabel('Quantity').fill('5');
  await expect(page.getByText('Minimum order reached.')).toBeVisible();
  await page.getByLabel('Bag option').selectOption('BLUE');
  await page.getByLabel('Child or preferred name').fill('Mia');
  await page.getByLabel('Age being celebrated').fill('6');
  await page.getByLabel('Short message').fill('Happy birthday');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByRole('status')).toContainText('Added to your cart');
  await page.getByRole('link', { name: 'Cart' }).click();
  await expect(page.getByText('Cart subtotal')).toBeVisible();
  await expect(page.getByText('₹745.00').last()).toBeVisible();
  await expect(page.getByText('Personalized for Mia')).toBeVisible();
});

test('public catalog API never returns private fields', async ({ request }) => {
  const response = await request.get('/api/catalog/products?band=100-149');
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).not.toContain('estimated_unit_cost_paise');
  expect(body).not.toContain('internal_notes');
});

test('inactive or unknown bundles are not publicly visible', async ({ request }) => {
  const response = await request.get('/bundles/inactive-product-fixture');
  expect(response.status()).toBe(404);
});

test('checkout submits a reviewed cart and shows confirmation', async ({ page }) => {
  await page.route('/api/orders', async (route) => route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ order_number: 'JB-TEST-1234', customer_name: 'Mia Parent', total_paise: '74500', payment_status: 'PENDING', party_date: '2099-01-01', area: 'Indiranagar', pin_code: '560038', items: [{ product_code: 'JB-CF-149', name: 'Creative Fun Bundle', quantity: 5, line_total_paise: '74500' }] }) }));
  await page.goto('/bundles/creative-fun');
  await page.getByLabel('Quantity').fill('5');
  await page.getByLabel('Bag option').selectOption('BLUE');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('link', { name: 'Cart' }).click();
  await page.getByRole('link', { name: 'Continue to checkout' }).click();
  await page.getByLabel('Name').fill('Mia Parent');
  await page.getByLabel('Mobile number').fill('9876543210');
  await page.getByLabel('Delivery address').fill('1 Main Road');
  await page.getByLabel('Area').fill('Indiranagar');
  await page.getByLabel('PIN code').fill('560038');
  await page.getByLabel('Party date').fill('2099-01-01');
  await page.getByRole('button', { name: 'Submit order request' }).click();
  await expect(page.getByText('JB-TEST-1234')).toBeVisible();
  await expect(page.getByText('Payment status: Pending')).toBeVisible();
  await expect(page.getByText('You can continue on WhatsApp to complete the confirmation.')).toBeVisible();
  const whatsapp = page.getByRole('link', { name: 'Continue on WhatsApp' });
  if (await whatsapp.count()) expect(await whatsapp.getAttribute('href')).toMatch(/^https:\/\/wa\.me\//);
});
