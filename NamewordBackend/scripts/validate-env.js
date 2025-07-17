#!/usr/bin/env node

/**
 * Environment Validation Script
 * 
 * This script validates all environment variables and provides helpful guidance
 * for setting up the application correctly.
 */

const path = require('path');
const fs = require('fs');

console.log('🔍 Validating environment variables...\n');

try {
    // Load and validate environment variables
    const env = require('../start/env.js');
    
    console.log('✅ Environment validation passed!');
    console.log('📋 Environment Summary:');
    console.log(`   - Environment: ${env.NODE_ENV}`);
    console.log(`   - Port: ${env.PORT}`);
    console.log(`   - App URL: ${env.APP_URL}`);
    console.log(`   - Frontend URL: ${env.FRONTEND_URL}`);
    console.log(`   - Database: ${env.DB_URI ? 'Configured' : 'Missing'}`);
    console.log(`   - JWT: ${env.JWT_KEY ? 'Configured' : 'Missing'}`);
    console.log(`   - Email: ${env.MAIL_HOST ? 'Configured' : 'Missing'}`);
    console.log(`   - Telegram: ${env.TELEGRAM_BOT_TOKEN ? 'Configured' : 'Missing'}`);
    console.log(`   - Sentry: ${env.SENTRY_DSN ? 'Configured' : 'Not configured'}`);
    
    // Check for security issues
    const warnings = [];
    
    if (env.NODE_ENV === 'production') {
        if (!env.SENTRY_DSN) {
            warnings.push('⚠️  SENTRY_DSN is recommended for production');
        }
        
        if (env.MAIL_ENCRYPTION !== 'tls') {
            warnings.push('⚠️  MAIL_ENCRYPTION should be "tls" in production');
        }
        
        if (env.APP_KEY.length < 32) {
            warnings.push('⚠️  APP_KEY should be at least 32 characters in production');
        }
        
        if (env.JWT_KEY.length < 32) {
            warnings.push('⚠️  JWT_KEY should be at least 32 characters in production');
        }
    }
    
    if (env.APP_KEY === env.JWT_KEY) {
        warnings.push('⚠️  APP_KEY and JWT_KEY should be different for security');
    }
    
    if (env.ADMIN_REGISTER_TOKEN && env.ADMIN_REGISTER_TOKEN.length < 16) {
        warnings.push('⚠️  ADMIN_REGISTER_TOKEN should be at least 16 characters');
    }
    
    if (warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    console.log('\n🚀 Environment is ready! You can start the application.');
    
} catch (error) {
    console.error('\n❌ Environment validation failed!');
    console.error('\n📝 To fix this:');
    console.error('1. Copy the environment template:');
    console.error('   cp docs/ENV_TEMPLATE.md .env');
    console.error('\n2. Edit the .env file with your actual values:');
    console.error('   nano .env');
    console.error('\n3. Run this validation script again:');
    console.error('   node scripts/validate-env.js');
    console.error('\n📚 For detailed documentation, see:');
    console.error('   docs/ENVIRONMENT_VARIABLES.md');
    
    console.error('\n🔐 Critical variables that must be set:');
    console.error('   - APP_KEY (32+ characters)');
    console.error('   - JWT_KEY (32+ characters)');
    console.error('   - DB_URI (MongoDB connection string)');
    console.error('   - APP_URL (Backend URL)');
    console.error('   - FRONTEND_URL (Frontend URL)');
    console.error('   - MAIL_HOST (SMTP host)');
    console.error('   - MAIL_USERNAME (SMTP username)');
    console.error('   - MAIL_PASSWORD (SMTP password)');
    console.error('   - ADMIN_MAIL_ADDRESS (Admin email)');
    console.error('   - ADMIN_REGISTER_TOKEN (16+ characters)');
    
    process.exit(1);
} 