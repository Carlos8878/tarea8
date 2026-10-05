require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Cliente = require("./models/Cliente");
const Producto = require("./models/Producto");
const Pedido = require("./models/Pedido");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static("public"));

// Health para Render / monitoreo
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error(err));

// CLIENTES
app.get("/api/clientes", async (req, res) => {
  const data = await Cliente.find();
  res.json(data);
});
app.post("/api/clientes", async (req, res) => {
  const cliente = await Cliente.create(req.body);
  res.json(cliente);
});
app.put("/api/clientes/:id", async (req, res) => {
  const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(cliente);
});
app.delete("/api/clientes/:id", async (req, res) => {
  await Cliente.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// PRODUCTOS
app.get("/api/productos", async (req, res) => {
  const data = await Producto.find();
  res.json(data);
});
app.post("/api/productos", async (req, res) => {
  const producto = await Producto.create(req.body);
  res.json(producto);
});
app.put("/api/productos/:id", async (req, res) => {
  const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(producto);
});
app.delete("/api/productos/:id", async (req, res) => {
  await Producto.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// PEDIDOS
app.get("/api/pedidos", async (req, res) => {
  const data = await Pedido.find()
    .populate("idCliente", "nombre ciudad")
    .populate("productos.idProducto", "nombre precio");
  res.json(data);
});
app.post("/api/pedidos", async (req, res) => {
  const { idCliente, productos } = req.body;
  for (const item of productos) {
    const producto = await Producto.findById(item.idProducto);
    if (!producto) return res.json({ error: `Producto no encontrado` });
    if (producto.stock < item.cantidad)
      return res.json({
        error: `Stock insuficiente para: ${producto.nombre}. Stock actual: ${producto.stock}`,
      });
  }
  for (const item of productos) {
    await Producto.findByIdAndUpdate(item.idProducto, {
      $inc: { stock: -item.cantidad },
    });
  }
  const pedido = await Pedido.create({ idCliente, productos });
  res.json(pedido);
});
app.delete("/api/pedidos/:id", async (req, res) => {
  await Pedido.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// CONSULTAS
app.get("/api/clientes-frecuentes", async (req, res) => {
  const result = await Pedido.aggregate([
    { $group: { _id: "$idCliente", totalPedidos: { $sum: 1 } } },
    { $match: { totalPedidos: { $gte: 2 } } },
    {
      $lookup: {
        from: "clientes",
        localField: "_id",
        foreignField: "_id",
        as: "cliente",
      },
    },
    { $unwind: "$cliente" },
    { $project: { nombre: "$cliente.nombre", totalPedidos: 1 } },
  ]);
  res.json(result);
});
app.get("/api/stock-critico", async (req, res) => {
  const result = await Producto.find(
    { stock: { $lt: 5 } },
    { nombre: 1, stock: 1, _id: 0 },
  );
  res.json(result);
});
app.get("/api/pedidos-ciudad/:ciudad", async (req, res) => {
  const clientes = await Cliente.find({ ciudad: req.params.ciudad });
  const ids = clientes.map((c) => c._id);
  const pedidos = await Pedido.find({ idCliente: { $in: ids } }).populate(
    "idCliente",
    "nombre ciudad",
  );
  res.json(pedidos);
});
app.get("/api/ticket-promedio/:nombre", async (req, res) => {
  const cliente = await Cliente.findOne({ nombre: req.params.nombre });
  if (!cliente) return res.json({ error: "Cliente no encontrado" });
  const pedidos = await Pedido.find({ idCliente: cliente._id }).populate(
    "productos.idProducto",
  );
  let total = 0;
  for (const pedido of pedidos) {
    for (const item of pedido.productos) {
      total += item.idProducto.precio * item.cantidad;
    }
  }
  res.json({
    cliente: cliente.nombre,
    promedio: (total / pedidos.length).toFixed(2),
  });
});
app.put("/api/cambiar-ciudad", async (req, res) => {
  const result = await Cliente.updateMany(
    { ciudad: "Arequipa" },
    { $set: { ciudad: "Lima" } },
  );
  res.json({ modifiedCount: result.modifiedCount });
});

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
