const express = require("express");
const View = require("./models/viewModel");
const Notify = require("./models/notifyModel");
const router = express.Router();
const { saveNotificationRequest } = require("./notificationService");
const axios = require("axios");
const infobipService = require("./infobipService");

// Fetch Product ID from Shopify
async function getProductIdFromInventoryItem(inventoryItemId) {
  const shopifyGraphQLUrl = "https://demo-store-ib.myshopify.com/admin/api/2024-01/graphql.json";
  const accessToken = "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";

  const query = {
    query: `
      query getProductId($inventoryItemId: ID!) {
        inventoryItem(id: $inventoryItemId) {
          variant {
            id
            product {
              id
            }
          }
        }
      }
    `,
    variables: {
      inventoryItemId: `gid://shopify/InventoryItem/${inventoryItemId}`,
    },
  };

  try {
    const response = await axios.post(shopifyGraphQLUrl, query, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    console.log("🔄 Shopify API Response:", JSON.stringify(response.data, null, 2));

    if (!response.data.data || !response.data.data.inventoryItem) {
      console.error("⚠️ Unexpected API response:", JSON.stringify(response.data, null, 2));
      return null;
    }

    return response.data.data.inventoryItem.variant.product.id.replace("gid://shopify/Product/", "");
  } catch (error) {
    console.error("❌ Shopify API Error:", error.response?.data || error.message);
    return null;
  }
}

router.use(express.json());

router.post("/track-ofs-view", async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const newView = new View({ userId, productId });
    await newView.save();
    res.status(200).json({ message: "View data saved successfully!" });
  } catch (err) {
    console.error("Error saving view:", err);
    res.status(500).json({ error: "Failed to save view" });
  }
});

router.post("/notify-request", async (req, res) => {
  try {
    const { userId, productId, inventoryItemId, email, phone } = req.body;
    if (!userId || !productId || !email || !phone) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const notification = new Notify({ userId, productId, inventoryItemId, email, phone });
    await notification.save();
    console.log("✅ Notification saved:", notification);
    res.status(201).json({ message: "Notification request saved." });
  } catch (error) {
    console.error("❌ Error saving notification:", error);
    res.status(500).json({ error: "Failed to save notification." });
  }
});

router.post("/webhook/inventory-update", async (req, res) => {
  try {
    console.log("🔔 Received inventory update webhook:", JSON.stringify(req.body, null, 2));
    const { inventory_item_id, available } = req.body;

    if (!inventory_item_id) {
      return res.status(400).json({ error: "Missing inventory_item_id" });
    }

    const productId = await getProductIdFromInventoryItem(inventory_item_id);
    if (!productId) {
      return res.status(500).json({ error: "Failed to fetch product ID" });
    }

    console.log(`🔍 Checking MongoDB for users waiting for Product ID: ${productId}...`);
    const usersToNotify = await Notify.find({ productId: productId.toString(), sent: false });

    if (usersToNotify.length > 0 && available > 0) {
      console.log(`✅ Product ID ${productId} is back in stock! Sending notifications...`);

      for (const user of usersToNotify) {
        await infobipService.sendNotification(user.email, user.phone, productId);
      }

      // ✅ Fix: Update all notified users at once
      await Notify.updateMany(
        { productId: productId.toString(), sent: false },
        { $set: { sent: true } }
      );

      console.log("✅ Notifications sent and marked as 'sent' in database.");
    } else {
      console.log(`⚠️ No notifications needed for Product ID: ${productId}.`);
    }

    res.status(200).json({ message: "Webhook processed." });
  } catch (error) {
    console.error("❌ Error handling webhook:", error);
    res.status(500).json({ error: "Failed to process webhook." });
  }
});

router.get("/check-stock", async (req, res) => {
    try {
        const { productId } = req.query;
        if (!productId) {
            return res.status(400).json({ error: "Missing productId" });
        }

        console.log(`🔍 Checking stock for Product ID: ${productId}`);

        const product = await Notify.findOne({ productId });

        if (!product) {
            return res.status(404).json({ message: "Product not found in notifications." });
        }

        const users = await Notify.find({ productId });

        res.status(200).json({ 
            productId, 
            available: product.sent ? "In Stock" : "Out of Stock",
            users: users.map(user => ({
                email: user.email,
                phone: user.phone
            }))
        });
    } catch (error) {
        console.error("❌ Error checking stock:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;
