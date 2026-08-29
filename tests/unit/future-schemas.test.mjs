import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const expected = {
  orders: ['order_id', 'order_number', 'created_at', 'status', 'customer_name', 'customer_phone', 'customer_email', 'delivery_address', 'area', 'pin_code', 'party_date', 'preferred_delivery_date', 'subtotal_paise', 'delivery_charge_paise', 'total_paise', 'payment_status', 'notes'],
  order_items: ['order_id', 'order_number', 'product_code', 'slug', 'name', 'unit_price_paise', 'quantity', 'line_total_paise', 'selected_bag_option', 'personalization_name', 'personalization_age', 'personalization_message'],
  custom_requests: ['request_id', 'created_at', 'status', 'customer_name', 'customer_phone', 'customer_email', 'event_date', 'quantity', 'budget_paise', 'request_text', 'area', 'pin_code', 'notes'],
};

for (const [name, headers] of Object.entries(expected)) {
  test(`${name} template uses canonical future schema`, () => {
    const actual = fs.readFileSync(`templates/google-sheets/${name}.csv`, 'utf8').split(/\r?\n/, 1)[0].split(',');
    assert.deepEqual(actual, headers);
  });
}
