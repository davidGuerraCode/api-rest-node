const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId, // agregamos Schema para decirle a mongoose que sólo es el tipo esperado (Id).
  name: String,
  price: Number
});

module.exports = mongoose.model("Product", productSchema);
