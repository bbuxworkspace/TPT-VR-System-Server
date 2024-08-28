const { createCipheriv, timingSafeEqual } = require('crypto');
const { scrypt } = require('scrypt-js');
require('dotenv').config(); // Make sure this is at the top to load environment variables

const {
    base64_signer_key,
    base64_salt_separator,
    default_salt, // Add this line
} = process.env;

const rounds = parseInt(process.env.rounds);
const mem_cost = parseInt(process.env.mem_cost);

// console.log('base64_signer_key:', base64_signer_key);
// console.log('base64_salt_separator:', base64_salt_separator);
// console.log('rounds:', rounds);
// console.log('mem_cost:', mem_cost);

const ALGORITHM = 'aes-256-ctr';
const IV_LENGTH = 16;
const KEYLEN = 256 / 8;

const base64decode = (encoded) => {
    return Buffer.from(encoded.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
};

const hashPassword = async (password, salt = default_salt) => { // Use default_salt if salt is not provided
    try {
        if (!password || !salt) {
            console.error('Password or salt is missing:', { password, salt });
            throw new Error('Password or salt is missing');
        }

        const bSalt = Buffer.concat([
            base64decode(salt),
            base64decode(base64_salt_separator),
        ]);

        const iv = Buffer.alloc(IV_LENGTH, 0);
        const passwordBuffer = Buffer.from(password, 'utf-8');

        // Hashing Password
        const derivedKey = await scrypt(passwordBuffer, bSalt, 2 ** parseInt(mem_cost), parseInt(rounds), 1, KEYLEN);

        const cipher = createCipheriv(ALGORITHM, derivedKey, iv);

        const hash = Buffer.concat([
            cipher.update(base64decode(base64_signer_key)),
            cipher.final()
        ]).toString('base64');

        return { hash, salt }; // Return both hash and salt

    } catch (error) {
        console.error('Error in hashPassword:', error);
        throw error; // Re-throw after logging
    }
};

const checkPassword = async (password, hash, salt = default_salt) => { // Use default_salt if salt is not provided
    try {
        const { hash: generatedHash } = await hashPassword(password, salt);
        const knownHash = base64decode(hash);
        const bGeneratedHash = base64decode(generatedHash);

        if (bGeneratedHash.length !== knownHash.length) {
            // timingSafeEqual throws when buffer lengths don't match
            timingSafeEqual(knownHash, knownHash);
            return false;
        }

        return timingSafeEqual(bGeneratedHash, knownHash);

    } catch (error) {
        console.error('Error in checkPassword:', error);
        throw error; // Re-throw after logging
    }
};

module.exports = { hashPassword, checkPassword };
