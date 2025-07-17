# Secure Telegram Service

## Overview

The Secure Telegram Service replaces the vulnerable `node-telegram-bot-api` package with a custom implementation using `axios` for secure Telegram Bot API communication.

## Security Features

### 1. **Input Validation & Sanitization**
- All inputs are validated before processing
- Text content is sanitized to prevent injection attacks
- Markdown text is properly escaped to prevent formatting injection

### 2. **Secure HTTP Configuration**
- Timeout limits (10 seconds) to prevent hanging requests
- No redirects allowed to prevent redirect attacks
- Custom User-Agent for request identification
- Proper error handling for different HTTP status codes

### 3. **Error Handling**
- Comprehensive error handling for API failures
- Graceful degradation when Telegram service is unavailable
- Detailed logging for debugging and monitoring

### 4. **Token Validation**
- Bot token format validation
- Token verification through Telegram API
- Secure token storage and handling

## Usage

### Basic Usage

```javascript
const TelegramService = require('../services/telegramService');

// Create service instance
const telegramService = new TelegramService(process.env.TELEGRAM_BOT_TOKEN);

// Send a simple message
await telegramService.sendMessage(chatId, 'Hello World!');

// Send with Markdown formatting
await telegramService.sendMarkdownMessage(chatId, '**Bold text** and *italic*');

// Send with HTML formatting
await telegramService.sendHtmlMessage(chatId, '<b>Bold</b> and <i>italic</i>');
```

### Credentials Message Formatting

```javascript
// Format credentials securely
const credentials = {
    instanceName: 'my-vps-instance',
    loginUrl: 'https://example.com/login',
    username: 'admin',
    password: 'secure-password'
};

const message = TelegramService.formatCredentialsMessage(credentials, 'WHM Credentials');
await telegramService.sendMarkdownMessage(chatId, message);
```

### Error Handling

```javascript
try {
    await telegramService.sendMessage(chatId, message);
} catch (error) {
    console.error('Telegram error:', error.message);
    // Continue with alternative notification method
}
```

## API Methods

### `sendMessage(chatId, text, options)`
Sends a text message to a chat.

**Parameters:**
- `chatId` (string): The chat ID to send the message to
- `text` (string): The message text
- `options` (object): Additional options
  - `parse_mode`: 'Markdown' or 'HTML'
  - `disable_web_page_preview`: boolean
  - `disable_notification`: boolean
  - `protect_content`: boolean

### `sendMarkdownMessage(chatId, text)`
Sends a message with Markdown formatting.

### `sendHtmlMessage(chatId, text)`
Sends a message with HTML formatting.

### `getMe()`
Gets bot information from Telegram API.

### `validateToken()`
Validates the bot token by calling the Telegram API.

### `escapeMarkdown(text)`
Static method to escape Markdown characters to prevent injection.

### `formatCredentialsMessage(credentials, type)`
Static method to format credentials messages securely.

## Security Considerations

### 1. **Input Sanitization**
All user inputs are sanitized using the `sanitizeHtml` utility to prevent XSS attacks.

### 2. **Markdown Escaping**
Special characters in Markdown are properly escaped to prevent formatting injection.

### 3. **Error Handling**
Comprehensive error handling prevents information leakage and ensures graceful degradation.

### 4. **Rate Limiting**
The service respects Telegram API rate limits and handles 429 errors appropriately.

### 5. **Token Security**
Bot tokens are validated and handled securely without logging sensitive information.

## Migration from node-telegram-bot-api

### Before (Vulnerable)
```javascript
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(token);
bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
```

### After (Secure)
```javascript
const TelegramService = require('../services/telegramService');
const telegramService = new TelegramService(token);
await telegramService.sendMarkdownMessage(chatId, message);
```

## Environment Variables

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

## Testing

```javascript
// Test token validation
const isValid = await telegramService.validateToken();
console.log('Token valid:', isValid);

// Test bot info
const botInfo = await telegramService.getMe();
console.log('Bot info:', botInfo);
```

## Monitoring

The service includes comprehensive logging:
- Request/response logging in development mode
- Error logging for debugging
- Success logging for monitoring

## Dependencies

- `axios`: For HTTP requests
- `sanitizer`: For input sanitization (from utils)

## Security Benefits

1. **Eliminates Vulnerable Dependencies**: Removes `node-telegram-bot-api` and its vulnerable dependencies (`request`, `tough-cookie`)

2. **Enhanced Security**: Implements proper input validation, sanitization, and error handling

3. **Better Control**: Custom implementation provides better control over security measures

4. **Maintainability**: Clean, well-documented code that's easier to maintain and audit

5. **Future-Proof**: Uses modern HTTP client (axios) with better security defaults 