import { XMoney } from '../src';

// Initialize the client
const client = new XMoney('sk_test_9ebda13f38ad45217a264ef31f844819');

// Simulate an encrypted payload (this would normally come from the POST body)
// For this example, we'd need a valid encrypted string and key.
// Since we can't easily generate a valid encrypted string without the key matching the algorithm,
// we will just show the code structure.

// In a real application (e.g., Express):
/*
import express from 'express';
const app = express();

// Use raw body parser to get the raw body buffer/string
app.post('/webhook', express.text({ type: 'application/json' }), (req, res) => {
    const payload = req.body;

    try {
        const event = client.webhooks.constructEvent(payload);

        console.log('Received webhook event:', event);

        // Handle the event based on transaction status
        if (event.transactionStatus === 'complete-ok') {
            console.log(`Payment successful for order ${event.orderId}`);
        } else if (event.transactionStatus === 'complete-failed') {
            console.log(`Payment failed for order ${event.orderId}`);
        }

        // Return 200 OK
        res.status(200).send('OK');
    } catch (err) {
        console.error('Webhook Error:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

app.listen(3000, () => console.log('Running on port 3000'));
*/

console.log('Webhook example code is in the comments. To run a real test, you need a valid encrypted payload.');
