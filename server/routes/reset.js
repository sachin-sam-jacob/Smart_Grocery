const express = require('express');
const router = express.Router();
const {User} = require('../models/user'); 



router.post('/', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).send({ error: true, msg: 'Email not found' });
    }

    user.password = password; // Make sure to hash the password before saving
    user.resetCode = undefined;
    user.resetCodeExpiration = undefined;
    await user.save();

    res.status(200).send({ error: false, msg: 'Password has been reset' });
});

module.exports = router;