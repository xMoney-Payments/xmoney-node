#!/usr/bin/env node
import { Command } from 'commander';
import { highlight } from 'cli-highlight';
import { XMoney } from './XMoney';
import { LIVE_ENV, TEST_ENV } from './constants';

const printJson = (data: any) => {
  console.log(highlight(JSON.stringify(data, null, 2), { language: 'json', ignoreIllegals: true }));
};

const program = new Command();

program
  .name('xmoney')
  .description('xMoney Node.js SDK CLI')
  .version('1.0.0')
  .requiredOption('--secret-key <key>', 'xMoney Secret Key', (value) => {
    if (!new RegExp(`^sk_(${TEST_ENV}|${LIVE_ENV})_`).test(value)) {
      console.error(
        `error: option '--secret-key <key>' argument '${value}' is invalid. It must start with 'sk_${TEST_ENV}_' or 'sk_${LIVE_ENV}_'.`,
      );
      process.exit(1);
    }
    return value;
  });

const createAction = (action: (client: XMoney, options: any) => Promise<void>) => {
  return async (options: any) => {
    const secretKey = program.opts().secretKey;
    const client = new XMoney(secretKey);

    try {
      await action(client, options);
    } catch (error: any) {
      printJson(error.raw || error);
      process.exit(1);
    }
  };
};

const cards = program.command('cards').description('Manage cards');

cards
  .command('list')
  .description('List cards')
  .requiredOption('--customer-id <id>', 'Customer ID')
  .option('--page <number>', 'Page number', '1')
  .action(
    createAction(async (client, options) => {
      const result = await client.cards.list({
        customerId: parseInt(options.customerId, 10),
        page: parseInt(options.page, 10),
      });
      printJson(result);
    }),
  );

cards
  .command('retrieve')
  .description('Retrieve a card')
  .requiredOption('--id <id>', 'Card ID')
  .requiredOption('--customer-id <id>', 'Customer ID')
  .action(
    createAction(async (client, options) => {
      const card = await client.cards.retrieve(
        parseInt(options.id, 10),
        parseInt(options.customerId, 10),
      );
      printJson(card);
    }),
  );

cards
  .command('delete')
  .description('Delete a card')
  .requiredOption('--id <id>', 'Card ID')
  .action(
    createAction(async (client, options) => {
      await client.cards.delete(parseInt(options.id, 10));
      console.log('Card deleted successfully');
    }),
  );

const orders = program.command('orders').description('Manage orders');

orders
  .command('list')
  .description('List orders')
  .option('--customer-id <id>', 'Customer ID')
  .option('--page <number>', 'Page number', '1')
  .option('--status <status>', 'Order status')
  .option('--type <type>', 'Order type')
  .action(
    createAction(async (client, options) => {
      const result = await client.orders.list({
        customerId: options.customerId ? parseInt(options.customerId, 10) : undefined,
        page: parseInt(options.page, 10),
        orderStatus: options.status,
        orderType: options.type,
      });
      printJson(result);
    }),
  );

orders
  .command('retrieve')
  .description('Retrieve an order')
  .requiredOption('--id <id>', 'Order ID')
  .action(
    createAction(async (client, options) => {
      const order = await client.orders.retrieve(parseInt(options.id, 10));
      printJson(order);
    }),
  );

orders
  .command('create')
  .description('Create an order')
  .requiredOption('--customer-id <id>', 'Customer ID')
  .requiredOption('--amount <amount>', 'Amount')
  .requiredOption('--currency <currency>', 'Currency')
  .requiredOption('--type <type>', 'Order type (purchase, recurring)')
  .action(
    createAction(async (client, options) => {
      const order = await client.orders.create({
        customerId: parseInt(options.customerId, 10),
        amount: parseFloat(options.amount),
        currency: options.currency,
        orderType: options.type,
      });
      printJson(order);
    }),
  );

orders
  .command('cancel')
  .description('Cancel an order')
  .requiredOption('--id <id>', 'Order ID')
  .action(
    createAction(async (client, options) => {
      await client.orders.cancel(parseInt(options.id, 10));
      console.log('Order canceled successfully');
    }),
  );

