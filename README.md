# xMoney Node.js SDK

The xMoney Node.js SDK provides convenient access to the xMoney API from applications written in server-side TypeScript or JavaScript.

## Installation

Install the package with:

```bash
npm install xmoney
# or
yarn add xmoney
```

## Usage

The package needs to be configured with your account's secret key, which is available in the xMoney Dashboard.

### TypeScript

The SDK is written in TypeScript and includes type definitions.

```typescript
import { XMoney } from 'xmoney';

const client = new XMoney('sk_test_...');

// List cards
const { data: cards } = await client.cards.list({ customerId: 12345 });

console.log(cards);
```

### JavaScript

```javascript
const { XMoney } = require('xmoney');

const client = new XMoney('sk_test_...');

// List cards
const { data: cards } = await client.cards.list({ customerId: 12345 });

console.log(cards);
```

### Configuration

The SDK automatically detects the environment (Live or Test) based on the prefix of your secret key (`sk_live_` or `sk_test_`).

You can also pass a configuration object:

```typescript
const client = new XMoney({
  secretKey: 'sk_test_...',
  timeout: 20000, // Optional: Timeout in ms
});
```

## Resources

The SDK supports the following resources:

* `client.orders`
* `client.transactions`
* `client.customers`
* `client.cards`

### Cards

```typescript
// List cards
const { data: cards } = await client.cards.list({ customerId: 12345, page: 1 });

// Auto-Pagination
for await (const card of client.cards.listAutoPaging({ customerId: 12345 })) {
  console.log(card.id);
}

// Retrieve a card
const card = await client.cards.retrieve(cardId, customerId);

// Generate Hosted Checkout HTML
const html = client.checkout.createHosted({
  amount: 100,
  currency: 'EUR',
  orderId: '12345',
  siteId: 'your-site-id',
  // ... other order data
});

// Delete a card
await client.cards.delete(cardId);
```

### Orders

```typescript
// List orders
const { data: orders } = await client.orders.list({ customerId: 12345, page: 1 });

// Retrieve an order
const order = await client.orders.retrieve(12345);

// Create an order
const newOrder = await client.orders.create({
  customerId: 12345,
  amount: 100,
  currency: 'EUR',
  orderType: 'purchase',
});

// Cancel an order
await client.orders.cancel(12345);

// Rebill an order
const rebill = await client.orders.rebill(12345, {
  amount: 100,
  customerId: 12345,
});
```

### Customers

```typescript
// List customers
const { data: customers } = await client.customers.list({ email: 'john@example.com' });

// Retrieve a customer
const customer = await client.customers.retrieve(12345);

// Create a customer
const newCustomer = await client.customers.create({
  identifier: 'cust-001',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
});

// Update a customer
const updatedCustomer = await client.customers.update(12345, {
  firstName: 'Johnny',
});

// Delete a customer
await client.customers.delete(12345);
```

### Transactions

```typescript
// List transactions
const { data: transactions } = await client.transactions.list({ orderId: 12345 });

// Retrieve a transaction
const transaction = await client.transactions.retrieve(67890);

// Capture a transaction
await client.transactions.capture(67890, { amount: 100 });

// Refund a transaction
await client.transactions.refund(67890, {
  amount: 50,
  reason: 'requested_by_customer',
});
```

## Error Handling

The SDK throws typed errors for better error handling.

```typescript
import { XMoney, InvalidRequestError, AuthenticationError } from 'xmoney';

try {
  await client.cards.list({ customerId: 123 });
} catch (error) {
  if (error instanceof InvalidRequestError) {
    console.error('Invalid parameters:', error.message);
  } else if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
  } else {
    console.error('Generic API error:', error.message);
  }
}
```

## CLI

The package includes a built-in Command Line Interface (CLI) for interacting with the xMoney API directly from your terminal.

### CLI Usage

You can run the CLI using `npx` or by installing the package globally.

```bash
# Run directly
npx xmoney --secret-key sk_test_... <command>

# Or if installed globally
xmoney --secret-key sk_test_... <command>
```

### Commands

The CLI supports managing cards, orders, customers, and transactions. Here are a few examples:

#### List Cards

```bash
xmoney --secret-key sk_test_... cards list --customer-id 12345 --page 1
```

#### Retrieve Order

```bash
xmoney --secret-key sk_test_... orders retrieve --id 12345
```

### Options

* `--secret-key <key>`: **Required**. Your xMoney secret key.
* `--customer-id <id>`: Customer ID (required for list and retrieve).
* `--id <id>`: Resource ID (required for retrieve and delete).
* `--page <number>`: Page number for list results (default: 1).

### Features

* **Colorized Output**: JSON responses are automatically syntax-highlighted for better readability.
* **Error Reporting**: Clear error messages for invalid requests or authentication failures.
