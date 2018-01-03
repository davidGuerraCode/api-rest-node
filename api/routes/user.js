const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/user');

router.post('/signup', (req, res, next) => {
  // Comprobamos que el email proporcionado no existe en base de datos.
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: 'El email que ingresaste ya existe en nuestra base de datos!'
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          // Con bcrypt encriptamos la contraseña para luego guardarla en la BD.
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash
            });
            user
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: 'Usuario creado satisfactoriamente!'
                });
              })
              .catch(err => {
                console.error(err);
                res.status(500).json({ err });
              });
          }
        });
      }
    });
});

router.delete('/:userId', (req, res, next) => {
  User.remove({ _id: req.params.userId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Usuario eliminado satisfactoriamente'
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ err });
    });
});

module.exports = router;