orders
  .command('rebill')
  .description('Rebill an order')
  .requiredOption('--id <id>', 'Order ID')
  .requiredOption('--customer-id <id>', 'Customer ID')
  .requiredOption('--amount <amount>', 'Amount')
  .action(
    createAction(async (client, options) => {
      const result = await client.orders.rebill(parseInt(options.id, 10), {
        customerId: parseInt(options.customerId, 10),
        amount: parseFloat(options.amount),
      });
      printJson(result);
    }),
  );

const customers = program.command('customers').description('Manage customers');

customers
  .command('list')
  .description('List customers')
  .option('--email <email>', 'Email')
  .option('--page <number>', 'Page number', '1')
  .action(
    createAction(async (client, options) => {
      const result = await client.customers.list({
        email: options.email,
        page: parseInt(options.page, 10),
      });
      printJson(result);
    }),
  );

customers
  .command('retrieve')
  .description('Retrieve a customer')
  .requiredOption('--id <id>', 'Customer ID')
  .action(
    createAction(async (client, options) => {
      const customer = await client.customers.retrieve(parseInt(options.id, 10));
      printJson(customer);
    }),
  );

customers
  .command('create')
  .description('Create a customer')
  .requiredOption('--identifier <identifier>', 'Identifier')
  .requiredOption('--email <email>', 'Email')
  .option('--first-name <name>', 'First name')
  .option('--last-name <name>', 'Last name')
  .action(
    createAction(async (client, options) => {
      const customer = await client.customers.create({
        identifier: options.identifier,
        email: options.email,
        firstName: options.firstName,
        lastName: options.lastName,
      });
      printJson(customer);
    }),
  );

customers
  .command('update')
  .description('Update a customer')
  .requiredOption('--id <id>', 'Customer ID')
  .option('--email <email>', 'Email')
  .option('--first-name <name>', 'First name')
  .option('--last-name <name>', 'Last name')
  .action(
    createAction(async (client, options) => {
      const customer = await client.customers.update(parseInt(options.id, 10), {
        email: options.email,
        firstName: options.firstName,
        lastName: options.lastName,
      });
      printJson(customer);
    }),
  );

customers
  .command('delete')
  .description('Delete a customer')
  .requiredOption('--id <id>', 'Customer ID')
  .action(
    createAction(async (client, options) => {
      await client.customers.delete(parseInt(options.id, 10));
      console.log('Customer deleted successfully');
    }),
  );

const transactions = program.command('transactions').description('Manage transactions');

transactions
  .command('list')
  .description('List transactions')
  .option('--order-id <id>', 'Order ID')
  .option('--customer-id <id>', 'Customer ID')
  .option('--page <number>', 'Page number', '1')
  .action(
    createAction(async (client, options) => {
      const result = await client.transactions.list({
        orderId: options.orderId ? parseInt(options.orderId, 10) : undefined,
        customerId: options.customerId ? parseInt(options.customerId, 10) : undefined,
        page: parseInt(options.page, 10),
      });
      printJson(result);
    }),
  );

transactions
  .command('retrieve')
  .description('Retrieve a transaction')
  .requiredOption('--id <id>', 'Transaction ID')
  .action(
    createAction(async (client, options) => {
      const transaction = await client.transactions.retrieve(parseInt(options.id, 10));
      printJson(transaction);
    }),
  );

transactions
  .command('capture')
  .description('Capture a transaction')
  .requiredOption('--id <id>', 'Transaction ID')
  .requiredOption('--amount <amount>', 'Amount')
  .action(
    createAction(async (client, options) => {
      await client.transactions.capture(parseInt(options.id, 10), {
        amount: parseFloat(options.amount),
      });
      console.log('Transaction captured successfully');
    }),
  );

transactions
  .command('refund')
  .description('Refund a transaction')
  .requiredOption('--id <id>', 'Transaction ID')
  .option('--amount <amount>', 'Amount')
  .option('--reason <reason>', 'Reason')
  .option('--message <message>', 'Message')
  .action(
    createAction(async (client, options) => {
      await client.transactions.refund(parseInt(options.id, 10), {
        amount: options.amount ? parseFloat(options.amount) : undefined,
        reason: options.reason,
        message: options.message,
      });
      console.log('Transaction refunded successfully');
    }),
  );

program.parse(process.argv);
