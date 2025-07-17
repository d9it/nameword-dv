const axios = require('axios');

/**
 * Fetch exchange rate from one currency to another using FastForex API
 * @param {string} from - Base currency (e.g., 'EUR')
 * @param {string} to - Target currency (e.g., 'USD')
 * @returns {Promise<number>} - Returns conversion rate (e.g., 1 EUR = 1.10 USD)
 */
const getExchangeRate = async (from = 'EUR', to = 'USD') => {
  try {
    const response = await axios.get('https://api.fastforex.io/fetch-one', {
      params: {
        from,
        to,
        api_key: process.env.FAST_FOREX_KEY,
      },
    });

    const rate = response.data?.result?.[to];
    if (!rate) {
      throw new Error(`Exchange rate not found for ${from} → ${to}`);
    }

    return parseFloat(rate);
  } catch (error) {
    console.error(`❌ Failed to fetch exchange rate ${from} → ${to}:`, error.message);
    throw new Error(`Failed to fetch exchange rate ${from} → ${to}`);
  }
};

module.exports = getExchangeRate;
