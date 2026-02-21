const axios = require('axios');
const config = require('../config');

/**
 * Send a WhatsApp message via the Graph API
 * @param {string} to - The recipient's phone number
 * @param {string} body - The message text
 */
async function sendMessage(to, body) {
  try {
    const url = `https://graph.facebook.com/v17.0/${config.whatsappPhoneNumberId}/messages`;
    const data = {
      messaging_product: 'whatsapp',
      to: to,
      text: { body: body },
    };

    const headers = {
      Authorization: `Bearer ${config.whatsappAccessToken}`,
      'Content-Type': 'application/json',
    };

    await axios.post(url, data, { headers });
    console.log(`[WhatsApp API] Message sent to ${to}`);
  } catch (error) {
    console.error('[WhatsApp API Error] Sending message failed:', error.response ? error.response.data : error.message);
  }
}

module.exports = {
  sendMessage,
};
