import * as crypto from 'crypto';

if (!process.env.ENCRYPT_KEY) {
  throw new Error("ENCRYPT_KEY is not defined in environment variables");
}

const algorithm = 'aes-256-cbc';

const secretKey = crypto
  .createHash('sha256')
  .update(process.env.ENCRYPT_KEY)
  .digest();

const iv = Buffer.alloc(16, 0);

export function encrypt(text: any) {
  const cipher = crypto.createCipheriv(
    algorithm,
    secretKey,
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(text), 'utf8'),
    cipher.final(),
  ]);

  return encrypted.toString('base64');
}