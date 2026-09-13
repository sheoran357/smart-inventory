require("dotenv").config();

const express = require("express");
const pool = require("./config/db");


const app = express();

const PORT = process.env.PORT || 5000;

const dashboardRoutes = require("./routes/dashboardRoutes");

const productRoutes = require("./routes/productroutes");
const authRoutes = require("./routes/authRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const saleRoutes = require("./routes/saleRoutes");
const reportRoutes = require("./routes/reportRoutes");

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Smart Inventory API is running"
    });
});


app.use("/api/dashboard", dashboardRoutes);

app.use("/api/products", productRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/purchases", purchaseRoutes);

app.use("/api/sales", saleRoutes);

app.use("/api/reports", reportRoutes);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});