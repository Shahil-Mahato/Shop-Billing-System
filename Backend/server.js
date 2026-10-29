require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const auth = require("./middleware/auth");

for (const k of ["MONGO_URI", "JWT_SECRET", "ADMIN_USER", "ADMIN_PASSWORD"]) {
  if (!process.env[k]) { console.error(`Missing ${k} in .env`); process.exit(1); }
}

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Retail Billing System API is running!");
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", auth, require("./routes/products"));
app.use("/api/invoices", auth, require("./routes/invoices"));

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error("DB connection failed:", err.message));