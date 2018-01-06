const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const ProductsControllers = require('../controllers/products');

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

router.get('/', ProductsControllers.products_get_all);

router.post(
  '/',
  checkAuth,
  upload.single('productImage'),
  ProductsControllers.products_create
);

router.get('/:productId', ProductsControllers.products_get_product);

router.patch(
  '/:productId',
  checkAuth,
  ProductsControllers.products_update_product
);

router.delete(
  '/:productId',
  checkAuth,
  ProductsControllers.products_remove_product
);

module.exports = router;
