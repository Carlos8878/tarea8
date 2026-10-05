require("dotenv").config();
const mongoose = require("mongoose");
const Cliente = require("./models/Cliente");
const Producto = require("./models/Producto");
const Pedido = require("./models/Pedido");

async function registrarPedido(idCliente, productosComprados) {
  try {
    for (const item of productosComprados) {
      const producto = await Producto.findById(item.idProducto);
      if (!producto) {
        console.log(`Producto no encontrado: ${item.idProducto}`);
        return;
      }
      if (producto.stock < item.cantidad) {
        console.log(`Stock insuficiente para: ${producto.nombre}. Stock actual: ${producto.stock}`);
        return;
      }
    }

    for (const item of productosComprados) {
      await Producto.findByIdAndUpdate(item.idProducto, {
        $inc: { stock: -item.cantidad }
      });
    }

    const pedido = await Pedido.create({ idCliente, productos: productosComprados });
    console.log("Pedido registrado:", pedido._id);

  } catch (error) {
    console.error("Error al registrar pedido:", error);
  }
}

async function cambiarCiudad() {
  const resultado = await Cliente.updateMany(
    { ciudad: "Arequipa" },
    { $set: { ciudad: "Lima" } }
  );
  console.log(`Clientes actualizados de Arequipa a Lima: ${resultado.modifiedCount}`);
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Conectado a MongoDB\n");

  console.log("=== REGISTRAR NUEVO PEDIDO ===");
  const cliente = await Cliente.findOne({ nombre: "Adrian" });
  const producto = await Producto.findOne({ nombre: "Audífonos" });
  await registrarPedido(cliente._id, [{ idProducto: producto._id, cantidad: 2 }]);

  console.log("\n=== PRUEBA STOCK INSUFICIENTE ===");
  const productoSinStock = await Producto.findOne({ nombre: "Teclado" });
  await registrarPedido(cliente._id, [{ idProducto: productoSinStock._id, cantidad: 10 }]);

  console.log("\n=== ACTUALIZACION MASIVA ===");
  await cambiarCiudad();

  await mongoose.disconnect();
}

main();