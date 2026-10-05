const mongoose = require("mongoose");

const PedidoSchema = new mongoose.Schema({
  fecha: { type: Date, default: Date.now },
  idCliente: { type: mongoose.Schema.Types.ObjectId, ref: "Cliente" },
  productos: [
    {
      idProducto: { type: mongoose.Schema.Types.ObjectId, ref: "Producto" },
      cantidad: Number
    }
  ]
});

module.exports = mongoose.model("Pedido", PedidoSchema);