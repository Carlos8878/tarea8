require("dotenv").config();
const mongoose = require("mongoose");
const Cliente = require("./models/Cliente");
const Producto = require("./models/Producto");
const Pedido = require("./models/Pedido");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Conectado a MongoDB\n");

  // 1. Clientes frecuentes (al menos 2 pedidos)
  console.log("=== CLIENTES FRECUENTES ===");
  const frecuentes = await Pedido.aggregate([
    { $group: { _id: "$idCliente", totalPedidos: { $sum: 1 } } },
    { $match: { totalPedidos: { $gte: 2 } } },
    { $lookup: { from: "clientes", localField: "_id", foreignField: "_id", as: "cliente" } },
    { $unwind: "$cliente" },
    { $project: { nombre: "$cliente.nombre", totalPedidos: 1 } }
  ]);
  console.log(frecuentes);

  // 2. Stock crítico (stock menor a 5)
  console.log("\n=== STOCK CRÍTICO ===");
  const stockCritico = await Producto.find(
    { stock: { $lt: 5 } },
    { nombre: 1, stock: 1, _id: 0 }
  );
  console.log(stockCritico);

  // 3. Pedidos por ciudad (Arequipa)
  console.log("\n=== PEDIDOS POR CIUDAD: Arequipa ===");
  const clientesArequipa = await Cliente.find({ ciudad: "Arequipa" });
  const idsArequipa = clientesArequipa.map(c => c._id);
  const pedidosCiudad = await Pedido.find({ idCliente: { $in: idsArequipa } })
    .populate("idCliente", "nombre ciudad");
  console.log(pedidosCiudad);

  // 4. Ticket promedio del primer cliente
  console.log("\n=== TICKET PROMEDIO ===");
  const primerCliente = await Cliente.findOne({ nombre: "Carlos Morán" });
  const pedidosCliente = await Pedido.find({ idCliente: primerCliente._id })
    .populate("productos.idProducto");
  
  let totalGasto = 0;
  let totalPedidos = pedidosCliente.length;

  for (const pedido of pedidosCliente) {
    for (const item of pedido.productos) {
      totalGasto += item.idProducto.precio * item.cantidad;
    }
  }

  const promedio = totalGasto / totalPedidos;
  console.log(`Cliente: ${primerCliente.nombre}`);
  console.log(`Gasto promedio por pedido: $${promedio.toFixed(2)}`);

  await mongoose.disconnect();
}

main();