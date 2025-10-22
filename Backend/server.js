const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// Load env variables
dotenv.config();



const CustomerRouter = require("./Routes/CustomerRouter");
const SupplierRouter = require("./Routes/SupplierRouter");
const ProductRouter = require("./Routes/ProductRouter");
const SaleRouter = require("./Routes/SaleRoutes");
const RecoveryRouter = require("./Routes/recoveryRoutes");

//Express app intialization
const app = express();



//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: [process.env.FRONTEND_URL],
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	})
);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.connectionstring, {});
        console.log("MongoDB connected");
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

app.use("/shop-api/customers", CustomerRouter);
app.use("/shop-api/suppliers", SupplierRouter);
app.use("/shop-api/products", ProductRouter);
app.use("/shop-api/sales", SaleRouter);
app.use("/shop-api/recovery", RecoveryRouter);

//Listen to port
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
