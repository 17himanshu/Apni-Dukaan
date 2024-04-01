const express=require("express");
const {
  forgotPasswordController,
  getAllOrdersController,
  getOrdersController,
  loginController,
  orderStatusController,
  registerController,
  updateProfileController,
} =require("../controllers/authController.js");
const { isAdmin, requireSignIn } =require("../middlewares/authMiddleware.js");

// Router object
const router = express.Router();

// Routing
// Register || Method POST

router.post("/register", registerController);
router.post("/login", loginController);

// Forgot password
router.post("/forgot-password", forgotPasswordController);

// protected user route auth
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

// for admin dashboard
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

// update profile
router.put("/profile", requireSignIn, updateProfileController);

// orders
router.get("/orders", requireSignIn, getOrdersController);

// all orders
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);

// order status update
router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController,
);

module.exports=router;
