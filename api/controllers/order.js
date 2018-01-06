const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/products');

exports.orders_get_all = (req, res, next) => {
  Order.find()
    .select('product quantity _id')
    .populate('product', 'name') // el método populate enlaza el contenido de la referencia que se creada. El segundo parámetro sirbe para especificar que campos de la referencia se quieren enlazar.
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map(doc => {
          return {
            _id: doc.id,
            product: doc.product,
            quantity: doc.quantity,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/orders/' + doc.id
            }
          };
        })
      });
    })
    .catch(err => {
      res.status(500).json(err);
    });
};

exports.orders_create = (req, res, next) => {
  Product.findById(req.body.productId)
    .then(product => {
      if (!product) {
        return res.status(404).json({
          message: 'Producto no encontrado'
        });
      }
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId
      });
      return order.save(); // A la hora de guardar datos no es necesario colocar el método exec(), ya que el método save() ya devuelve una promesa.
    })
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Order guardada',
        request: {
          type: 'GET',
          createdOrder: {
            _id: result._id,
            product: result.product,
            quantity: result.quantity
          },
          url: 'http://localhost:3000/orders/' + result.id
        }
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        err
      });
    });
};

exports.orders_get_order = (req, res, next) => {
  const id = req.params.orderId;

  Order.findById(id)
    .select('product quantity')
    .populate('product', 'name price')
    .exec()
    .then(order => {
      if (!order) {
        return res.status(404).json({
          message: 'Orden no encontrada!'
        });
      }
      res.status(200).json({
        order,
        request: 'GET',
        description:
          'Usa la ruta establecia en el campo "url" para obtener una lista con todas las ordenes',
        url: 'http://localhost:3000/orders'
      });
    })
    .catch(err => {
      res.status(500).json({
        err
      });
    });
};

exports.orders_remove_order = (req, res, next) => {
  const id = req.params.orderId;

  Order.remove({
    _id: id
  })
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Orden eliminada',
        request: {
          type: 'POST',
          url: 'http://localhost:3000/orders',
          body: {
            productId: 'ID',
            quantity: 'Number'
          }
        }
      });
    })
    .catch();
};
