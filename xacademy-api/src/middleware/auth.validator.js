import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error:  'Error de validación',
      fields: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

export const validateRegister = [
  body('Nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 100 }).withMessage('El nombre no puede superar los 100 caracteres'),

  body('Apellido')
    .trim()
    .notEmpty().withMessage('El apellido es requerido')
    .isLength({ max: 100 }).withMessage('El apellido no puede superar los 100 caracteres'),

  body('NombreUsuario')
    .trim()
    .notEmpty().withMessage('El nombre de usuario es requerido')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9._]+$/).withMessage('El nombre de usuario solo puede contener letras, números, puntos y guiones bajos'),

  body('Email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('El formato del email no es válido')
    .isLength({ max: 150 }).withMessage('El email no puede superar los 150 caracteres'),

  body('Pwd')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),

  handleValidationErrors,
];

export const validateLogin = [
  body('Email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('El formato del email no es válido'),

  body('Pwd')
    .notEmpty().withMessage('La contraseña es requerida'),

  handleValidationErrors,
];