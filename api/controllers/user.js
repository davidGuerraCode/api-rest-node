const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.user_signup = (req, res, next) => {
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
};

exports.user_login = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: 'Falló la autenticación!'
        });
      }
      // Comprobamos que la contraseña en BD es igual a la suministrada por el usuario al momento de ingresar.
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: 'Falló la autenticación!'
          });
        }
        if (result) {
          // Si las contraseñas son iguales, entonces creamos un token para permitir el acceso al usuario los rescursos.
          const token = jwt.sign(
            // Definimos los datos que queremos pasar dentro del token.
            {
              email: user[0].email,
              userId: user[0]._id
            },
            // contraseña que sólo sabe el servidor.
            process.env.JWT_KEY,
            // Definimos el resto de opciones.
            {
              expiresIn: '1h' // Tiempo de vida del token en el cliente, debe ser corto por seguridad.
            }
          );
          return res.status(200).json({
            message: 'Autenticación exitosa!',
            token
          });
        }
        res.status(401).json({
          message: 'Falló la autenticación!'
        });
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ err });
    });
};

exports.user_remove = (req, res, next) => {
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
};
