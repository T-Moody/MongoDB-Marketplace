// Model for a user.
// ----------------------------------------------------------------
const mongoose = require('mongoose')
const Product = require('./Product')

// Schema for user creation.
const UserSchema = new mongoose.Schema(
{
    name: 
    {
        type: String,
        required: true
    },
    user_name: 
    {
        type: String,
        unique: true,
        required: true
    },
    password:
    {
        type: String,
        required: true
    },
    balance:
    {
        type: Number,
        default: 100
    }
});

// Virtual object for items.
UserSchema.virtual('items',
{
    ref:'Product',
    localField:'_id',
    foreignField:'owner'
});

UserSchema.set('toJSON',{virtuals: true});
UserSchema.set('toObject', {virtuals: true});

// Delete all items for a user when the user is deleted.
UserSchema.pre('deleteOne', {document: true}, function (next)
{
    // Loop through and delete items.
    Product.deleteMany({owner: this._id}, (error, result) =>
    {
        next();
    });
});

// Create model.
const User = mongoose.model('User', UserSchema);

// Export model.
module.exports = User;