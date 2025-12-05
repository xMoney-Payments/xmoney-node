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
   * @param {string} [apiKey] The API key (your xMoney API key). If not provided, uses the client's API key.
   *
   * @returns {WebhookPayload} The decrypted JSON object from the payload.
   * @throws {Error} If decryption fails or payload is invalid.
   */
  public constructEvent(payload: string, apiKey?: string): WebhookPayload {
    const key = apiKey || this.client.getApiKey();

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
