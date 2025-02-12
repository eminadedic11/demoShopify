const Notify = require("./models/notifyModel");

async function saveNotificationRequest(users) {
    if (!users.length) {
        console.log("⚠️ No users to notify.");
        return;
    }
    try {
        for (const user of users) {
            await Notify.updateOne(
                { phone: user.phone, productId: user.productId },
                { $set: { sent: false } },
                { upsert: true }
            );
        }
        console.log("✅ Notifications stored in MongoDB!");
    } catch (error) {
        console.error("❌ Error saving notifications:", error);
    }
}

module.exports = { saveNotificationRequest };