const { Cart } = require('../models/cart');
const express = require('express');
const router = express.Router();
const { MyList } = require('../models/myList');

router.get(`/`, async (req, res) => {

    try {

        const cartList = await Cart.find(req.query);

        if (!cartList) {
            res.status(500).json({ success: false })
        }

        return res.status(200).json(cartList);

    } catch (error) {
        res.status(500).json({ success: false })
    }
});



router.post('/add', async (req, res) => {

    const cartItem = await Cart.find({productId:req.body.productId, userId: req.body.userId});

    if(cartItem.length===0){
        let cartList = new Cart({
            productTitle: req.body.productTitle,
            image: req.body.image,
            rating: req.body.rating,
            price: req.body.price,
            quantity: req.body.quantity,
            subTotal: req.body.subTotal,
            productId: req.body.productId,
            userId: req.body.userId,
            countInStock:req.body.countInStock,
        });
    
    
    
        if (!cartList) {
            res.status(500).json({
                error: err,
                success: false
            })
        }
    
    
        cartList = await cartList.save();
    
        res.status(201).json(cartList);
    }else{
        res.status(401).json({status:false,msg:"Product already added in the cart"})
    }

   

});




router.delete('/:id', async (req, res) => {
    try {
        // Find the cart item by ID
        const cartItem = await Cart.findById(req.params.id);

        // If the cart item does not exist, return 404
        if (!cartItem) {
            return res.status(404).json({ msg: "The cart item with the given ID was not found!" });
        }

        // Remove the cart item from the Cart collection
        const deletedItem = await Cart.findByIdAndDelete(req.params.id);

        // If deletion failed, return 404
        if (!deletedItem) {
            return res.status(404).json({
                message: 'Cart item not found!',
                success: false
            });
        }

        // Now add the deleted item to the MyList (wishlist)
        const myListItem = new MyList({
            productTitle: cartItem.productTitle,
            image: cartItem.image,
            rating: cartItem.rating,
            price: cartItem.price,
            productId: cartItem.productId,
            userId: cartItem.userId
        });

        // Save the new wishlist item
        await myListItem.save();

        // Respond with success message
        res.status(200).json({
            success: true,
            message: 'Cart Item Deleted and added to Wishlist!',
            deletedItem,
            wishlistItem: myListItem
        });
    } catch (error) {
        console.error("Error removing item from cart and adding to wishlist:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});



router.get('/:id', async (req, res) => {

    const catrItem = await Cart.findById(req.params.id);

    if (!catrItem) {
        res.status(500).json({ message: 'The cart item with the given ID was not found.' })
    }
    return res.status(200).send(catrItem);
})


router.put('/:id', async (req, res) => {

    const cartList = await Cart.findByIdAndUpdate(
        req.params.id,
        {
            productTitle: req.body.productTitle,
            image: req.body.image,
            rating: req.body.rating,
            price: req.body.price,
            quantity: req.body.quantity,
            subTotal: req.body.subTotal,
            productId: req.body.productId,
            userId: req.body.userId
        },
        { new: true }
    )

    if (!cartList) {
        return res.status(500).json({
            message: 'Cart item cannot be updated!',
            success: false
        })
    }

    res.send(cartList);

})


module.exports = router;

