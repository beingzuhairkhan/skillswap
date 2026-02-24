import CryptoJS from 'crypto-js';

const secretKey = CryptoJS.SHA256(process.env.NEXT_PUBLIC_DECRYPT_KEY!)
  .toString(CryptoJS.enc.Base64)
  .substr(0, 32);

const iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000');

export function decrypt(encryptedData: string) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}