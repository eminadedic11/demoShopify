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

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app; 
