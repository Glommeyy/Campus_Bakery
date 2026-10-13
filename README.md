# Campus Bakery POS

A cash POS built with HTML, CSS, vanilla JavaScript, and locally compiled Tailwind CSS.

## Run

```sh
npm install
npm run build:css
npm start
```

Open http://localhost:3000. Refresh an already open tab to load updates.

## Transaction flow

1. Browse the six products, or use search and category filters.
2. Select **Add to cart**. Use **+**, **−**, or **Remove** to adjust the order (maximum 99 per product). One Pandesal item is a pack of five.
3. Review quantities, unit prices, item subtotals, and total in the order panel.
4. Type the cash received into the numeric payment field.
5. Check the calculated change. Empty, negative, invalid precision, and insufficient amounts show an error and cannot complete payment.
6. Select **Confirm payment** or press Enter in the cash field. The confirmation displays a digital receipt with a transaction reference, date, products, quantities, subtotals, total, cash, and change.
7. Select **New transaction** to reset the cart, cash, receipt, search, and filters.

Use a mouse or Tab to move between controls and Enter/Space to activate buttons. Changing the cart recalculates both the total and payment validation.

## Active files

- `index.html`: product catalog, order panel, payment form, and receipt screen.
- `styles.css`: Tailwind input and custom component styles.
- `app.js`: menu, cart interactions, payment flow, receipt, and reset.
- `pos.js`: product prices and cash calculations in integer centavos.
- `tests/pos.test.js`: pricing, totals, validation, and receipt data tests.
- `assets/tailwind.css`: compiled stylesheet.
- `assets/products/`: product photos.
- `server.js`: local development server.

Run `npm run build:css` after editing styles or Tailwind classes. Run `npm test` to check calculations and validation.

Transactions are held only in memory. Refreshing clears the current order and receipt; starting a new transaction discards the previous receipt. This version does not keep sales history or process electronic payments.

Legacy `professional.css` and `illustrations.js` are retained but not loaded.
