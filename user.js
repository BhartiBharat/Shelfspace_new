const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./userAuth");

// Sign up
router.post("/sign-up", async (req, res) => {
    try {
        const { username, email, password, address } = req.body;

        // Check username length is more than 3
        if (username.length < 4) {
            return res.status(400).json({ message: "username length should be greater than 3" });
        }

        // Check username already exists
        const existingusername = await User.findOne({ username: username });
        if (existingusername) {
            return res.status(400).json({ message: "username already exists" });
        }

        // Check email already exists
        const existingemail = await User.findOne({ email: email });
        if (existingemail) {
            return res.status(400).json({ message: "email already exists" });
        }

        // Check password length
        if (password.length <= 5) {
            return res.status(400).json({ message: "password length should be greater than 5" });
        }

        const hashpass = await bcrypt.hash(password, 10);
        const newUser = new User({
            username: username,
            email: email,
            password: hashpass,
            address: address
        });
        await newUser.save();
        return res.status(200).json({ message: "sign-up successfully" });

    } catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
});

// Sign in
router.post("/sign-in", async (req, res) => {
    try {
        const { username, password } = req.body;
        const existinguser = await User.findOne({ username });
        if (!existinguser) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        await bcrypt.compare(password, existinguser.password, (err, data) => {
            if (data) {
                const authClaims = [
                    { name: existinguser.username },
                    { role: existinguser.role },
                ];
                const token = jwt.sign({ authClaims }, "bookStore123", { expiresIn: "30d" });
                res.status(200).json({ id: existinguser.id, role: existinguser.role, token: token });
            } else {
                res.status(400).json({ message: "Invalid credentials" });
            }
        });
    } catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
});

// Get user information
router.get("/get-user-information", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const data = await User.findById(id).select('-password');
        return res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
});

// Update address
router.put("/update-address", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const { address } = req.body;
        await User.findByIdAndUpdate(id, { address: address });
        return res.status(200).json({ message: "Address updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
});

module.exports = router;
