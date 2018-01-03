const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + ' - ' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  /* // Para rechazar un archivo:
  cb(null, false) // ignorará el archivo que no esté almacenado.
  // Para aceptar un archivo:
  cb(null, true) */
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true); // Recibe la imagen si se cumple la condición.
  } else {
    cb(null, false); // Rechaza todos los otros tipos de archivo
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // Especificamos límite del tamaño de la imagen que se va a almacenar.
  },
  fileFilter: fileFilter
});

const Product = require('../models/products');

router.get('/', (req, res, next) => {
  Product.find({})
    .select('name price _id productImage') // Permite seleccionar que campos del documento se quieren consultar
    .exec() // Ejecuta la consulta y devuelve una promesa.
    .then(docs => {
      const response = {
        count: docs.length,
        products: docs.map(doc => {
          // Estructura que debe tener la respuesta.
          return {
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
            _id: doc._id,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/products/' + doc._id
            }
          };
        })
      };
      // if (docs.length >= 0) {
      res.status(200).json(response);
      // } else {
      //   res.status(404).json({ message: "La BD está vacía." });
      // }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        err
      });
    });
});

router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
  console.log(req.file);
  const product = new Product({
    // Instanciamos el Schema que queremos usar
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  });
  product
    .save() // 'save' es un método que provee mongoose para guardar los datos en la BD.
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'Producto creado satisfactoriamente',
        productoCreado: {
          name: result.name,
          price: result.price,
          _id: result._id,
          request: {
            type: 'GET',
            url: 'http://localhost:3000/products/' + result._id
          }
        }
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        err
      });
    });
});

router.get('/:productId', (req, res, next) => {
  const id = req.params.productId;

  Product.findById(id)
    .select('name price _id productImage')
    .exec()
    .then(doc => {
      const response = {
        product: doc,
        request: {
          type: 'GET',
          desciption:
            "Usa la ruta establecia en el campo 'url' para obtener una lista de todos los productos",
          url: 'http://localhost:3000/products'
        }
      };
      console.log('Desde la BD ' + response);
      if (doc) {
        res.status(200).json({
          response
        });
      } else {
        res.status(404).json({
          message: 'Datos no encontrados para el ID proporcionado :('
        });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        err
      });
    });
});

router.patch('/:productId', checkAuth, (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};

  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Product.update(
    {
      _id: id
    },
    {
      $set: updateOps
    }
  )
    .exec()
    .then(result => {
      const responde = {
        message: 'Producto actualizado!',
        request: {
          type: 'GET',
          url: 'http://localhost:3000/products/' + id
        }
      };
      res.status(200).json(responde);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        err
      });
    });
});

router.delete('/:productId', checkAuth, (req, res, next) => {
  const id = req.params.productId;

  Product.remove({
    _id: id
  })
    .exec()
    .then(result => {
      const response = {
        message: 'Producto eliminado!',
        request: {
          type: 'POST',
          url: 'http://localhost:3000/products',
          body: {
            name: 'String',
            price: 'Number'
          }
        }
      };
      res.status(200).json(response);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        err
      });
    });
});

module.exports = router;
