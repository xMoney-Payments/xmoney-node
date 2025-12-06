#!/usr/bin/env node
import { Command, OptionValues } from 'commander';
import { highlight } from 'cli-highlight';
import { XMoney } from './XMoney';
import { LIVE_ENV, TEST_ENV } from './constants';
import { isValidSecretKey } from './utils';

type CommandOptions = OptionValues;

const printJson = (data: unknown) => {
  console.log(highlight(JSON.stringify(data, null, 2), { language: 'json', ignoreIllegals: true }));
};

const program = new Command();

program
  .name('xmoney')
  .description('xMoney Node.js SDK CLI')
  .version('1.1.0')
  .requiredOption('--secret-key <key>', 'xMoney Secret Key', (value) => {
    if (!isValidSecretKey(value)) {
      console.error(
        `error: option '--secret-key <key>' argument '${value}' is invalid. ` +
        `It must start with 'sk_${TEST_ENV}_' or 'sk_${LIVE_ENV}_'.`,
      );
      process.exit(1);
    }
    return value;
  });

const createAction = (action: (client: XMoney, options: CommandOptions) => Promise<void>) => {
  return async (options: CommandOptions) => {
    const secretKey = program.opts().secretKey;
    const client = new XMoney(secretKey);

    try {
      await action(client, options);
    } catch (error: unknown) {
      if (error instanceof Error && 'raw' in error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        printJson((error as any).raw);
      } else {
        printJson(error);
      }
      process.exit(1);
    }
  };
};

const addPaginationOptions = (command: Command) => {
  return command
    .option('--page <number>', 'Page number', '1')
    .option('--per-page <number>', 'Items per page')
    .option('--reverse-sorting <0|1>', 'Sort order (0: oldest to newest, 1: newest to oldest)');
};

const getPaginationParams = (options: CommandOptions) => {
  return {
    page: parseInt(options.page, 10),
    perPage: options.perPage ? parseInt(options.perPage, 10) : undefined,
    reverseSorting: options.reverseSorting !== undefined ? options.reverseSorting === '1' : undefined,
  };
};

const cards = program.command('cards').description('Manage cards');

