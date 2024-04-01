const express = require('express');
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/signup", async (req, res) => {
    try {
        const { name, mobile, email, password } = req.body;

        const isexistinguser1 = await User.findOne({ mobile: mobile });
        const isexistinguser2 = await User.findOne({ email: email });

        if (isexistinguser1 && isexistinguser2) {
            res.json({
                message: "User already exists with the given mobile number and email address!!",
                success: "false"
            })
        }

        if (isexistinguser1) {
            res.json({
                message: "User already exists with the given mobile number!!",
                success: "false"
            })
        }

        if (isexistinguser2) {
            res.json({
                message: "User already exists with the given email address!!",
                success: "false"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = new User({
            name,
            mobile,
            email,
            password: hashedPassword,
        })

        const userRes = await userData.save();

        const token = await jwt.sign({ userid: userRes._id }, process.env.JWT_SECRET);

        res.json({
            message: "User registered successfully!!",
            token: token,
            name: name,
            userid: userRes._id,
            success: "true"
        });
    }
    catch (e) {
        console.log(e);
    }

});


router.post("/login", async (req, res) => {
    try {
        const { emailormobile, password } = req.body;

        const userdetails = await User.findOne({ mobile: emailormobile });
        const userdetails1 = await User.findOne({ email: emailormobile });

        if (userdetails) {
            const passwordcompare = await bcrypt.compare(password, userdetails.password);

            if (!passwordcompare)
                res.json({ message: "Invalid credentials!!", success: 'false' });

            const token = await jwt.sign({ userid: userdetails._id }, process.env.JWT_SECRET);

            res.json({
                message: "You have been logged in!!",
                token: token,
                name: userdetails.name,
                userid: userdetails._id,
                success: 'true',
            });
        }

        else if (userdetails1) {
            const passwordcompare = await bcrypt.compare(password, userdetails1.password);

            if (!passwordcompare)
                res.json({ message: "Invalid credentials!!", success: 'false' });

            const token = await jwt.sign({ userid: userdetails1._id }, process.env.JWT_SECRET);

            res.json({
                message: "You have been logged in!!",
                token: token,
                name: userdetails1.name,
                userid: userdetails1._id,
                success: 'true',
            });
        }

        else {
            res.json({ message: "Invalid credentials!!", success: 'false' });
        }
    }
    catch (error) {
        console.log(error);
    }
})

router.post("/addfeedback", async (req, res) => {
    try {
        const { id, feedbacktype, feedbackcontent } = req.body;
        const response = await User.findById({ _id: id });
        const add = { feedbacktype, feedbackcontent };
        response.feedback.push(add);

        await response.save();
        res.json({
            message: "Thank you for the feedback!!",
            success: "true"
        });
    }
    catch (err) {
        console.log(err);
    }
})

module.exports = router;