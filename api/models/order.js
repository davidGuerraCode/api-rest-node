const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Creamos una relación con el esquema 'Product'
    required: true
  },
  quantity: {
    type: Number,
    default: 1 // Establecemos un valor por defecto.
  }

});

module.exports = mongoose.model('Order', orderSchema);