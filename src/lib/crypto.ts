// Database encryption utilities using Web Crypto API

// Magic bytes to identify encrypted database files
const ENCRYPTED_DB_MAGIC = new Uint8Array([0x45, 0x4e, 0x43, 0x44, 0x42]); // "ENCDB"

export interface EncryptedDatabase {
  magic: Uint8Array;
  salt: Uint8Array;
  iv: Uint8Array;
  encryptedData: Uint8Array;
}

/**
 * Derives a key from a password using PBKDF2
 */
async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const passwordBuffer = new TextEncoder().encode(password);

  const importedKey = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000, // 100k iterations for security
      hash: "SHA-256",
    },
    importedKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts database data with a password
 */
export async function encryptDatabase(
  databaseBuffer: Uint8Array,
  password: string
): Promise<Uint8Array> {
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Derive key from password
  const key = await deriveKey(password, salt);

  // Encrypt the database
  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    databaseBuffer
  );

  // Create the encrypted database structure
  const encryptedDb: EncryptedDatabase = {
    magic: ENCRYPTED_DB_MAGIC,
    salt: salt,
    iv: iv,
    encryptedData: new Uint8Array(encryptedData),
  };

  // Serialize the encrypted database
  const totalLength =
    encryptedDb.magic.length +
    4 +
    encryptedDb.salt.length +
    4 +
    encryptedDb.iv.length +
    4 +
    encryptedDb.encryptedData.length;

  const result = new Uint8Array(totalLength);
  let offset = 0;

  // Magic bytes
  result.set(encryptedDb.magic, offset);
  offset += encryptedDb.magic.length;

  // Salt length + salt
  const saltLengthBytes = new Uint8Array(4);
  new DataView(saltLengthBytes.buffer).setUint32(
    0,
    encryptedDb.salt.length,
    true
  );
  result.set(saltLengthBytes, offset);
  offset += 4;
  result.set(encryptedDb.salt, offset);
  offset += encryptedDb.salt.length;

  // IV length + IV
  const ivLengthBytes = new Uint8Array(4);
  new DataView(ivLengthBytes.buffer).setUint32(0, encryptedDb.iv.length, true);
  result.set(ivLengthBytes, offset);
  offset += 4;
  result.set(encryptedDb.iv, offset);
  offset += encryptedDb.iv.length;

  // Data length + encrypted data
  const dataLengthBytes = new Uint8Array(4);
  new DataView(dataLengthBytes.buffer).setUint32(
    0,
    encryptedDb.encryptedData.length,
    true
  );
  result.set(dataLengthBytes, offset);
  offset += 4;
  result.set(encryptedDb.encryptedData, offset);

  return result;
}

/**
 * Checks if a buffer contains an encrypted database
 */
export function isEncryptedDatabase(buffer: Uint8Array): boolean {
  if (buffer.length < ENCRYPTED_DB_MAGIC.length) {
    return false;
  }

  for (let i = 0; i < ENCRYPTED_DB_MAGIC.length; i++) {
    if (buffer[i] !== ENCRYPTED_DB_MAGIC[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Decrypts an encrypted database with a password
 */
export async function decryptDatabase(
  encryptedBuffer: Uint8Array,
  password: string
): Promise<Uint8Array> {
  if (!isEncryptedDatabase(encryptedBuffer)) {
    throw new Error("Invalid encrypted database format");
  }

  let offset = ENCRYPTED_DB_MAGIC.length;

  // Read salt
  const saltLength = new DataView(encryptedBuffer.buffer, offset).getUint32(
    0,
    true
  );
  offset += 4;
  const salt = encryptedBuffer.slice(offset, offset + saltLength);
  offset += saltLength;

  // Read IV
  const ivLength = new DataView(encryptedBuffer.buffer, offset).getUint32(
    0,
    true
  );
  offset += 4;
  const iv = encryptedBuffer.slice(offset, offset + ivLength);
  offset += ivLength;

  // Read encrypted data
  const dataLength = new DataView(encryptedBuffer.buffer, offset).getUint32(
    0,
    true
  );
  offset += 4;
  const encryptedData = encryptedBuffer.slice(offset, offset + dataLength);

  // Derive key from password
  const key = await deriveKey(password, salt);

  try {
    // Decrypt the database
    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encryptedData
    );

    return new Uint8Array(decryptedData);
  } catch {
    throw new Error("Failed to decrypt database. Check your password.");
  }
}
