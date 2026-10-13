# Campus Bakery POS

A responsive student POS built with HTML, vanilla JavaScript, and locally compiled Tailwind CSS. The six products use locally saved, AI-generated photorealistic food images. No account, remote fonts, or CDN connection is needed at runtime.

## Run

Install Node.js, then run this from the project folder:

```sh
npm start
```

Open **http://localhost:3000**. The compiled CSS is included, so installing packages is only necessary when changing/rebuilding the styles. Use the local server rather than double-clicking `index.html`, because JavaScript modules need HTTP.

## Use

1. Tap a product to add it. Pandesal is sold as one pack of five for ₱25.
2. Adjust quantities in the order panel; select Takeaway or Dine-in.
3. Choose Charge, enter cash received, and complete payment. The app checks that cash covers the total and calculates change.
4. Read the payment confirmation and digital receipt, then print it or select **New transaction** to reset the counter for the next customer.
5. Open Sales history to see today's totals, reopen receipts, or export all transactions to CSV.

The menu contains the six requested products with their exact prices. No extra tax or service charge is added. The `/` key focuses product search. Dialogs close with Escape. Layouts adapt to phones, tablets, and desktops.

## Edit and check

### Required transaction flow

| Step | Implementation |
| --- | --- |
| 1. Browse Products | Menu cards display all six product names and prices. Search and category filters help find products. |
| 2. Add to Cart | Tap products to add them; use +/− controls to adjust quantities or remove an item. |
| 3. Review Order | Current order displays products, quantities, unit prices, each item subtotal, order subtotal, and total. |
| 4. Enter Payment | Charge opens a numeric cash input, with optional preset cash buttons. |
| 5. Validate & Compute | Invalid or insufficient cash cannot complete payment. Valid cash shows computed change, including zero for exact payment. |
| 6. Confirm Payment | After the sale is saved, “Payment confirmed” appears with a saved-transaction message and full transaction details in the receipt. |
| 7. Receipt / New Transaction | The digital receipt includes items, quantities, subtotals, total, cash, change, date, and receipt ID. New transaction resets the cart, payment input, search, filters, and order type. |

Payment confirmation and the digital receipt share one screen to keep the cashier flow simple. Closing a historical receipt leaves any current order untouched.

### Common features checklist

All 12 required common features are supported: six named/priced products, on-screen add buttons, quantity increase/decrease, item removal, automatic item subtotals and total, current order summary, numeric cash entry, payment validation, correct change, successful-payment confirmation, a digital receipt with transaction reference, and a new-transaction reset.

Blank, non-numeric, negative, and invalid precision entries show **“Please enter a valid payment amount.”** Insufficient amounts show **“Insufficient payment. Please enter at least ₱165.00.”** with the actual current total substituted. Validation appears inside the payment dialog, including when submitting an empty field, rather than relying on browser validation popups. Exact cash gives zero change.

**New transaction** also clears the current digital receipt, any prepared print receipt, the cash amount, and the payment display. Completed sales remain available in Sales history.

- `index.html`: structure and dialogs.
- `styles.css`: Tailwind input and custom visual styling.
- `professional.css`: cashier workspace layout, components, alert styles, responsive breakpoints, and print styling.
- `app.js`: interface, browser storage, receipt, export, and checkout events.
- `pos.js`: products, integer-centavo calculations, and sale validation.
- `assets/products/`: optimized JPEG product images, with generation prompts in `prompts.json`. Replace a JPEG with your own bakery photo using the same filename to update the menu and cart.

```sh
npm install
npm run build:css
npm test
```

Tailwind is compiled using its CLI into `assets/tailwind.css`. See the [Tailwind documentation](https://tailwindcss.com/docs/installation/tailwind-cli).

## Data and project scope

Completed transactions are saved in this browser's localStorage under `campus-bakery-sales-v1`. Refreshing retains sales, but an unfinished cart is cleared. Data is specific to the browser and server origin; clearing browser data removes it. Export CSV regularly if you need a backup. The export is for reporting, not a restore/import file. Today's totals follow the device's local date and timezone.

This is a functioning single-counter student/demo application, without a backend, authentication, inventory, or payment gateway. Cash is entered manually. Receipts are transaction summaries for the project. Multiple devices do not share sales, and simultaneous payments across multiple browser tabs are not supported; use one cashier tab at a time.

## Workspace and alerts

The professional workspace uses top navigation, today's revenue/transactions/items/average order, a searchable catalog, and a dedicated order summary. Sales history supports searches by receipt reference, order type, or product name.

Dismissible notifications distinguish success, information, warnings, and errors. Alerts cover product additions, quantity changes, removal, order clearing, payment validation, successful payment, CSV preparation, storage problems, and quantity limits. Hovering or focusing a notification pauses dismissal. **Alerts** opens the last 30 messages from this session; opening it marks the current messages as read. Activity alerts reset on refresh, while sales history persists. Clearing an order requires confirmation. Payment problems also appear directly in the payment form.
