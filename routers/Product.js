// Routes for managing products.
// ----------------------------------------------------------------
const express = require('express');
const Product = require('../models/Product');  // require product models
const User = require('../models/User');  // require user models
const authenticateUser = require('../middleware/AuthenticateUser');

// Create router.
const router = new express.Router();

// ----------------------------------------------------------------
// Sends all products to client.
router.get('/products', async (req, res) => 
{
    try
    {
        // Find all products and send to client.
        const products = await Product.find({});
        res.send(products);
    }
    catch (error)
    {
        // Send error if products could not be retrieved.
        res.send({message: 'Could not retrieve products'});
    }
});
// ----------------------------------------------------------------
// Adds a product to the database.
router.post('/products', authenticateUser, async (req,res) =>
{
    // Get input
    const productInput = req.body;

    try
    {
        // Create new product.
        const newProduct = new Product(
        {
            name: productInput.name,
            price: productInput.price,
            owner: req.user._id
        });

        // Update database and send results to client.
        const product = await newProduct.save();
        res.redirect('/users/' + req.user_name);
    }
    catch (error)
    {
        // Send error if item could not be created.
        res.send({message: 'Something went wrong'});
    }
});
// ----------------------------------------------------------------
// Transfers ownership from one user to another if criteria is met.
router.post('/products/buy', authenticateUser, async (req, res) =>
{
    try
    {
        // Find the buyer.
        const buyer = await User.findById({_id: req.user._id});

        // Error if buyer doesn't exist.
        if (!buyer)
        {
            return res.send({message: `Oops, ${req.user.user_name} was not found`});
        }

        // Find the product.
        const product = await Product.findById({_id: req.body.productID});
    
        // Error if product does not exist.
        if (!product)
        {
            return res.send({message: `Oops, ${req.body.productID} was not found`});
        }
        
        // Find the seller.
        const seller = await User.findById({_id: product.owner});

        // Error if buyer and seller are the same.
        if (seller._id.equals(buyer._id))
        {
            res.send({message: `Oops, ${buyer.name} already owns this item`});
        }
        else if (buyer.balance < product.price)
        {
            // Error if buyer does not have enough money.
            res.send({message: `Oops, ${buyer.name} has insufficient funds`});
        }
        else
        {
            // Update buyers balance.
            buyer.balance -= product.price;
            buyer.save();
            
            // Update sellers balance.
            seller.balance += product.price;
            seller.save();

            // Update owner of product to match buyer.
            product.owner = buyer._id;
            product.save();
        
            // Display success message.
            res.send({message: 'transaction successful!'});
        }
    }
    catch (error)
    {
        // Send error message for unexpected errors.
        res.send({message: 'Could not perform action'});
    }
});
// ----------------------------------------------------------------
// Deletes a product from the database.
router.delete('/products/:id', authenticateUser, async (req, res)=>
{
    const productID = req.params.id;         // Get product id.
    const productOwnerID = req.user._id;     // Get owner id.
    const errorMessage = 'You are not authorized to perform this operation';  // Create error message.
    
    try
    {
        // Delete the product with match product and owner id.
        deletedProduct = await Product.deleteOne({_id: productID, owner: productOwnerID});

        // If successful send success message, else send error message.
        if (deletedProduct.deletedCount === 1)
        {
            res.send({message: `Product has been deleted`});
        }
        else
        {
            res.send({message: errorMessage});
        }
    }
    catch (error)
    {
        // Send error message if any other error occur.
        res.send({message: errorMessage});
    }
});

// Export routers
module.exports = router;