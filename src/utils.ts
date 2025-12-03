import * as crypto from 'crypto';

/**
 * Encodes the order data to a Base64 JSON string.
 * @param orderData The order data object.
 * @returns The Base64 encoded JSON string.
 */
export function getBase64JsonRequest(orderData: any): string {
    const jsonText = JSON.stringify(orderData);
    return Buffer.from(jsonText).toString('base64');
}

/**
 * Generates a HMAC-SHA512 checksum for the order data using the secret key.
 * @param orderData The order data object.
 * @param secretKey The secret key to sign with.
 * @returns The Base64 encoded checksum.
 */
export function getBase64Checksum(orderData: any, secretKey: string): string {
    const hmacSha512 = crypto.createHmac('sha512', secretKey);
    hmacSha512.update(JSON.stringify(orderData));
    return hmacSha512.digest('base64');
}