addPaginationOptions(
  cards
    .command('list')
    .description('List cards')
    .requiredOption('--customer-id <id>', 'Customer ID')
    .option('--order-id <id>', 'Order ID')
    .option('--has-token <yes|no>', 'Has token')
    .option('--card-status <status>', 'Card status (all, deleted)'),
).action(
  createAction(async (client, options) => {
    const result = await client.cards.list({
      customerId: parseInt(options.customerId, 10),
      orderId: options.orderId ? parseInt(options.orderId, 10) : undefined,
      hasToken: options.hasToken,
      cardStatus: options.cardStatus,
      ...getPaginationParams(options),
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

addPaginationOptions(
  orders
    .command('list')
    .description('List orders')
    .option('--customer-id <id>', 'Customer ID')
    .option('--external-order-id <id>', 'External Order ID')
    .option('--status <status>', 'Order status')
    .option('--type <type>', 'Order type')
    .option('--reason <reason>', 'Reason')
    .option('--created-at-from <date>', 'Created at from')
    .option('--created-at-to <date>', 'Created at to'),
).action(
  createAction(async (client, options) => {
    const result = await client.orders.list({
      customerId: options.customerId ? parseInt(options.customerId, 10) : undefined,
      externalOrderId: options.externalOrderId,
      orderStatus: options.status,
      orderType: options.type,
      reason: options.reason,
      createdAtFrom: options.createdAtFrom,
      createdAtTo: options.createdAtTo,
      ...getPaginationParams(options),
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
  .option('--site-id <id>', 'Site ID')
  .option('--description <text>', 'Description')
  .option('--external-order-id <id>', 'External Order ID')
  .option('--interval-type <type>', 'Interval type (day, month)')
  .option('--interval-value <value>', 'Interval value')
  .option('--retry-payment <value>', 'Retry payment')
  .option('--trial-amount <amount>', 'Trial amount')
  .option('--first-bill-date <date>', 'First bill date')
  .option('--back-url <url>', 'Back URL')
  .option('--card-number <number>', 'Card number')
  .option('--card-expiry-date <date>', 'Card expiry date')
  .option('--card-cvv <cvv>', 'Card CVV')
  .option('--card-holder-name <name>', 'Card holder name')
  .option('--save-card', 'Save card')
  .option('--invoice-email <email>', 'Invoice email')
  .action(
    createAction(async (client, options) => {
      const order = await client.orders.create({
        customerId: parseInt(options.customerId, 10),
        amount: parseFloat(options.amount),
        currency: options.currency,
        orderType: options.type,
        siteId: options.siteId ? parseInt(options.siteId, 10) : undefined,
        description: options.description,
        externalOrderId: options.externalOrderId,
        intervalType: options.intervalType,
        intervalValue: options.intervalValue ? parseInt(options.intervalValue, 10) : undefined,
        retryPayment: options.retryPayment,
        trialAmount: options.trialAmount ? parseFloat(options.trialAmount) : undefined,
        firstBillDate: options.firstBillDate,
        backUrl: options.backUrl,
        cardNumber: options.cardNumber,
        cardExpiryDate: options.cardExpiryDate,
        cardCvv: options.cardCvv,
        cardHolderName: options.cardHolderName,
        saveCard: options.saveCard,
        invoiceEmail: options.invoiceEmail,
      });
      printJson(order);
    }),
  );

orders
  .command('cancel')
  .description('Cancel an order')
  .requiredOption('--id <id>', 'Order ID')
  .option('--reason <reason>', 'Reason')
  .option('--message <message>', 'Message')
  .option('--terminate-order <yes>', 'Terminate order (yes)')
  .action(
    createAction(async (client, options) => {
      await client.orders.cancel(parseInt(options.id, 10), {
        reason: options.reason,
        message: options.message,
        terminateOrder: options.terminateOrder,
      });
      console.log('Order canceled successfully');
    }),
  );

orders
  .command('rebill')
  .description('Rebill an order')
  .requiredOption('--id <id>', 'Order ID')
  .requiredOption('--customer-id <id>', 'Customer ID')
  .requiredOption('--amount <amount>', 'Amount')
  .option('--transaction-option <option>', 'Transaction Option')
  .action(
    createAction(async (client, options) => {
      const result = await client.orders.rebill(parseInt(options.id, 10), {
        customerId: parseInt(options.customerId, 10),
        amount: parseFloat(options.amount),
        transactionOption: options.transactionOption,
      });
      printJson(result);
    }),
  );

const customers = program.command('customers').description('Manage customers');

addPaginationOptions(
  customers
    .command('list')
    .description('List customers')
    .option('--email <email>', 'Email')
    .option('--identifier <identifier>', 'Identifier')
    .option('--country <country>', 'Country')
    .option('--created-at-from <date>', 'Created at from')
    .option('--created-at-to <date>', 'Created at to'),
).action(
  createAction(async (client, options) => {
    const result = await client.customers.list({
      email: options.email,
      identifier: options.identifier,
      country: options.country,
      createdAtFrom: options.createdAtFrom,
      createdAtTo: options.createdAtTo,
      ...getPaginationParams(options),
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
  .option('--country <country>', 'Country')
  .option('--state <state>', 'State')
  .option('--city <city>', 'City')
  .option('--zip-code <code>', 'Zip Code')
  .option('--address <address>', 'Address')
  .option('--phone <phone>', 'Phone')
  .action(
    createAction(async (client, options) => {
      const customer = await client.customers.create({
        identifier: options.identifier,
        email: options.email,
        firstName: options.firstName,
        lastName: options.lastName,
        country: options.country,
        state: options.state,
        city: options.city,
        zipCode: options.zipCode,
        address: options.address,
        phone: options.phone,
      });
      printJson(customer);
    }),
  );

customers
  .command('update')
  .description('Update a customer')
  .requiredOption('--id <id>', 'Customer ID')
  .option('--email <email>', 'Email')
  .option('--identifier <identifier>', 'Identifier')
  .option('--first-name <name>', 'First name')
  .option('--last-name <name>', 'Last name')
  .option('--address <address>', 'Address')
  .option('--city <city>', 'City')
  .option('--country <country>', 'Country')
  .option('--state <state>', 'State')
  .option('--zip-code <code>', 'Zip Code')
  .option('--phone <phone>', 'Phone')
  .action(
    createAction(async (client, options) => {
      const customer = await client.customers.update(parseInt(options.id, 10), {
        email: options.email,
        identifier: options.identifier,
        firstName: options.firstName,
        lastName: options.lastName,
        address: options.address,
        city: options.city,
        country: options.country,
        state: options.state,
        zipCode: options.zipCode,
        phone: options.phone,
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

addPaginationOptions(
  transactions
    .command('list')
    .description('List transactions')
    .option('--order-id <id>', 'Order ID')
    .option('--customer-id <id>', 'Customer ID')
    .option('--email <email>', 'Email')
    .option('--transaction-method <method>', 'Transaction method')
    .option('--currency <currency>', 'Currency')
    .option('--amount-from <amount>', 'Amount from')
    .option('--amount-to <amount>', 'Amount to')
    .option('--transaction-type <type>', 'Transaction type')
    .option('--transaction-status <status...>', 'Transaction status')
    .option('--date-type <type>', 'Date type')
    .option('--created-at-from <date>', 'Created at from')
    .option('--created-at-to <date>', 'Created at to')
    .option('--source <source...>', 'Source')
    .option('--card-type <type>', 'Card type')
    .option('--card-number <number>', 'Card number')
    .option('--country <country>', 'Country'),
).action(
  createAction(async (client, options) => {
    const result = await client.transactions.list({
      orderId: options.orderId ? parseInt(options.orderId, 10) : undefined,
      customerId: options.customerId ? parseInt(options.customerId, 10) : undefined,
      email: options.email,
      transactionMethod: options.transactionMethod,
      currency: options.currency,
      amountFrom: options.amountFrom ? parseFloat(options.amountFrom) : undefined,
      amountTo: options.amountTo ? parseFloat(options.amountTo) : undefined,
      transactionType: options.transactionType,
      transactionStatus: options.transactionStatus,
      dateType: options.dateType,
      createdAtFrom: options.createdAtFrom,
      createdAtTo: options.createdAtTo,
      source: options.source,
      cardType: options.cardType,
      cardNumber: options.cardNumber,
      country: options.country,
      ...getPaginationParams(options),
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

if (require.main === module) {
  program.parse(process.argv);
}

export { program };
