const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student' // Update the reference to 'Student' model
  },
  items: [String]
});


const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;


