
const mongoose = require('mongoose');

const viewSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('View', viewSchema);
