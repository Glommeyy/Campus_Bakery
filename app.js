// Interface only: render and filter the menu.
const products = [
  { id: 'pandesal', name: 'Pandesal', unit: 'Pack of 5', price: 25, category: 'bread' },
  { id: 'ensaymada', name: 'Ensaymada', unit: 'Per piece', price: 20, category: 'bread' },
  { id: 'spanish', name: 'Spanish Bread', unit: 'Per piece', price: 15, category: 'bread' },
  { id: 'cupcake', name: 'Chocolate Cupcake', unit: 'Per piece', price: 30, category: 'sweet' },
  { id: 'loaf', name: 'Loaf Bread', unit: 'Per loaf', price: 55, category: 'bread' },
  { id: 'coffee', name: 'Brewed Coffee', unit: 'Per cup', price: 25, category: 'drink' },
];
const currency = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
const grid = document.querySelector('#product-grid');
const search = document.querySelector('#search');
let category = 'all';
function renderProducts() {
  const query = search.value.trim().toLowerCase();
  const visible = products.filter(product =>
    (category === 'all' || product.category === category) &&
    `${product.name} ${product.unit}`.toLowerCase().includes(query)
  );
  grid.innerHTML = visible.map(product => `
    <article class="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <img src="assets/products/${product.id}.jpg" alt="${product.name}" class="h-40 w-full object-cover" width="400" height="240">
      <div class="p-4"><h3 class="font-semibold">${product.name}</h3><p class="mt-1 text-xs text-stone-500">${product.unit}</p><p class="mt-4 text-lg font-semibold text-amber-900">${currency.format(product.price)}</p></div>
    </article>
  `).join('');
  document.querySelector('#empty-search').hidden = visible.length > 0;
}
search.addEventListener('input', renderProducts);
document.querySelectorAll('[data-category]').forEach(button => {
  button.addEventListener('click', () => {
    category = button.dataset.category;
    document.querySelectorAll('[data-category]').forEach(item => {
      item.setAttribute('aria-pressed', String(item === button));
    });
    renderProducts();
  });
});
renderProducts();
