require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log("Conectado a MongoDB");
    return client.db();
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
  }
}

module.exports = { connectDB, client };
