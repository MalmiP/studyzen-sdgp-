// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signup: Register a new user
exports.signup = async (req, res) => {
  try {
    // Only extract email and password from req.body
    const { email, password } = req.body;
    
    // Check if a user with this email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before storing it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user with only the necessary fields
    user = new User({ email, password: hashedPassword });
    await user.save();

    // Create a JWT payload
    const payload = { user: { id: user._id } };

    // Sign the token with a secret key and expiration time
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    res.status(201).json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login: Authenticate an existing user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the entered password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT payload
    const payload = { user: { id: user._id } };

    // Sign and return the token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};