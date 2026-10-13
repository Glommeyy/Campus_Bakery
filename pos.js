// Prices and cash are integer centavos to avoid floating-point rounding errors.
export const products = [
  { id: 'pandesal', name: 'Pandesal', description: 'Soft & golden · Pack of 5', price: 2500, category: 'bread', color: '#eee5d3', tag: 'Campus favorite' },
  { id: 'ensaymada', name: 'Ensaymada', description: 'Buttery, cheesy goodness', price: 2000, category: 'bread', color: '#f1e7d3', tag: '' },
  { id: 'spanish', name: 'Spanish Bread', description: 'Sweet, buttery filling', price: 1500, category: 'bread', color: '#e9e5d9', tag: '' },
  { id: 'cupcake', name: 'Chocolate Cupcake', description: 'A little chocolate happiness', price: 3000, category: 'sweet', color: '#eadcd4', tag: 'Sweet pick' },
  { id: 'loaf', name: 'Loaf Bread', description: 'Soft slices, everyday comfort', price: 5500, category: 'bread', color: '#e7e8dc', tag: '' },
  { id: 'coffee', name: 'Brewed Coffee', description: 'Freshly brewed · Per cup', price: 2500, category: 'drink', color: '#e7ded0', tag: 'Perfect pairing' },
];
export const money = cents => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(cents / 100);
export function parseCash(value) {
  if (!/^\d+(\.\d{1,2})?$/.test(String(value))) return null;
  const [whole, fraction = ''] = String(value).split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents <= 100000000 ? cents : null;
}
export function validatePayment(value, total) {
  const cash = parseCash(value);
  if (cash === null) return { cash: null, error: 'Please enter a valid payment amount.' };
  if (cash < total) return { cash, error: `Insufficient payment. Please enter at least ${money(total)}.` };
  return { cash, error: '' };
}
export function cartLines(cart) {
  return products.filter(p => Number.isInteger(cart[p.id]) && cart[p.id] > 0)
    .map(p => ({ id: p.id, name: p.name, price: p.price, quantity: cart[p.id] }));
}
export function totals(cart) {
  return cartLines(cart).reduce((sum, item) => ({ count: sum.count + item.quantity, total: sum.total + item.price * item.quantity }), { count: 0, total: 0 });
}
export function createSale(cart, cash, type, now = new Date(), id = `CB-${crypto.randomUUID().slice(0, 8).toUpperCase()}`) {
  const summary = totals(cart);
  if (!summary.count) throw new Error('Add an item before checking out.');
  if (!Number.isSafeInteger(cash) || cash < summary.total) throw new Error('Cash received must cover the total.');
  if (!['Takeaway', 'Dine-in'].includes(type)) throw new Error('Choose a valid order type.');
  return { id, date: now.toISOString(), type, items: cartLines(cart), total: summary.total, cash, change: cash - summary.total };
}
export function isValidSale(sale) {
  return sale && typeof sale.id === 'string' && Number.isFinite(Date.parse(sale.date)) && ['Takeaway', 'Dine-in'].includes(sale.type)
    && Array.isArray(sale.items) && sale.items.length > 0 && sale.items.every(i => typeof i.name === 'string' && Number.isSafeInteger(i.price) && i.price > 0 && Number.isInteger(i.quantity) && i.quantity > 0 && i.quantity <= 99)
    && Number.isSafeInteger(sale.total) && sale.total === sale.items.reduce((s, i) => s + i.price * i.quantity, 0)
    && Number.isSafeInteger(sale.cash) && sale.cash >= sale.total && sale.change === sale.cash - sale.total;
}
export const dayKey = date => new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(date));
