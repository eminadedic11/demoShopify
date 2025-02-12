const mongoose = require("mongoose");

const mongoURI =
  "mongodb+srv://dedicemina11:BN9tqZysB6vwUHG5@ofs-tracking-cluster.mo8op.mongodb.net/ofs-tracking-cluster?retryWrites=true&w=majority&appName=ofs-tracking-cluster";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected to Atlas!");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

module.exports = mongoose; 
