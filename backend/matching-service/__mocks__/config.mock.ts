import { generateKeyPairSync } from 'crypto'

// Generate RSA key pair for testing
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
})

export default {
    NODE_ENV: 'test',
    PORT: '3006',
    ACCESS_TOKEN_PUBLIC_KEY: Buffer.from(publicKey).toString('base64'),
    ACCESS_TOKEN_PRIVATE_KEY: Buffer.from(privateKey).toString('base64'),
    DB_URL: 'mongodb://localhost:27017/matching-service',
    USER_SERVICE_URL: 'http://localhost:3002',
    QUESTION_SERVICE_URL: 'http://localhost:3004',
    RMQ_USER: 'test',
    RMQ_PASSWORD: 'test',
    RMQ_HOST: 'localhost',
}
