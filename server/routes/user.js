const { User } = require('../models/user');
const { ImageUpload } = require('../models/imageUpload');

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const multer = require('multer');
const fs = require("fs");

const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
  });
  
  var imagesArr = [];
  
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads");
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`);
      //imagesArr.push(`${Date.now()}_${file.originalname}`)
    },
  });
  
  const upload = multer({ storage: storage });
  
  router.post(`/upload`, upload.array("images"), async (req, res) => {
    imagesArr = [];
  
    try {
      for (let i = 0; i < req?.files?.length; i++) {
        const options = {
          use_filename: true,
          unique_filename: false,
          overwrite: false,
        };
  
        await cloudinary.uploader.upload(
          req.files[i].path,
          options,
          function (error, result) {
            if (error) {
              console.error("Cloudinary upload error:", error);
              return;
            }
            imagesArr.push(result.secure_url);
            fs.unlinkSync(`uploads/${req.files[i].filename}`);
          }
        );
      }
  
      let imagesUploaded = new ImageUpload({
        images: imagesArr,
      });
  
      imagesUploaded = await imagesUploaded.save();
      
      return res.status(200).json(imagesArr);
    } catch (error) {
      console.error("Error in image upload:", error);
      return res.status(500).json({ 
        error: true, 
        msg: "Failed to upload images" 
      });
    }
  });
  



  router.post(`/signup`, async (req, res) => {
    const { name, phone, email, password, isAdmin } = req.body;

    try {
        // Only check for existing email, remove phone number check
        const existingUserByEmail = await User.findOne({ email: email });
        if (existingUserByEmail) {
            return res.status(400).json({ 
                error: true, 
                msg: "Email Already Exists",
                details: "This email address is already registered. Please use a different email or sign in."
            });
        }

        // Phone number validation is only for format, not uniqueness
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await User.create({
            name: name,
            phone: phone,
            email: email,
            password: hashedPassword,
            isAdmin: isAdmin
        });

        const token = jwt.sign(
            { email: result.email, id: result._id }, 
            process.env.JSON_WEB_TOKEN_SECRET_KEY
        );

        res.status(200).json({
            user: result,
            token: token,
            msg: "Registration Successful",
            details: "Your account has been created successfully!"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            error: true, 
            msg: "Registration Failed",
            details: "Something went wrong while creating your account. Please try again."
        });
    }
});



router.post(`/signin`, async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email: email });
        if (!existingUser) {
            return res.status(404).json({ 
                error: true, 
                msg: "No account found with this email address",
                details: "Please check your email or create a new account"
            });
        }

        if (existingUser.isBlocked) {
            return res.status(403).json({ 
                error: true, 
                msg: "Account Blocked",
                details: "Your account has been blocked due to unauthorized activities. Please contact support."
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ 
                error: true, 
                msg: "Incorrect Password",
                details: "The password you entered is incorrect. Please try again."
            });
        }

        const token = jwt.sign(
            { 
                email: existingUser.email, 
                id: existingUser._id, 
                location: existingUser.location 
            }, 
            process.env.JSON_WEB_TOKEN_SECRET_KEY
        );
        
        return res.status(200).send({
            user: existingUser,
            token: token,
            msg: "Login Successful",
            details: "Welcome back!"
        });

    } catch (error) {
        res.status(500).json({ 
            error: true, 
            msg: "Server Error",
            details: "Something went wrong. Please try again later."
        });
    }
});

router.post(`/authWithGoogle`, async (req, res) => {
    const {name, phone, email, password, images, isAdmin} = req.body;
    

    try{
        const existingUser = await User.findOne({ email: email });       

        if(!existingUser){
            const result = await User.create({
                name:name,
                phone:phone,
                email:email,
                password:password,
                images:images,
                isAdmin:isAdmin
            });

    
            const token = jwt.sign({email:result.email, id: result._id}, process.env.JSON_WEB_TOKEN_SECRET_KEY);

            return res.status(200).send({
                 user:result,
                 token:token,
                 msg:"User Login Successfully!"
             })
    
        }

        else{
            const existingUser = await User.findOne({ email: email });
            const token = jwt.sign({email:existingUser.email, id: existingUser._id}, process.env.JSON_WEB_TOKEN_SECRET_KEY);

            return res.status(200).send({
                 user:existingUser,
                 token:token,
                 msg:"User Login Successfully!"
             })
        }
      
    }catch(error){
        console.log(error)
    }
})




router.put(`/changePassword/:id`, async (req, res) => {
    const { name, phone, email, password, newPass, images } = req.body;

    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
        return res.status(404).json({ error: true, msg: "User not found!" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
        return res.send({ error: true, msg: "Current password is incorrect" });
    } else {
        let newPassword = existingUser.password;
        if (newPass) {
            newPassword = await bcrypt.hash(newPass, 10);
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                name: name,
                phone: phone,
                email: email,
                password: newPassword,
                images: images,
            },
            { new: true }
        );

        if (!user) return res.status(400).send('The user cannot be updated!');

        res.send(user);
    }
});




router.get(`/`, async (req, res) =>{
    const userList = await User.find();

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

router.get('/:id', async(req,res)=>{
    const user = await User.findById(req.params.id);

    if(!user) {
        res.status(500).json({message: 'The user with the given ID was not found.'})
    } 
    res.status(200).send(user);
})


router.delete('/:id', (req, res)=>{
    User.findByIdAndDelete(req.params.id).then(user =>{
        if(user) {
            return res.status(200).json({success: true, message: 'the user is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "user not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})




router.get(`/get/count`, async (req, res) =>{
    const userCount = await User.countDocuments()

    if(!userCount) {
        res.status(500).json({success: false})
    }
    if(userCount){
        res.send({
            userCount: userCount
        });
    }
  
})



router.put('/:id',async (req, res)=> {
    try {
        const { name, phone, email, images } = req.body;

        const userExist = await User.findById(req.params.id);
        if (!userExist) {
            return res.status(404).json({ error: true, msg: "User not found" });
        }

        let newPassword = userExist.password;
        if(req.body.password) {
            newPassword = bcrypt.hashSync(req.body.password, 10);
        }

        // Use the images from the request body, not imagesArr
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                name: name,
                phone: phone,
                email: email,
                password: newPassword,
                images: images || userExist.images, // Use existing images if none provided
            },
            { new: true }
        );

        if(!user) {
            return res.status(400).json({ error: true, msg: "The user cannot be updated" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: true, msg: "Server error while updating user" });
    }
});




router.delete('/deleteImage', async (req, res) => {
    const imgUrl = req.query.img;

   // console.log(imgUrl)

    const urlArr = imgUrl.split('/');
    const image =  urlArr[urlArr.length-1];
  
    const imageName = image.split('.')[0];

    const response = await cloudinary.uploader.destroy(imageName, (error,result)=>{
       // console.log(error, res)
    })

    if(response){
        res.status(200).send(response);
    }
      
});


module.exports = router;