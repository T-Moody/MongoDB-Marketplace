// Routes for managing users.
// ----------------------------------------------------------------
const express = require('express');
const bcrypt = require('bcrypt');       // require password encryption
const User = require('../models/User'); // require user models
const Products = require('../models/Product')
const authenticateUser = require('../middleware/AuthenticateUser');

// Create router.
const router = new express.Router(); 

// ----------------------------------------------------------------
// Find user by username and send to client.
router.get('/users/:user_name', authenticateUser, async (req,res) =>
{
    // Get user and all owned items.
    const userProfile = await User.findOne({user_name: req.user.user_name}).populate('items').exec();
    const allProducts = await Products.find({});
    
    // Remove password property and send result to user.
    const profileObj = userProfile.toObject();
    delete profileObj.password;
    console.log(profileObj);
    res.render('user.ejs', {items: allProducts, user: profileObj});
});
// ----------------------------------------------------------------
// Displays all of the users and their items.
router.get('/summary', async (req,res) =>
{
    try
    {
        // get all profiles and send to client.
        const profiles = await User.find({}).populate('items').exec();
        res.send(profiles);
    }
    catch (error)
    {
        // Send error message if error occurs.
        res.send({message: 'Could not retrieve profiles'});
    }
});
// ----------------------------------------------------------------
// Create new user.
router.post('/users/register', async (req,res) =>
{
    // Create user object.
    const newUser = new User({...req.body});  
    try
    {
        // Hash password.
        newUser.password = await bcrypt.hash(newUser._id + newUser.password, 8);

        // Save user and send response without password.
        const user = await newUser.save();
        const userObj = user.toObject();
        delete userObj.password;
        //res.send(userObj);
        req.session.user_id = userObj._id;
        res.redirect('/users/' + userObj.user_name);
    }
    catch(error)
    {
        // Send error if operation failed.
        res.send({error: 'Could not create user.'});
    }
});
// ----------------------------------------------------------------
// Log into an existing user.
router.post('/users/login', async (req, res) =>
{
    try
    {
        // Get username and password.
        const username = req.body.user_name;
        const password = req.body.password;

        // Search for user in database.
        const user = await User.findOne({user_name: username});  

        // Check if password matches.
        const isMatch = await bcrypt.compare(user._id + password, user.password);  

        // Log in if password matches. 
        if (isMatch)
        {
            req.session.user_id = user._id;
            //res.send({message: `Successfully logged in. Welcome ${user.name}`});
            res.redirect('/users/' + user.user_name)
        }
        else
        {
            // Else return an error.
            res.send({message: 'Error logging in. Incorrect username/password'})
        }
    }
    catch (error)
    {
        // Return error if login failed.
        res.send({message: 'Error logging in. Incorrect username/password'});
    }
});
// ----------------------------------------------------------------
// Log out current user.
router.post('/users/logout', authenticateUser, (req, res) =>
{
    // Delete session with client and send confirmation.
    req.session.destroy();
    //res.send({message: `Successfully logged out ${req.user.name}`});
    res.redirect('/');
});
// ----------------------------------------------------------------
// Delete a single user by id.
router.delete('/users/me', authenticateUser, async (req,res) =>
{
    try
    {
        // Find and delete user.
        const user = await User.findById({_id: req.user._id});
        const deleteUser = await user.deleteOne();
        
        // Delete session with client.
        req.session.destroy();

        // Send confirmation that user was deleted.
        res.send({message: `${req.user.name} has been deleted!`});
    }
    catch (error)
    {
        // Error message if deletion fails.
        res.send({message: `Could not delete ${req.user.name}`});
    }
});

// Export user routers.
module.exports = router;