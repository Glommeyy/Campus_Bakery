import { test } from 'node:test';
import assert from 'node:assert/strict';
import { products, totals, parseCash, validatePayment, createSale, isValidSale } from '../pos.js';
test('menu matches the supplied prices', () => assert.deepEqual(products.map(p => p.price), [2500, 2000, 1500, 3000, 5500, 2500]));
test('cart quantities and pack pricing produce the correct total', () => assert.deepEqual(totals({ pandesal: 2, ensaymada: 1, coffee: 1 }), { count: 4, total: 9500 }));
test('cash parsing preserves centavos and rejects invalid input', () => {
  assert.equal(parseCash('100.05'), 10005); assert.equal(parseCash('25'), 2500); assert.equal(parseCash('0.1'), 10);
  for (const input of ['', '-10', '1.005', 'abc', '1e3', 'Infinity', '1000001']) assert.equal(parseCash(input), null);
});
test('invalid payments receive the required message and cannot proceed', () => {
  for (const value of ['', 'abc', '-1', ' ', '1.001']) {
    assert.deepEqual(validatePayment(value, 16500), { cash: null, error: 'Please enter a valid payment amount.' });
  }
});
test('insufficient payment states the minimum total, while exact and excess payments pass', () => {
  assert.deepEqual(validatePayment('100', 16500), { cash: 10000, error: 'Insufficient payment. Please enter at least ₱165.00.' });
  assert.deepEqual(validatePayment('165', 16500), { cash: 16500, error: '' });
  assert.deepEqual(validatePayment('200', 16500), { cash: 20000, error: '' });
});
test('cash sale records quantities and change without keeping a cart reference', () => {
  const cart = { pandesal: 2, spanish: 1 };
  const sale = createSale(cart, 10000, 'Takeaway', new Date('2026-10-13T02:00:00Z'), 'CB-TEST');
  assert.equal(sale.total, 6500); assert.equal(sale.change, 3500); assert.equal(sale.items[0].quantity, 2);
  cart.pandesal = 8; assert.equal(sale.items[0].quantity, 2); assert.ok(isValidSale(sale));
});
test('empty orders and insufficient cash cannot be recorded', () => {
  assert.throws(() => createSale({}, 10000, 'Takeaway'));
  assert.throws(() => createSale({ loaf: 1 }, 5000, 'Dine-in'));
  const exact = createSale({ loaf: 1 }, 5500, 'Dine-in'); assert.equal(exact.change, 0);
});
test('saved transaction validation detects broken amounts', () => {
  const sale = createSale({ cupcake: 2 }, 10000, 'Takeaway');
  assert.ok(isValidSale(sale)); assert.equal(isValidSale({ ...sale, total: 100 }), false);
  assert.equal(isValidSale({ ...sale, change: -5 }), false); assert.equal(isValidSale({ ...sale, items: [] }), false);
});
