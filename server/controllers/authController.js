const { comparePassword, hashPassword } =  require("../helpers/authHelper.js");
const Order =  require("../models/orderModel.js");
const User =  require("../models/userModel.js");
const JWT =  require("jsonwebtoken");

const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      answer,
    });

    res.status(201).json({
      status: "success",
      message: "Registered Successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).send({
      status: "fail",
      message: "Error in Registration",
      error,
    });
  }
};

// POST Login
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validation
    if (!email || !password) {
      return res.status(404).send({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    // check user existance
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({
        status: "fail",
        message: "Email is not registered",
      });
    }

    // Check password
    const match = await comparePassword(password, user.password);

    if (!match) {
      return res.status(200).send({
        status: "fail",
        message: "Invalid password",
      });
    }

    // Create token if email and password is valid
    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRESIN,
    });

    res.status(200).send({
      status: "success",
      message: "login successfull",
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        id: user._id,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).send({
      status: "fail",
      message: "Error in login",
      error,
    });
  }
};

// forgotPasswordController
const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    // validate
    if (!newPassword) {
      res.status(400).send({ message: "New Password is required" });
    }

    // check
    const user = await User.findOne({ email, answer });

    if (!user) {
      return res.status(404).send({
        status: "fail",
        message: "Wrong email address",
      });
    }

    const hashed = await hashPassword(newPassword);
    await User.findByIdAndUpdate(user._id, { password: hashed });

    res.status(200).send({
      status: "success",
      message: "password reset successfully",
    });
  } catch (error) {
    res.status(500).send({
      status: "fail",
      message: "Something went wrong",
      error,
    });
  }
};

// updateProfileController
const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await User.findById(req.user._id);

    // hash new Password if provided
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updateUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true },
    );

    res.status(200).send({
      status: "success",
      message: "Profile updated successfully",
      updateUser,
    });
  } catch (error) {
    res.status(500).send({
      status: "fail",
      message: "Error while updating profile",
      error,
    });
  }
};

// order
const getOrdersController = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");

    res.json(orders);
  } catch (error) {
    res.status(500).send({
      status: "fail",
      message: "Error while getting orders",
      error,
    });
  }
};

// all orders
const getAllOrdersController = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).send({
      status: "fail",
      message: "Error while getting all orders",
      error,
    });
  }
};

// order status
const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const orders = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true },
    );

    res.json(orders);
  } catch (error) {
    res.status(500).send({
      status: "fail",
      message: "Error while updating order status",
      error,
    });
  }
};

module.exports={
  registerController,
  loginController,
  updateProfileController,
  getOrdersController ,
  getAllOrdersController,
  orderStatusController,
  forgotPasswordController
}