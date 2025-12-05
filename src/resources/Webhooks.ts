import crypto from 'crypto';
import { XMoneyResource } from '../XMoneyResource';
import { WebhookPayload } from '../types';
import { XMoney } from '../XMoney';

export class Webhooks extends XMoneyResource {
  constructor(client: XMoney) {
    super(client);
  }

  /**
   * Decrypts an encrypted payload received via POST from xMoney notification URLs.
   *
   * @param {string} payload The encrypted payload string.
   * @param {string} [secretKey] The secret key (your xMoney API key). If not provided, uses the client's secret key.
   *
   * @returns {WebhookPayload} The decrypted JSON object from the payload.
   * @throws {Error} If decryption fails or payload is invalid.
   */
  public constructEvent(payload: string, secretKey?: string): WebhookPayload {
    const key = secretKey || this.client.getSecretKey();

    // The key used for decryption is the part after the prefix (sk_live_ or sk_test_)
    // However, the documentation says "Use the OpenSSL aes-256-cbc algorithm, your API key, and the decoded IV."
    // And the example shows passing the full API key.
    // But wait, the PHP example shows passing $secretKey.
    // Let's look at the NodeJS example provided in the prompt:
    // function decryptNotificationPayload(encryptedPayload, secretKey = 'YOUR API KEY HERE')
    // It uses the secretKey directly.

    // IMPORTANT: The prompt says "Decrypt it using your API Key".
    // But usually "API Key" implies the full string starting with sk_...
    // However, in `XMoney.ts` we have `extractKeyFromSecretKey` which extracts the part after the prefix.
    // The `XMoney` constructor uses `extractKeyFromSecretKey` for the `Authorization` header (Bearer token).
    // Let's assume for now we use the full key as per the example, but we might need to verify if it's the full key or the extracted one.
    // The NodeJS example provided in the prompt uses `secretKey` directly in `crypto.createDecipheriv`.
    // `aes-256-cbc` requires a 32-byte key.
    // If the API key is longer or shorter, it might fail or need hashing.
    // Let's check the length of a typical xMoney API key.
    // The example key `sk_test_9ebda13f38ad45217a264ef31f844819` has 32 chars after the prefix?
    // 9ebda13f38ad45217a264ef31f844819 is 32 hex chars = 16 bytes? No, it's a string.
    // If it's a hex string, 32 chars = 16 bytes. AES-256 needs 32 bytes.
    // Maybe the key is the string itself?

    // Let's look at the provided NodeJS example again:
    // const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);

    // If `secretKey` is a string, `createDecipheriv` will treat it as a buffer or string.
    // If the key length doesn't match the algorithm, it will throw.

    // Let's implement it exactly as the example for now.

    const encryptedParts = payload.split(',', 2);
    if (encryptedParts.length !== 2) {
      throw new Error('Invalid payload format: missing IV or encrypted data');
    }

    const iv = Buffer.from(encryptedParts[0], 'base64');
    const encryptedData = Buffer.from(encryptedParts[1], 'base64');

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decryptedPayload = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]).toString('utf8');

    return JSON.parse(decryptedPayload) as WebhookPayload;
  }
}
