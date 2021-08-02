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
router.get('/products', (req, res) => 
{
    // Find all products
    Product.find({}, (error, products) => 
    {
        if (error)
        {
            res.send(error);
        }
        else 
        {
            // Send an array of products.
            res.send(products);
        }
    }); 
});
// ----------------------------------------------------------------
// Adds a product to the database.
router.post('/products', (req,res) =>
{
    // Get input
    const input = req.body;

    // Find owner id.
    User.findOne({user_name: input.seller}, (error, user) =>
    {
        if (!user || error)
        {
            res.send({error: 'User not found'});
        }
        else
        {
            // Create new product.
            const newProduct = new Product(
            {
                name: input.name,
                price: input.price,
                owner: user._id
            });

            // Update the product collection
            newProduct.save((error,result)=>
            {
                if (error)
                { 
                    res.send({error: 'Something went wrong'});
                }
                else 
                {
                    res.send(result);
                }
            });
        }
    }); 
});
// ----------------------------------------------------------------
// Transfers ownership from one user to another if criteria is met.
router.post('/products/buy', (req, res) =>
{
    // Find buyer
    User.findOne({user_name: req.body.user_name}, (error, buyer) =>
    {
        if (!buyer || error)
        {
            // Error if buyer doesn't exist.
            res.send({msg: `Oops, ${req.body.user_name} was not found`});
        }
        else
        {
            // Find product
            Product.findById({_id: req.body.productID}, (error, product) =>
            {
                if (!product || error)
                {
                    // Error if product does not exist.
                    res.send({msg: `Oops, ${req.body.productID} was not found`});
                }
                else
                {
                    // Find seller
                    User.findById({_id: product.owner}, (error, seller) =>
                    {
                        
                        if (seller._id.equals(buyer._id) || error)
                        {
                            // Error if buyer and seller are the same.
                            res.send({msg: `Oops, ${buyer.name} already owns this item`});
                        }
                        else if (buyer.balance < product.price)
                        {
                            // Error if buyer does not have enough money.
                            res.send({msg: `Oops, ${buyer.name} has insufficient funds`});
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
                            res.send({msg: 'transaction successful!'});
                        }
                    }) 
                }
            });
        }
    });
});
// ----------------------------------------------------------------
// Deletes a product from the database.
router.delete('/products/:id', (req, res)=>
{
    Product.deleteOne({_id: req.params.id}, (error, result) =>
    {
        if (result.deletedCount === 0) 
        {
            // Error if item could not be deleted.
            res.send({error: "Could not delete item"});
        }
        else 
        {
            // Send success message.
            res.send({result: "The item has been deleted"});
        }
    });
});

// Export routers
module.exports = router;