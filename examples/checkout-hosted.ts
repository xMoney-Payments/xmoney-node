import { XMoney } from '../src';

const client = new XMoney('sk_test_example_key');

// Define the order data structure
const orderData = {
    siteId: 1,
    customer: {
        identifier: "your-unique-customer-id",
        firstName: "John",
        lastName: "Doe",
        country: "RO",
        city: "Bucharest",
        email: "john.doe@test.com"
    },
    order: {
        orderId: "your-unique-order-id",
        description: "Order Description",
        type: "purchase",
        amount: 2194.98,
        currency: "RON"
    },
    cardTransactionMode: "authAndCapture",
    backUrl: "https://myshop.com/payment-back-url"
};

// Generate the Hosted Checkout HTML
const htmlForm = client.checkout.createHosted(orderData);

console.log('--- Generated HTML Form ---');
console.log(htmlForm);
console.log('---------------------------');

// You can now send this HTML string to the client's browser to render and auto-submit.
