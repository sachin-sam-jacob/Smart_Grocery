// routes/userRoutes.js
const express = require('express');
const  { User } = require('../models/user');
const { HomeBanner } = require('../models/homeBanner');
const router = express.Router();

// 1. Fetch all users
router.get(`/`, async (req, res) => {
    try {
        const users = await User.find();
        if (!users) {
            res.status(500).json({ success: false })
        }
        return res.status(200).json(users);

    } catch (error) {
        res.status(500).json({ success: false })
    }

});

// // 2. View details of a specific user
router.get('/:id', async (req, res) => {
    console.log("entered");
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error while fetching user details." });
    }
});

// // 3. Block or unblock a user
// router.put('/users/:id/block', async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         // Toggle the isBlocked status
//         user.isBlocked = !user.isBlocked;
//         await user.save();
        
//         const status = user.isBlocked ? "blocked" : "unblocked";
//         res.status(200).json({ message: `User has been ${status}` });
//     } catch (err) {
//         res.status(500).json({ message: "Server error while updating user status." });
//     }
// });

module.exports = router;
