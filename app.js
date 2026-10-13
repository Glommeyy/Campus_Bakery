import { products, money, cartLines, totals, validatePayment, createSale } from './pos.js';

const units = { pandesal: 'Pack of 5', ensaymada: 'Per piece', spanish: 'Per piece', cupcake: 'Per piece', loaf: 'Per loaf', coffee: 'Per cup' };
const element = id => document.getElementById(id);
const grid = element('product-grid');
const search = element('search');
const cash = element('cash');
let cart = {};
let category = 'all';
let completed = false;

function renderProducts() {
  const query = search.value.trim().toLowerCase();
  const visible = products.filter(product =>
    (category === 'all' || product.category === category) &&
    `${product.name} ${units[product.id]}`.toLowerCase().includes(query)
  );
  grid.innerHTML = visible.map(product => `
    <article class="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <img src="assets/products/${product.id}.jpg" alt="${product.name}" class="h-40 w-full object-cover" width="400" height="240">
      <div class="p-4"><h3 class="font-semibold">${product.name}</h3><p class="mt-1 text-xs text-stone-500">${units[product.id]}</p><p class="my-4 text-lg font-semibold text-amber-900">${money(product.price)}</p><button class="primary-button w-full" data-add="${product.id}" aria-label="Add ${product.name} to cart">Add to cart</button></div>
    </article>
  `).join('');
  element('empty-search').hidden = visible.length > 0;
}

function updatePayment(showError = false) {
  const summary = totals(cart);
  const result = validatePayment(cash.value, summary.total);
  const invalid = showError && Boolean(result.error);
  element('payment-error').textContent = invalid ? result.error : '';
  cash.setAttribute('aria-invalid', String(invalid));
  element('change').textContent = summary.count && !result.error ? money(result.cash - summary.total) : '—';
  return result;
}

function renderCart() {
  const summary = totals(cart);
  element('item-count').textContent = `${summary.count} ${summary.count === 1 ? 'item' : 'items'}`;
  element('empty-cart').hidden = summary.count > 0;
  element('cart-items').innerHTML = cartLines(cart).map(item => `
    <div class="border-b border-stone-100 pb-4">
      <div class="flex justify-between gap-3 text-sm"><strong>${item.name}</strong><strong>${money(item.price * item.quantity)}</strong></div>
      <p class="mt-1 text-xs text-stone-500">${units[item.id]} · ${money(item.price)} each</p>
      <div class="mt-3 flex items-center gap-3"><button class="quantity-button" data-action="decrease" data-id="${item.id}" aria-label="Decrease ${item.name} quantity">−</button><span aria-label="Quantity">${item.quantity}</span><button class="quantity-button" data-action="increase" data-id="${item.id}" aria-label="Increase ${item.name} quantity" ${item.quantity >= 99 ? 'disabled' : ''}>+</button><button class="ml-auto text-xs text-red-700" data-action="remove" data-id="${item.id}" aria-label="Remove ${item.name}">Remove</button></div>
    </div>
  `).join('');
  element('subtotal').textContent = money(summary.total);
  element('total').textContent = money(summary.total);
  cash.disabled = !summary.count;
  element('confirm-payment').disabled = !summary.count || completed;
  if (!summary.count) cash.value = '';
  updatePayment(cash.value !== '');
}

function announce(message) { element('cart-status').textContent = message; }

grid.addEventListener('click', event => {
  const button = event.target.closest('[data-add]');
  if (!button || completed) return;
  const id = button.dataset.add;
  if ((cart[id] || 0) >= 99) { announce('Maximum quantity is 99 per product.'); return; }
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  announce(`${products.find(product => product.id === id).name} added. ${totals(cart).count} items in order.`);
});

element('cart-items').addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button || completed) return;
  const { id, action } = button.dataset;
  const oldIndex = cartLines(cart).findIndex(item => item.id === id);
  if (action === 'remove') delete cart[id];
  else cart[id] = Math.min(99, cart[id] + (action === 'increase' ? 1 : -1));
  if (cart[id] === 0) delete cart[id];
  renderCart();
  // Restore keyboard focus after replacing the cart markup.
  const matching = element('cart-items').querySelector(`[data-id="${id}"][data-action="${action}"]:not(:disabled)`);
  const remaining = element('cart-items').querySelectorAll('[data-action="decrease"]');
  (matching || remaining[Math.min(oldIndex, remaining.length - 1)] || grid.querySelector('[data-add]') || search).focus();
  announce(`Order updated. ${totals(cart).count} items. Total ${money(totals(cart).total)}.`);
});

cash.addEventListener('input', () => updatePayment(true));
element('payment-form').addEventListener('submit', event => {
  event.preventDefault();
  if (completed || !totals(cart).count) return;
  const result = updatePayment(true);
  if (result.error) { cash.focus(); return; }
  const sale = createSale(cart, result.cash, 'Takeaway');
  completed = true;
  element('confirm-payment').disabled = true;
  const date = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(sale.date));
  element('receipt-details').innerHTML = `
    <p class="text-sm font-semibold">Campus Bakery</p><p class="mt-1 text-xs text-stone-500">${sale.id} · ${date}</p>
    <div class="mt-5 overflow-x-auto"><table class="receipt-table"><caption class="sr-only">Purchased items</caption><thead><tr><th scope="col">Item / Unit price</th><th scope="col">Qty</th><th scope="col">Subtotal</th></tr></thead><tbody>${sale.items.map(item => `<tr><td>${item.name}<span class="block text-xs text-stone-500">${units[item.id]} · ${money(item.price)}</span></td><td>${item.quantity}</td><td>${money(item.price * item.quantity)}</td></tr>`).join('')}</tbody></table></div>
    <dl class="mt-5 space-y-3"><div class="flex justify-between font-semibold"><dt>Total</dt><dd>${money(sale.total)}</dd></div><div class="flex justify-between text-sm"><dt>Cash received</dt><dd>${money(sale.cash)}</dd></div><div class="flex justify-between text-sm"><dt>Change</dt><dd>${money(sale.change)}</dd></div></dl>`;
  element('pos-workspace').hidden = true;
  element('receipt').hidden = false;
  element('receipt-heading').focus();
});

element('new-transaction').addEventListener('click', () => {
  cart = {};
  completed = false;
  cash.value = '';
  search.value = '';
  category = 'all';
  document.querySelectorAll('[data-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === 'all')));
  element('receipt-details').innerHTML = '';
  element('receipt').hidden = true;
  element('pos-workspace').hidden = false;
  renderProducts();
  renderCart();
  search.focus();
  announce('New transaction started. Order cleared.');
});

search.addEventListener('input', renderProducts);
document.querySelectorAll('[data-category]').forEach(button => {
  button.addEventListener('click', () => {
    category = button.dataset.category;
    document.querySelectorAll('[data-category]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    renderProducts();
  });
});
renderProducts();
renderCart();
