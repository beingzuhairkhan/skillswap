import CryptoJS from "crypto-js";

const secretKey = CryptoJS.SHA256(
  process.env.NEXT_PUBLIC_DECRYPT_KEY!
); 

const iv = CryptoJS.enc.Hex.parse(
  "00000000000000000000000000000000"
);

export function decrypt(encryptedData: string) {
  const decrypted = CryptoJS.AES.decrypt(
    encryptedData,
    secretKey,
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

  if (!decryptedText) {
    throw new Error("Decryption failed - check key/iv match");
  }

  return JSON.parse(decryptedText);
}