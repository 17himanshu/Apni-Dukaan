const express = require("express");
const { isAdmin, requireSignIn } = require("./../middlewares/authMiddleware.js");
const {
  createCategoryController,
  deleteCategoryController,
  getAllCategoryController,
  singleCategoryController,
  updateCategoryController,
} = require("../controllers/categoryController.js");

const router = express.Router();

// routes
// create category
router.post(
  "/create-category",
  requireSignIn,
  isAdmin,
  createCategoryController,
);

// update category
router.put(
  "/update-category/:id",
  requireSignIn,
  isAdmin,
  updateCategoryController,
);

// get all category
router.get("/categories", getAllCategoryController);

// get category by slug(name without space)
router.get("/single-category/:slug", singleCategoryController);

// delete category by id
router.delete(
  "/delete-category/:id",
  requireSignIn,
  isAdmin,
  deleteCategoryController,
);
module.exports=router;
