// Model for a product.
// ----------------------------------------------------------------
const mongoose = require('mongoose');

// Schema for product creation.
const productSchema = new mongoose.Schema(
  {
    name: 
    {
      type: String,
      required: true,
    },
    price:
    {
      type: Number,
      required: true
    },
    owner:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    owner_user_name:
    {
      type: String,
      required: true
    },
});

// Create model.
const product = mongoose.model('Product', productSchema);

// Export model.
module.exports = product;