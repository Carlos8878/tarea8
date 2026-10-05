require("dotenv").config();
const mongoose = require("mongoose");
const Cliente = require("./models/Cliente");
const Producto = require("./models/Producto");
const Pedido = require("./models/Pedido");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Conectado a MongoDB");

  // Limpiar datos anteriores
  await Cliente.deleteMany();
  await Producto.deleteMany();
  await Pedido.deleteMany();

  // Insertar clientes
  const clientes = await Cliente.insertMany([
    { nombre: "Carlos Morán", correo: "carlos@gmail.com", ciudad: "Arequipa", edad: 20 },
    { nombre: "Sergio Ponce", correo: "sergi@gmail.com", ciudad: "Arequipa", edad: 25 },
    { nombre: "Nicolas", correo: "nicop@gmail.com", ciudad: "Lima", edad: 30 },
    { nombre: "Marco", correo: "marco@gmail.com", ciudad: "Cusco", edad: 22 },
    { nombre: "Adrian", correo: "adriano@gmail.com", ciudad: "Arequipa", edad: 28 }
  ]);
  console.log("Clientes insertados:", clientes.length);

  // Insertar productos
  const productos = await Producto.insertMany([
    { nombre: "Laptop", precio: 1200, stock: 10 },
    { nombre: "Mouse", precio: 50, stock: 3 },
    { nombre: "Teclado", precio: 80, stock: 2 },
    { nombre: "Monitor", precio: 400, stock: 8 },
    { nombre: "Audífonos", precio: 60, stock: 15 }
  ]);
  console.log("Productos insertados:", productos.length);

  // Insertar pedidos
  const pedidos = await Pedido.insertMany([
    {
      idCliente: clientes[0]._id, // Carlos - Arequipa
      productos: [
        { idProducto: productos[0]._id, cantidad: 1 },
        { idProducto: productos[1]._id, cantidad: 2 }
      ]
    },
    {
      idCliente: clientes[0]._id, // Carlos - Arequipa
      productos: [
        { idProducto: productos[3]._id, cantidad: 1 }
      ]
    },
    {
      idCliente: clientes[1]._id, // Sergio - Arequipa
      productos: [
        { idProducto: productos[2]._id, cantidad: 1 },
        { idProducto: productos[4]._id, cantidad: 3 }
      ]
    },
    {
      idCliente: clientes[2]._id, // Nicolas - Lima
      productos: [
        { idProducto: productos[0]._id, cantidad: 1 },
        { idProducto: productos[3]._id, cantidad: 2 }
      ]
    },
    {
      idCliente: clientes[3]._id, // Marco - Cusco
      productos: [
        { idProducto: productos[4]._id, cantidad: 1 }
      ]
    }
  ]);
  console.log("Pedidos insertados:", pedidos.length);

  await mongoose.disconnect();
  console.log("Datos de prueba insertados correctamente");
}

seed();