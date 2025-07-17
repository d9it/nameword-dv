// Mock environment variables for testing
process.env.APP_NAME = 'NamewordBackend-Test';
process.env.APP_KEY = 'test-app-key-123456789';
process.env.PORT = '8001';
process.env.NODE_ENV = 'test';
process.env.APP_URL = 'http://localhost:8001';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.DB_URI = 'mongodb://localhost:27017/nameword_test';
process.env.JWT_KEY = 'test-jwt-secret-key-123456789';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
process.env.GOOGLE_REDIRECT_URL = 'http://localhost:8001/auth/google/callback';
process.env.GOOGLE_CLOUD_PROJECT_ID = 'test-project-id';
process.env.MAIL_MAILER = 'smtp';
process.env.MAIL_HOST = 'smtp.gmail.com';
process.env.MAIL_PORT = '587';
process.env.MAIL_USERNAME = 'test@example.com';
process.env.MAIL_PASSWORD = 'test-password';
process.env.MAIL_ENCRYPTION = 'tls';
process.env.MAIL_FROM_ADDRESS = 'test@nameword.com';
process.env.MAIL_FROM_NAME = 'Nameword Test';
process.env.TELEGRAM_BOT_TOKEN = 'test-telegram-bot-token';
process.env.ADMIN_REGISTER_TOKEN = 'test-admin-register-token';
process.env.ADMIN_MAIL_ADDRESS = 'admin@nameword.com';
process.env.WHM_USERNAME = 'root';
process.env.WHM_PASSWORD = 'test-whm-password';
process.env.WHM_API_KEY = 'test-whm-api-key';
process.env.WHM_SERVER_URL = 'https://test-whm-server.com:2087';
process.env.WHM_CPANEL_URL = 'https://test-whm-server.com:2083';
process.env.WHM_NS1 = 'ns1.test-domain.com';
process.env.WHM_NS2 = 'ns2.test-domain.com';
process.env.WHM_SERVER_IP = '192.168.1.1';
process.env.PLESK_LOGIN = 'test-plesk-login';
process.env.PLESK_PASSWORD = 'test-plesk-password';
process.env.PLESK_SERVER_URL = 'https://test-plesk-server.com:8443';
process.env.PLESK_PANEL_URL = 'https://test-plesk-server.com:8880';
process.env.PLESK_NS1 = 'ns1.test-domain.com';
process.env.PLESK_NS2 = 'ns2.test-domain.com';
process.env.PLESK_SERVER_IP = '192.168.1.2';
process.env.CLOUDFLARE_EMAIL = 'test@cloudflare.com';
process.env.CLOUDFLARE_API_KEY = 'test-cloudflare-api-key';
process.env.TWILIO_ACCOUNT_SID = 'YOUR_TWILIO_ACCOUNT_SID';
process.env.TWILIO_AUTH_TOKEN = 'test-twilio-auth-token';
process.env.TWILIO_VERIFY_SID = 'test-twilio-verify-sid';
process.env.GCLOUD_STORAGE_BUCKET_NAME = 'test-bucket-name';
process.env.CR_CUSTOMER_ID = 'test-customer-id';
process.env.CONNECTSELLER_API_KEY = 'test-api-key';
process.env.SENTRY_DSN = '';
process.env.SENTRY_ENVIRONMENT = 'test';
process.env.SENTRY_TRACES_SAMPLE_RATE = '0.1';
process.env.SENTRY_PROFILES_SAMPLE_RATE = '0.1';
process.env.ALLOWED_ORIGINS = 'http://localhost:3000,http://localhost:5173';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../app');

let mongod;

beforeAll(async()=>{
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
});

beforeEach(async()=>{
    const collections = await mongoose.connection.db.collections();
    for(let collection of collections){
        await collection.deleteMany({});
    }
});

 afterAll(async()=>{
    if(mongod){
        await mongod.stop();
    }
    await mongoose.connection.close();
 });


