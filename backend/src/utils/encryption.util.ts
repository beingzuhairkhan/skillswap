// encryption.util.ts
import * as crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secretKey = crypto
  .createHash('sha256')
  .update(process.env.ENCRYPT_KEY!)
  .digest('base64')
  .substr(0, 32);

const iv = Buffer.alloc(16, 0); 

export function encrypt(text: any) {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(JSON.stringify(text), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}