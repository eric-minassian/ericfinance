use aes_gcm::{
    aead::{rand_core::RngCore, Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use argon2::{password_hash::SaltString, Argon2};
use base64::{engine::general_purpose, Engine as _};
use std::fs;

const NONCE_SIZE: usize = 12; // AES-GCM standard nonce size

/// Encrypts the file at `input_path` using `password` and writes the Base64-encoded
/// result to `output_path`. The output blob is constructed as:
/// [ salt_len (1 byte) | salt | nonce | ciphertext ]
fn encrypt_file(
    input_path: &str,
    output_path: &str,
    password: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    // Read file contents
    let plaintext = fs::read(input_path)?;

    // Generate a random salt for Argon2 (here we generate 16 random bytes)
    let mut salt_bytes = [0u8; 16];
    OsRng.fill_bytes(&mut salt_bytes);
    // You can wrap the salt bytes into a SaltString (Argon2 accepts a salt as &[u8])
    let salt = SaltString::encode_b64(&salt_bytes).unwrap();

    // Set up Argon2 with default parameters (you may adjust iterations/memory/parallelism)
    let argon2 = Argon2::default();

    // Derive a 32-byte key using Argon2 from the password and salt.
    let mut key = [0u8; 32];
    argon2
        .hash_password_into(password.as_bytes(), salt.as_bytes(), &mut key)
        .map_err(|e| format!("Key derivation failed: {}", e))?;

    // Create the AES-256-GCM cipher instance
    let cipher = Aes256Gcm::new_from_slice(&key)?;

    // Generate a random nonce (12 bytes)
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);

    // Encrypt the plaintext using the nonce.
    let ciphertext = cipher
        .encrypt(&nonce, plaintext.as_ref())
        .map_err(|e| format!("Encryption failed: {}", e))?;

    // Construct an output blob:
    // To allow decryption later, we need to store the salt and nonce along with the ciphertext.
    // We’ll store:
    // [ salt length (1 byte) | salt (16 bytes) | nonce (12 bytes) | ciphertext ]
    let mut output_blob = Vec::new();
    output_blob.push(salt.as_bytes().len() as u8); // salt length (should be 22 for SaltString in Base64, but we use our raw salt bytes)
    output_blob.extend_from_slice(salt.as_bytes()); // store the salt (as ASCII; note that this is a Base64 representation of the raw salt)
    output_blob.extend_from_slice(&nonce); // nonce (12 bytes)
    output_blob.extend_from_slice(&ciphertext); // ciphertext

    // Base64 encode the entire blob for easier storage.
    let encoded = general_purpose::STANDARD.encode(&output_blob);

    // Write the encoded string to the output file.
    fs::write(output_path, encoded)?;

    Ok(())
}

/// Decrypts the file at `input_path` (which is a Base64-encoded blob as produced by encrypt_file)
/// using `password` and writes the decrypted bytes to `output_path`.
fn decrypt_file(
    input_path: &str,
    output_path: &str,
    password: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    // Read the Base64-encoded blob from file
    let encoded = fs::read_to_string(input_path)?;
    let blob = general_purpose::STANDARD.decode(encoded.trim())?;

    // Parse the blob:
    // First byte is the salt length.
    let salt_len = blob[0] as usize;
    // Next salt_len bytes are the salt.
    let salt_start = 1;
    let salt_end = salt_start + salt_len;
    let salt_bytes = &blob[salt_start..salt_end];
    // Next NONCE_SIZE bytes are the nonce.
    let nonce_start = salt_end;
    let nonce_end = nonce_start + NONCE_SIZE;
    let nonce_bytes = &blob[nonce_start..nonce_end];
    // The remainder is the ciphertext.
    let ciphertext = &blob[nonce_end..];

    // Set up Argon2 (use the same parameters as during encryption)
    let argon2 = Argon2::default();

    // Derive the key using the provided password and extracted salt.
    let mut key = [0u8; 32];
    argon2
        .hash_password_into(password.as_bytes(), salt_bytes, &mut key)
        .map_err(|e| format!("Key derivation failed: {}", e))?;

    // Create the AES-256-GCM cipher instance
    let cipher = Aes256Gcm::new_from_slice(&key)?;

    // Convert nonce bytes into a Nonce type
    let nonce = Nonce::from_slice(nonce_bytes);

    // Decrypt the ciphertext
    let plaintext = cipher
        .decrypt(nonce, ciphertext.as_ref())
        .map_err(|e| format!("Decryption failed: {}", e))?;

    // Write the decrypted data to the output file.
    fs::write(output_path, plaintext)?;

    Ok(())
}
