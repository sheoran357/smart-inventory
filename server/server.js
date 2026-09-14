require("dotenv").config();

const express = require("express");
const cors = require("cors");


const app = express();

const PORT = process.env.PORT || 5000;

const dashboardRoutes = require("./routes/dashboardRoutes");

const productRoutes = require("./routes/productroutes");
const authRoutes = require("./routes/authRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const saleRoutes = require("./routes/saleRoutes");
const reportRoutes = require("./routes/reportRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const userRoutes = require("./routes/userRoutes");


app.use(cors({
    origin: "http://localhost:5173"
}));


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

app.use("/api/categories", categoryRoutes);

app.use("/api/suppliers", supplierRoutes);

app.use("/api/transactions", transactionRoutes);

app.use("/api/users", userRoutes);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});