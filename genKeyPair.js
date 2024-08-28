const { generateKeyPairSync } = require('crypto');
const fs = require('fs');
const path = require('path');

const keyPair = () => {
    return generateKeyPairSync('ec', {
        namedCurve: 'secp256k1',

        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },

        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
}

const genKeyPair = () => {
    const folderPath = path.join(__dirname, 'secretKeys');

    // Check if the 'secretKeys' folder exists, create it if not
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }

    // Generate Refresh Token EC Keys
    const RefreshTokenKey = keyPair();

    // Save Refresh Token Keys to Files
    fs.writeFileSync(path.join(folderPath, 'refresh_token_ec_priv.pem'), RefreshTokenKey.privateKey, 'utf8');
    fs.writeFileSync(path.join(folderPath, 'refresh_token_ec_pub.pem'), RefreshTokenKey.publicKey, 'utf8');

    // Generate Access Token EC Keys
    const AccessTokenKey = keyPair();

    // Save Access Token Keys to Files
    fs.writeFileSync(path.join(folderPath, 'access_token_ec_priv.pem'), AccessTokenKey.privateKey, 'utf8');
    fs.writeFileSync(path.join(folderPath, 'access_token_ec_pub.pem'), AccessTokenKey.publicKey, 'utf8');

    console.log('\x1b[32m%s\x1b[0m', 'Keys have been generated and saved to files.');

    return {
        refreshTokenKeys: {
            publicKey: RefreshTokenKey.publicKey,
            privateKey: RefreshTokenKey.privateKey
        },
        accessTokenKeys: {
            publicKey: AccessTokenKey.publicKey,
            privateKey: AccessTokenKey.privateKey
        }
    };
}

const keys = genKeyPair();

// Now you have the keys available in the 'keys' object and saved in files
console.log(keys.refreshTokenKeys);
console.log(keys.accessTokenKeys);
