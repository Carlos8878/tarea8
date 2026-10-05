const mongoose = require("mongoose");

const ClienteSchema = new mongoose.Schema({
  nombre: String,
  correo: String,
  ciudad: String,
  edad: Number
});

module.exports = mongoose.model("Cliente", ClienteSchema);
