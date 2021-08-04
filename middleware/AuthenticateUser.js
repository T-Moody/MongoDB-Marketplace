// Authentication middleware.
// ----------------------------------------------------------------
const User = require('../models/User.js');  // Require User schema model.

// ----------------------------------------------------------------
// Middleware used to verify whether a user is logged in or not.
const authenticateUser = async (req,res,next)=> 
{
    // Send error if session does not exist.
    if(!req.session.user_id)
    {    
        return res.send({message: 'This page requires you to be logged in'});
    }

    // Find existing session by id.
    try
    {
        const user = await User.findById(req.session.user_id);
        req.user = user;
        next();
    }
    catch(error)
    {
        // Send error message if error occurs.
        res.send({message: 'There was an error'});
    }
}

// Export middleware.
module.exports = authenticateUser;