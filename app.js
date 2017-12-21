const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParse = require("body-parser");
const mongoose = require("mongoose");

const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");

mongoose.connect("mongodb://localhost/academind-rest-api", {
  useMongoClient: true
});
mongoose.Promise = global.Promise; // Indicamos que queremos usar las promisas por defecto con NodeJs y no las de mongoose

app.use(morgan("dev"));
app.use('/uploads', express.static('uploads')) // el método 'static' de express convierte la carpeta especificada en una carpeta pública, accecible para todos. Le pasamos como primer parámetro al middlerware la ruta de la carpeta para que enlazar sólo las solicitudes que inicien con esa ruta.
app.use(bodyParse.urlencoded({
  extended: false
}));
app.use(bodyParse.json());

// Menejo de Errores de CORS (Cross-Origin Resource Sharing), es un concepto de seguridad que tienen todos los navegadores, que restringe el acceso a los recursos a solicitudes que provengan de otro servidor o de un puerto que no sea el mismo desde el cual se hace la petición. Sin embargo para Api's restful o SPA's esta restricción se debe deshabilitar ya que cada petición puede hacerse desde origenes diferentes. Para lograr esto debemos alterar los headers de las respuestas.
app.use((req, res, next) => {
  res.header("Acccess-Control-Allow-Origin", "*"); // Ajustamos los headers de la respuesta. '*' permite el acceso a todos.
  res.header(
    "Acccess-Control-Allow-Headers", // Definimos que clase de headers queremos aceptar
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header(
      "Acccess-Control-Allow-Methods",
      "PUT, POST, PATCH, DELETE, GET"
    );
    return res.status(200).json({});
  }
  next();
});

app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

// Manejo de errores
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;