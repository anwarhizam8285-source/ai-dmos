import {
  encryptToken,
  decryptToken,
  generateEncryptionKey,
} from "../src/utils/tokenEncryption.js";

describe("tokenEncryption", () => {
  const key = generateEncryptionKey();

  test("round-trips a token through encrypt/decrypt", () => {
    const plaintext = "EAABsbCS1234567890abcdef";
    const encrypted = encryptToken(plaintext, key);
    expect(encrypted).not.toBe(plaintext);
    expect(decryptToken(encrypted, key)).toBe(plaintext);
  });

  test("generates a different ciphertext each time (random IV)", () => {
    const plaintext = "same-token-value";
    const first = encryptToken(plaintext, key);
    const second = encryptToken(plaintext, key);
    expect(first).not.toBe(second);
    expect(decryptToken(first, key)).toBe(plaintext);
    expect(decryptToken(second, key)).toBe(plaintext);
  });

  test("generateEncryptionKey returns a 64-char hex string (32 bytes)", () => {
    const generated = generateEncryptionKey();
    expect(generated).toMatch(/^[0-9a-f]{64}$/);
  });

  test("throws on malformed encrypted token", () => {
    expect(() => decryptToken("not-a-valid-token", key)).toThrow();
  });
});
