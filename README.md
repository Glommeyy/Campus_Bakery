<<<<<<< HEAD
# Campus_Bakery
A small campus bakery counter selling bread, pastries, and baked goods, plus a few beverages.
=======
# Campus Bakery POS — basic interface

Project setup using HTML, CSS, vanilla JavaScript, and locally compiled Tailwind CSS.

## Run

```sh
npm install
npm run build:css
npm start
```

Open http://localhost:3000. The compiled stylesheet is included for immediate use with `npm start`.

## Current scope

The responsive interface contains all six products at the requested prices, search, category filters, and an empty order summary. Checkout is disabled. Cart logic, payments, receipts, sales history, and storage are outside this setup.

## Active files

- `index.html`: page structure and order placeholder.
- `styles.css`: Tailwind input and custom styles.
- `app.js`: product data, rendering, search, and filters.
- `assets/tailwind.css`: compiled stylesheet.
- `assets/products/`: existing product photos.
- `server.js`: local development server.

Run `npm run build:css` after editing styles or Tailwind classes.

Legacy files (`pos.js`, `professional.css`, `illustrations.js`, and `tests/`) are retained from the existing project and are not loaded by this interface.
>>>>>>> 88ac281 (Initial commit: set up Campus Bakery POS interface with HTML, CSS, JavaScript, and Tailwind)
