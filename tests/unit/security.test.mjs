import test from 'node:test';
import assert from 'node:assert/strict';
import { validateImageMetadata } from '../../lib/storage/image-validation.js';
import { isAllowedAdminRole } from '../../lib/auth/roles.js';

test('accepts only supported image metadata', () => {
  assert.doesNotThrow(() => validateImageMetadata({ type: 'image/png', size: 100 }));
  assert.throws(() => validateImageMetadata({ type: 'text/html', size: 100 }), /Only JPG/);
  assert.throws(() => validateImageMetadata({ type: 'image/png', size: 6 * 1024 * 1024 }), /5 MB/);
});

test('only owner and admin are allowed admin roles', () => {
  assert.equal(isAllowedAdminRole('owner'), true);
  assert.equal(isAllowedAdminRole('admin'), true);
  assert.equal(isAllowedAdminRole('viewer'), false);
});
