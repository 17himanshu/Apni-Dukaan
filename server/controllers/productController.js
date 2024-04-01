const fs = require("fs");
const Product = require("../models/productModel.js");
const slugify = require("slugify");
const Category = require("../models/categoryModel.js");
const braintree = require("braintree");
const dotenv = require("dotenv");
const Order = require("../models/orderModel.js");
const path=require("path")


dotenv.config({path: path.join(__dirname, '..', '.env')})

// payment gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});


// create product
const createPrdouctController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    if (photo && photo.size > 1000000) {
      return res
        .status(500)
        .send({ error: "Photo is required and should be less than 1mb" });
    }

    const products = new Product({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }

    await products.save();

    res.status(201).send({
      status: "success",
      message: "Products created successfully",
      products,
    });
  } catch (error) {
    res.status(500).send({
      status: "fail",
      message: "Error in creating product",
      error,
    });
  }
};

// get all products
const getProductController = async (req, res) => {
  try {
    // getting product details without photo for making our response fast
    const products = await Product.find()
      .select("-photo")
      .populate("category")
      .sort({ createdAt: -1 });

    res.status(201).send({
      status: "success",
      total_products: products.length,
      message: "All products list",
      products,
    });
  } catch (error) {
    res.status(500).send({
      status: "fail",
      message: "Error in getting all product",
      error: error.message,
    });
  }
};

// get single product
const getSingleProductController = async (req, res) => {
  try {
    const products = await Product.findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");

    res.status(201).send({
      status: "success",
      message: "Product found successfully",
      products,
    });
  } catch (error) {
    res.status(500).send({
      status: "fail",
      message: "product not found",
      error: error.message,
    });
  }
};

// get product photos
const productPhotoController = async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).select("photo");

    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    res.status(500).send({
      status: "fail",
      message: "Error while getting product photo",
      error: error.message,
    });
  }
};

// delete product
const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id).select("-photo");

    res.status(200).send({
      status: "success",
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      status: "fail",
      message: "Error while deleting product",
      error: error.message,
    });
  }
};

// update product
const updateProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    if (photo && photo.size > 1000000) {
      return res
        .status(500)
        .send({ error: "Photo is required and should be less than 1mb" });
    }

    const products = await Product.findByIdAndUpdate(
      req.params.pid,
      {
        ...req.fields,
        slug: slugify(name),
      },
      { new: true },
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }

    await products.save();

    res.status(201).send({
      status: "success",
      message: "Products updated successfully",
      products,
    });
  } catch (error) {
    res.status(500).send({
      status: "fail",
      message: "Error in updating product",
      error,
    });
  }
};

// filters
const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await Product.find(args).select("-photo");
    res.status(200).send({
      status: "success",
      products,
    });
  } catch (error) {
    res.status(400).send({
      status: "fail",
      message: "Error in filtering product",
      error,
    });
  }
};

// count prducts
const productCountController = async (req, res) => {
  try {
    const total = await Product.find().estimatedDocumentCount();
    res.status(200).send({
      status: "success",
      total,
    });
  } catch (error) {
    res.status(400).send({
      status: "fail",
      message: "Error in product count",
      error,
    });
  }
};

// product list based on page
const productListController = async (req, res) => {
  try {
    const perPage = 4;
    const page = req.params.page ? req.params.page : 1;
    const products = await Product.find()
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.status(200).send({
      status: "success",
      products,
    });
  } catch (error) {
    res.status(400).send({
      status: "fail",
      message: "Error in product count",
      error,
    });
  }
};

// search product
const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const result = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    }).select("-photo");

    res.status(200).send({
      status: "success",
      result,
    });
  } catch (error) {
    res.status(400).send({
      status: "fail",
      message: "Error in  Search Product API",
      error,
    });
  }
};

// similar product
const similarProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await Product.find({
      category: cid,
      _id: { $ne: pid },
    })
      .select("-photo")
      .limit(4)
      .populate("category");

    res.status(200).send({
      status: "success",
      products,
    });
  } catch (error) {
    res.status(400).send({
      status: "fail",
      message: "Error while getting similar products",
      error,
    });
  }
};

// get products by category
const productCategoryController = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    const products = await Product.find({ category })
      .select("-photo")
      .populate("category");

    res.status(200).send({
      status: "success",
      message: "Products found based on category",
      products,
      category,
    });
  } catch (error) {
    res.status(400).send({
      status: "fail",
      message: "Error while getting products",
      error,
    });
  }
};

// payment gateway api
//token (3rd party)
const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//payment
const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new Order({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      },
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createPrdouctController,
  getProductController,
  getSingleProductController,
  productPhotoController,
  deleteProductController,
  updateProductController,
  productFiltersController,
  productCountController,
  productListController,
  searchProductController,
  similarProductController,
  productCategoryController,
  braintreeTokenController,
  brainTreePaymentController
}