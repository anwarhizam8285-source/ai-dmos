import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";

function getKey(explicitKey) {
  const key = explicitKey || process.env.TOKEN_ENCRYPTION_KEY;
  if (!key) {
    throw new Error("TOKEN_ENCRYPTION_KEY is not set");
  }
  return Buffer.from(key, "hex");
}

export function encryptToken(token, key) {
  if (!token) {
    throw new Error("encryptToken: token is required");
  }
  const keyBuffer = getKey(key);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);

  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptToken(encryptedToken, key) {
  if (!encryptedToken) {
    throw new Error("decryptToken: encryptedToken is required");
  }
  const keyBuffer = getKey(key);
  const [ivHex, dataHex] = encryptedToken.split(":");
  if (!ivHex || !dataHex) {
    throw new Error("decryptToken: malformed encrypted token");
  }

  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(dataHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString("utf8");
}

export function generateEncryptionKey() {
  return crypto.randomBytes(32).toString("hex");
}
