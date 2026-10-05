const mongoose = require("mongoose");

const ProductoSchema = new mongoose.Schema({
  nombre: String,
  precio: Number,
  stock: Number
});

module.exports = mongoose.model("Producto", ProductoSchema);