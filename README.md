# Retail Billing System

A billing system for a small retail shop, built with the MERN stack (MongoDB, Express, React, Node.js). It calculates GST on every bill, tracks stock, and prints invoices.

## Features

- **Products:** add, edit, delete and search products with price, GST rate (0, 5, 12, 18, 28%) and stock
- **GST billing:** CGST + SGST for same-state sales, IGST for other-state sales
- **Stock control:** stock drops when a bill is saved; bills that exceed stock are refused
- **Invoices:** printable tax invoice with shop name, address and GSTIN
- **Past bills:** search by customer, bill number or date
- **Sales summary:** bills, sales, GST collected and items sold for any day
- **Login:** JWT-based login protects the whole API

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth | JSON Web Tokens |

## Project structure

```
Backend/    Express API, models, routes
Frontend/   React app
```

## Getting started

You need Node.js (LTS) and a MongoDB database (local or MongoDB Atlas).

### 1. Backend

```bash
cd Backend
npm install
```

Create `Backend/.env`:

```
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_secret
ADMIN_USER=your_username
ADMIN_PASSWORD=your_password
CORS_ORIGIN=http://localhost:5173
```

Start it:

```bash
npm run dev
```

### 2. Frontend

```bash
cd Frontend
npm install
npm run dev
```

Open http://localhost:5173 and log in with the `ADMIN_USER` and `ADMIN_PASSWORD` from your `.env`.

## How money is handled

All amounts are stored in paise (whole numbers), so ₹50 is saved as `5000`. This avoids decimal rounding errors. Prices are entered **excluding GST**, and tax is calculated on the server for every bill.

## API overview

All routes except login need an `Authorization: Bearer <token>` header.

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Log in and get a token |
| GET, POST | `/api/products` | List and add products |
| PUT, DELETE | `/api/products/:id` | Edit and delete a product |
| POST | `/api/invoices` | Create a bill |
| GET | `/api/invoices?q=&date=` | List and search bills |
| GET | `/api/invoices/summary?date=` | Daily sales summary |
| GET | `/api/invoices/:id` | One bill |

## Customising the invoice

Edit your shop name, address, phone and GSTIN in `Frontend/src/shop.js`.

## Notes

- Never commit your `.env` file. It holds your database address and password.
- Have your accountant check the GST output before using it for real customers.
