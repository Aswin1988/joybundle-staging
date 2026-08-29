import test from 'node:test';
import assert from 'node:assert/strict';
import { SHEETS_SCOPE } from '../../lib/google/client.js';

test('Google Sheets authentication requests write-capable Sheets scope', () => {
  assert.equal(SHEETS_SCOPE, 'https://www.googleapis.com/auth/spreadsheets');
  assert.notEqual(SHEETS_SCOPE, 'https://www.googleapis.com/auth/spreadsheets.readonly');
});
