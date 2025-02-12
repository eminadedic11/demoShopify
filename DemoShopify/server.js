const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("./database"); 
const routes = require("./routes");

const app = express();
const PORT = 3000;

app.use(cors({
  origin: "*", // Allow all origins (For testing, then restrict)
  methods: "GET,POST,OPTIONS",
  allowedHeaders: "Content-Type, Authorization, X-Requested-With"
}));

app.use(bodyParser.json());

app.use(routes);

app.get("/", (req, res) => {
  res.send("Welcome to the Shopify OFS Backend! 🚀");
});

// Add check-stock route
app.get("/check-stock", async (req, res) => {
    try {
        const { productId } = req.query;
        if (!productId) {
            return res.status(400).json({ error: "Missing productId" });
        }

        console.log(`🔍 Checking stock for Product ID: ${productId}`);

        // Query MongoDB to check if the product is in stock
        const Notify = require("./models/notifyModel");
        const product = await Notify.findOne({ productId });

        if (!product) {
            return res.status(404).json({ message: "Product not found in notifications." });
        }

        res.status(200).json({ productId, available: product.sent ? "In Stock" : "Out of Stock" });
    } catch (error) {
        console.error("❌ Error checking stock:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;