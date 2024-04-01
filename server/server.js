const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db.js");
const authRoutes = require("./routes/authRoute.js");
const categoryRoutes = require("./routes/categoryRoute.js");
const productRoutes = require("./routes/productRoute.js");
const cors = require("cors");
const path = require("path")

// configure env

// dotenv.config();

// database config
connectDB();

const app = express();

app.use(cors());

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);

// rest api
app.get("/", (req, res) => {
  res.send({
    message: "Welcome to e-commerce app",
  });
});

// PORT
const PORT = process.env.PORT;

// listen server
app.listen(PORT, () => {
  console.log(
    `Server running on ${process.env.NODE_ENV} mode on PORT: ${PORT}`.bgBlue,
  );
});
