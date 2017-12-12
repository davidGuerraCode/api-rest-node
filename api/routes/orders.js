const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.status(200).json({
    message: "Lista de ordenes."
  });
});

router.post("/", (req, res, next) => {
  const order = {
    productId: req.body.productId,
    quantity: req.body.quantity
  };
  res.status(201).json({
    message: "Orden creada.",
    order
  });
});

router.get("/:orderId", (req, res, next) => {
  const id = req.params.orderId;

  res.status(200).json({
    message: `Detalles de la orden ${id}`
  });
});

router.delete("/:orderId", (req, res, next) => {
  const id = req.params.orderId;
  res.status(200).json({
    message: `Orden ${id} eliminada.`
  });
});

module.exports = router;
