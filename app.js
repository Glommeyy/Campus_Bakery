import { products, money, validatePayment, totals, createSale, isValidSale, dayKey } from './pos.js';
const productImage = id => `<img class="product-photo" src="assets/products/${id}.jpg" alt="" width="768" height="512" loading="lazy" decoding="async">`;

const $ = id => document.getElementById(id);
const paths = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  receipt: '<path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Z"/><path d="M9 8h6m-6 4h6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-14 4h3m4 0h3"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  bag: '<path d="M5 7h14l2 14H3L5 7Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/>',
  cup: '<path d="M4 6h13v9a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V6Zm13 1h2a3 3 0 0 1 0 6h-2M6 3h9M3 22h17"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
  sparkles: '<path d="m12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6Zm7 0v4m-2-2h4"/>',
  wallet: '<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 8h18m0 4h-6v5h6m-3-2.5h.01M5 5V3h12"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>', check: '<path d="m4 12 5 5L20 6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  print: '<path d="M7 8V3h10v5M7 17H3V8h18v9h-4M7 14h10v7H7v-7Zm10-3h.01"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  chart: '<path d="M4 3v18h17M8 16v-4m5 4V8m5 8V5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  warning: '<path d="m12 3 10 18H2L12 3Zm0 6v5m0 3h.01"/>',
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ''}</svg>`;
document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const storageKey = 'campus-bakery-sales-v1';
let sales = [], cart = {}, category = 'all', orderType = 'Takeaway', currentReceipt = null, freshReceipt = false, completing = false;
const alertHistory = [];
let unreadAlerts = 0;
let storageReadable = true;
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (!Array.isArray(saved) || !saved.every(isValidSale)) throw new Error('Invalid saved data');
  sales = saved;
} catch {
  storageReadable = false;
  toast('Saved sales could not be read. Checkout is unavailable until browser storage is restored.', 12000, 'error');
}

function toast(message, duration = 4000, type = 'success') {
  const labels = { success: 'Success', error: 'Action required', warning: 'Please check', info: 'Order updated' };
  const symbols = { success: 'check', error: 'warning', warning: 'warning', info: 'info' };
  alertHistory.unshift({ message, type, time: new Date() });
  if (alertHistory.length > 30) alertHistory.pop();
  unreadAlerts++;
  $('alert-count').textContent = unreadAlerts > 99 ? '99+' : unreadAlerts;
  $('alert-count').hidden = false;
  const notice = document.createElement('div');
  notice.className = `toast-notice alert-${type}`;
  notice.setAttribute('role', type === 'error' || type === 'warning' ? 'alert' : 'status');
  notice.innerHTML = `<span class="notice-icon">${icon(symbols[type])}</span><div><strong>${labels[type]}</strong><p>${escape(message)}</p></div><button class="notice-close" aria-label="Dismiss notification">${icon('close')}</button>`;
  $('toast').append(notice);
  while ($('toast').children.length > 3) $('toast').firstElementChild.remove();
  let timer;
  const dismiss = () => { clearTimeout(timer); notice.remove(); };
  const schedule = () => { clearTimeout(timer); timer = setTimeout(dismiss, duration); };
  notice.querySelector('button').addEventListener('click', dismiss);
  notice.addEventListener('mouseenter', () => clearTimeout(timer));
  notice.addEventListener('mouseleave', schedule);
  notice.addEventListener('focusin', () => clearTimeout(timer));
  notice.addEventListener('focusout', schedule);
  schedule();
  renderAlerts();
}
function renderAlerts() {
  $('alerts-list').innerHTML = alertHistory.length ? alertHistory.map(a => `<div class="activity-row alert-${a.type}"><span class="notice-icon">${icon(a.type === 'success' ? 'check' : a.type === 'info' ? 'info' : 'warning')}</span><div><p>${escape(a.message)}</p><small>${a.time.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}</small></div></div>`).join('') : '<div class="sales-empty"><h3>You’re up to date</h3><p>Counter activity and alerts will appear here.</p></div>';
}
$('show-alerts').addEventListener('click', () => { renderAlerts(); unreadAlerts = 0; $('alert-count').hidden = true; $('alerts-dialog').showModal(); });
function updateDate() {
  $('today').textContent = new Intl.DateTimeFormat('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date());
  $('year').textContent = new Date().getFullYear();
}
updateDate();
function renderProducts() {
  const search = $('search').value.toLowerCase().trim();
  const visible = products.filter(p => (category === 'all' || p.category === category) && `${p.name} ${p.description}`.toLowerCase().includes(search));
  $('product-grid').innerHTML = visible.map(p => `<button class="product-card" data-product="${p.id}" style="--art-bg:${p.color}" aria-label="Add ${p.name}${p.id === 'pandesal' ? ', pack of 5' : ''}, ${money(p.price)} to order"><div class="product-art">${productImage(p.id)}${p.tag ? `<span class="product-label">${p.tag}</span>` : ''}${cart[p.id] ? `<span class="quantity-badge">${cart[p.id]}</span>` : ''}</div><div class="product-details"><h3>${p.name}</h3><p class="product-description">${p.description}</p><div class="product-price-row"><span>${money(p.price)}</span><span class="add-badge">${icon('plus')}</span></div></div></button>`).join('');
  $('no-products').hidden = visible.length > 0;
}
function renderCart() {
  const summary = totals(cart);
  $('cart-items').innerHTML = products.filter(p => cart[p.id]).map(p => `<div class="cart-row"><div class="cart-thumb" style="--art-bg:${p.color}">${productImage(p.id)}</div><div><h3 class="cart-name">${p.name}</h3><div class="cart-unit">${money(p.price)} ${p.id === 'pandesal' ? '/ pack of 5' : '/ each'}</div><div class="quantity-control"><button data-adjust="${p.id}" data-delta="-1" aria-label="Decrease ${p.name} quantity">${icon('minus')}</button><span>${cart[p.id]}</span><button data-adjust="${p.id}" data-delta="1" aria-label="Increase ${p.name} quantity">${icon('plus')}</button><button class="remove-item" data-remove="${p.id}" aria-label="Remove ${p.name}">${icon('close')}</button></div></div><strong class="cart-price">${money(p.price * cart[p.id])}</strong></div>`).join('');
  $('empty-cart').hidden = summary.count > 0;
  $('cart-items').hidden = summary.count === 0;
  ['subtotal', 'total', 'charge-total'].forEach(id => $(id).textContent = money(summary.total));
  $('cart-count').textContent = summary.count;
  $('item-count').textContent = `${summary.count} ${summary.count === 1 ? 'item' : 'items'}`;
  $('checkout').disabled = summary.count === 0 || !storageReadable;
  $('clear-cart').disabled = summary.count === 0;
}
function adjustCart(id, delta) {
  const focused = document.activeElement;
  const focusProduct = focused.dataset.product;
  const focusAdjust = focused.dataset.adjust;
  const focusDelta = focused.dataset.delta;
  const next = (cart[id] || 0) + delta;
  if (next > 99) { toast('Maximum 99 of each product per order.', 5000, 'warning'); return false; }
  if (next <= 0) delete cart[id]; else cart[id] = next;
  renderProducts();
  renderCart();
  if (focusProduct) document.querySelector(`[data-product="${focusProduct}"]`)?.focus();
  if (focusAdjust) (document.querySelector(`[data-adjust="${focusAdjust}"][data-delta="${focusDelta}"]`) || $('checkout')).focus();
  return true;
}
$('product-grid').addEventListener('click', event => {
  const button = event.target.closest('[data-product]');
  if (!button) return;
  const added = adjustCart(button.dataset.product, 1);
  const product = products.find(p => p.id === button.dataset.product);
  if (added) toast(`${product.name} added to order`);
});
$('cart-items').addEventListener('click', event => {
  const adjust = event.target.closest('[data-adjust]');
  const remove = event.target.closest('[data-remove]');
  if (adjust) {
    const id = adjust.dataset.adjust;
    if (adjustCart(id, Number(adjust.dataset.delta))) toast(`${products.find(p => p.id === id).name}: ${cart[id] || 0} in order.`, 3000, 'info');
  }
  if (remove) { const name = products.find(p => p.id === remove.dataset.remove).name; delete cart[remove.dataset.remove]; renderProducts(); renderCart(); toast(`${name} removed from order.`, 4000, 'info'); }
});
$('search').addEventListener('input', renderProducts);
document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => {
  category = button.dataset.category;
  document.querySelectorAll('[data-category]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
  renderProducts();
}));
$('reset-search').addEventListener('click', () => { $('search').value = ''; document.querySelector('[data-category="all"]').click(); $('search').focus(); });
document.querySelectorAll('[data-type]').forEach(button => button.addEventListener('click', () => {
  orderType = button.dataset.type;
  document.querySelectorAll('[data-type]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
}));
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => $(button.dataset.close).close()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } }));
$('clear-cart').addEventListener('click', () => $('clear-dialog').showModal());
$('confirm-clear').addEventListener('click', () => { cart = {}; renderCart(); renderProducts(); $('clear-dialog').close(); toast('Order cleared. Ready for a fresh start.'); });

$('checkout').addEventListener('click', () => {
  const summary = totals(cart);
  if (!summary.count) return;
  $('payment-total').textContent = money(summary.total);
  $('payment-item-count').textContent = `${summary.count} ${summary.count === 1 ? 'item' : 'items'} · ${orderType}`;
  $('cash-input').value = '';
  $('payment-error').textContent = '';
  $('cash-input').setAttribute('aria-invalid', 'false');
  $('change-amount').textContent = money(0);
  $('payment-dialog').showModal();
  $('cash-input').focus();
});
function updateChange() {
  const { total } = totals(cart);
  const { cash, error } = validatePayment($('cash-input').value, total);
  $('change-amount').textContent = money(cash === null ? 0 : Math.max(0, cash - total));
  $('payment-error').textContent = error;
  $('cash-input').setAttribute('aria-invalid', String(Boolean(error)));
}
$('cash-input').addEventListener('input', updateChange);
document.querySelectorAll('[data-cash]').forEach(button => button.addEventListener('click', () => {
  $('cash-input').value = button.dataset.cash === 'exact' ? (totals(cart).total / 100).toFixed(2) : button.dataset.cash;
  updateChange();
  $('cash-input').focus();
}));
$('payment-form').addEventListener('submit', event => {
  event.preventDefault();
  if (completing) return;
  const { cash, error } = validatePayment($('cash-input').value, totals(cart).total);
  if (error) {
    $('payment-error').textContent = error;
    $('cash-input').setAttribute('aria-invalid', 'true');
    $('cash-input').focus();
    toast(error, 6000, 'error');
    return;
  }
  completing = true;
  $('complete-payment').disabled = true;
  try {
    if (!storageReadable) throw new Error('Browser storage is unavailable. The sale has not been recorded.');
    const sale = createSale(cart, cash, orderType);
    // Re-read before saving to include transactions from another open tab.
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(stored) || !stored.every(isValidSale)) throw new Error('Saved sales could not be read. The sale has not been recorded.');
    const updated = [sale, ...stored];
    try { localStorage.setItem(storageKey, JSON.stringify(updated)); }
    catch { throw new Error('Cannot save this sale. Browser storage may be full or blocked. Export existing sales or restore storage and try again.'); }
    sales = updated;
    cart = {};
    renderProducts(); renderCart(); renderSales();
    $('payment-dialog').close();
    showReceipt(sale, true);
    toast('Payment complete. Thank you!');
  } catch (error) { $('payment-error').textContent = error.message; toast(error.message, 8000, 'error'); }
  finally { completing = false; $('complete-payment').disabled = false; }
});

function receiptMarkup(sale) {
  return `<div class="receipt-paper"><div class="receipt-brand"><h3>campus bakery</h3><p>Fresh bakes. Happy campus.</p></div><div class="receipt-meta">Receipt: ${escape(sale.id)}<br>${escape(new Date(sale.date).toLocaleString('en-PH'))}<br>Order: ${escape(sale.type)} · Cash</div>${sale.items.map(item => `<div class="receipt-line"><div>${escape(item.name)}${item.id === 'pandesal' ? ' (pack of 5)' : ''}<small>${item.quantity} × ${money(item.price)}</small></div><span>${money(item.price * item.quantity)}</span></div>`).join('')}<div class="receipt-totals"><div class="receipt-line"><span>TOTAL</span><span>${money(sale.total)}</span></div><div class="receipt-line"><span>Cash received</span><span>${money(sale.cash)}</span></div><div class="receipt-line"><span>Change</span><span>${money(sale.change)}</span></div></div><div class="receipt-thanks">Made fresh. Served with a smile.<br>See you between classes!<br><br>Student project · Transaction summary</div></div>`;
}
function showReceipt(sale, fresh = false) {
  currentReceipt = sale;
  freshReceipt = fresh;
  $('receipt-heading').textContent = fresh ? 'Payment confirmed.' : 'Your receipt.';
  $('payment-confirmation').hidden = !fresh;
  $('receipt-content').innerHTML = receiptMarkup(sale);
  $('new-order').textContent = fresh ? 'New transaction →' : 'Close receipt';
  $('receipt-dialog').showModal();
}
$('print-receipt').addEventListener('click', () => { if (!currentReceipt) return; $('print-area').innerHTML = receiptMarkup(currentReceipt); window.print(); });
$('new-order').addEventListener('click', () => {
  $('receipt-dialog').close();
  if (!freshReceipt) return;
  cart = {};
  $('search').value = '';
  $('cash-input').value = '';
  $('payment-error').textContent = '';
  $('change-amount').textContent = money(0);
  $('cash-input').setAttribute('aria-invalid', 'false');
  $('payment-total').textContent = money(0);
  $('payment-item-count').textContent = '';
  $('receipt-content').replaceChildren();
  $('print-area').replaceChildren();
  $('payment-confirmation').hidden = true;
  $('receipt-heading').textContent = 'Your receipt.';
  document.querySelector('[data-category="all"]').click();
  document.querySelector('[data-type="Takeaway"]').click();
  document.querySelector('[data-view="pos"]').click();
  currentReceipt = null;
  freshReceipt = false;
  renderCart();
  document.querySelector('[data-product]')?.focus();
  toast('Ready for a new transaction.');
});
function renderSales() {
  updateDate();
  const today = dayKey(new Date());
  const daily = sales.filter(s => dayKey(s.date) === today);
  const revenue = daily.reduce((sum, s) => sum + s.total, 0);
  $('overview-total').textContent = money(revenue);
  $('overview-orders').textContent = daily.length;
  $('overview-items').textContent = daily.reduce((sum, s) => sum + s.items.reduce((n, i) => n + i.quantity, 0), 0);
  $('overview-average').textContent = money(daily.length ? Math.round(revenue / daily.length) : 0);
  $('daily-total').textContent = money(daily.reduce((sum, s) => sum + s.total, 0));
  $('daily-orders').textContent = daily.length;
  $('daily-items').textContent = daily.reduce((sum, s) => sum + s.items.reduce((n, i) => n + i.quantity, 0), 0);
  $('export-sales').disabled = !sales.length;
  const query = $('sales-search').value.toLowerCase().trim();
  const visibleSales = sales.filter(s => `${s.id} ${s.type} ${s.items.map(i => i.name).join(' ')}`.toLowerCase().includes(query));
  $('sales-list').innerHTML = visibleSales.length ? visibleSales.map(s => `<div class="sales-row"><div class="sale-detail"><strong>${escape(s.id)}</strong><small>${escape(new Date(s.date).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', year: 'numeric' }))}</small></div><span class="sale-type">${escape(s.type)} · ${s.items.reduce((sum, i) => sum + i.quantity, 0)} items</span><strong class="sale-amount">${money(s.total)}</strong><button class="secondary-button" data-receipt="${escape(s.id)}">${icon('receipt')}Receipt</button></div>`).join('') : '<div class="sales-empty"><h3>No transactions to display</h3><p>Complete an order or adjust your search to see matching transactions.</p></div>';
}
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
  const view = button.dataset.view;
  $('pos-view').hidden = view !== 'pos'; $('sales-view').hidden = view !== 'sales';
  $('breadcrumb').textContent = view === 'pos' ? 'Point of sale' : 'Sales history';
  document.querySelectorAll('[data-view]').forEach(b => { b.classList.toggle('active', b === button); if (b === button) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  if (view === 'sales') renderSales();
}));
$('sales-list').addEventListener('click', event => { const button = event.target.closest('[data-receipt]'); if (button) { const sale = sales.find(s => s.id === button.dataset.receipt); if (sale) showReceipt(sale); } });
$('sales-search').addEventListener('input', renderSales);
$('export-sales').addEventListener('click', () => {
  if (!sales.length) return;
  const quote = value => `"${String(value).replaceAll('"', '""')}"`;
  const rows = [['Receipt', 'Date (ISO)', 'Order type', 'Items', 'Total (PHP)', 'Cash (PHP)', 'Change (PHP)'], ...sales.map(s => [s.id, s.date, s.type, s.items.map(i => `${i.quantity}x ${i.name}`).join('; '), (s.total / 100).toFixed(2), (s.cash / 100).toFixed(2), (s.change / 100).toFixed(2)])];
  const blob = new Blob(['\uFEFF' + rows.map(row => row.map(quote).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = `campus-bakery-sales-${dayKey(new Date())}.csv`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Sales CSV prepared for download.', 4500, 'success');
});
window.addEventListener('storage', event => {
  if (event.key !== storageKey) return;
  try { const data = JSON.parse(event.newValue || '[]'); if (!Array.isArray(data) || !data.every(isValidSale)) throw new Error(); sales = data; storageReadable = true; renderSales(); renderCart(); }
  catch { storageReadable = false; renderCart(); toast('Saved sales changed unexpectedly. Checkout paused to protect records.', 8000, 'error'); }
});
document.addEventListener('keydown', event => { if (event.key === '/' && !document.querySelector('dialog[open]') && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && !$('pos-view').hidden) { event.preventDefault(); $('search').focus(); } });
renderProducts(); renderCart(); renderSales();


