
const axios = require('axios');

const sendNotification = async (email, phone, productId) => {
  try {
    // TODO: Implement actual Infobip API integration
    console.log(`📧 Sending notification for product ${productId} to:`);
    console.log(`Email: ${email}`);
    console.log(`Phone: ${phone}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    throw error;
  }
};

module.exports = {
  sendNotification
};
