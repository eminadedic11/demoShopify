const mongoose = require('mongoose');

const notifySchema = new mongoose.Schema({
    email: { type: String, required: true },
    phone: { type: String, required: false },
    productId: { type: String, required: true },
    notified: { type: Boolean, default: false }, 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notify', notifySchema);
