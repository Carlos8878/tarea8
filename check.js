require("dotenv").config();
const mongoose = require("mongoose");
const Producto = require("./models/Producto");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const productos = await Producto.find({}, { nombre: 1, _id: 0 });
  console.log(productos);
  await mongoose.disconnect();
}

main();