const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Product = require("../models/products");

router.get("/", (req, res, next) => {
  Product.find({})
    .exec() // Obtenemos una promesa.
    .then(docs => {
      console.log("Respuesta desde la BD: " + docs);
      // if (docs.length >= 0) {
      res.status(200).json(docs);
      // } else {
      //   res.status(404).json({ message: "La BD está vacía." });
      // }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ err });
    });
});

router.post("/", (req, res, next) => {
  const product = new Product({
    // Instanciamos el Schema que queremos usar
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price
  });
  product
    .save() // 'save' es un método que provee mongoose para guardar los datos en la BD.
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Manejando solicitudes POST a /products",
        result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ err });
    });
});

router.get("/:productId", (req, res, next) => {
  const id = req.params.productId;

  Product.findById(id)
    .exec()
    .then(doc => {
      console.log("Desde la BD " + doc);
      if (doc) {
        res.status(200).json({ doc });
      } else {
        res.status(404).json({
          message: "Datos no encontrados para el ID proporcionado :("
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ err });
    });
});

router.patch("/:productId", (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};

  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Product.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch(err => {
      throw new Error("err");
      res.status(500).json({ err });
    });
});

router.delete("/:productId", (req, res, next) => {
  const id = req.params.productId;

  Product.remove({ _id: id })
    .exec()
    .then(result => {
      console.log("Datos elimindos de la BD: " + result);
      res.status(200).json(result);
    })
    .catch(err => {
      throw new Error(err);
      res.status(500).json({ err });
    });
});

module.exports = router;
