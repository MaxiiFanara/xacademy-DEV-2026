import { body, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error:  'Error de validación',
      fields: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

export const validateCreateJugador = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 100 }).withMessage('El nombre no puede superar los 100 caracteres'),

  body('apellido')
    .trim()
    .notEmpty().withMessage('El apellido es requerido')
    .isLength({ max: 100 }).withMessage('El apellido no puede superar los 100 caracteres'),

  body('fechaNacimiento')
    .optional()
    .isDate().withMessage('La fecha de nacimiento debe tener formato YYYY-MM-DD'),

  body('esHombre')
    .notEmpty().withMessage('El género es requerido')
    .isBoolean().withMessage('El género debe ser true o false'),

  body('idNacionalidad')
    .notEmpty().withMessage('La nacionalidad es requerida')
    .isInt({ min: 1 }).withMessage('La nacionalidad debe ser un número válido'),

  body('idVersion')
    .notEmpty().withMessage('La versión es requerida')
    .isInt({ min: 1 }).withMessage('La versión debe ser un número válido'),

  body('idClub')
    .notEmpty().withMessage('El club es requerido')
    .isInt({ min: 1 }).withMessage('El club debe ser un número válido'),

  body('calificacion')
    .notEmpty().withMessage('La calificación es requerida')
    .isInt({ min: 0, max: 99 }).withMessage('La calificación debe estar entre 0 y 99'),

  body('posiciones')
    .isArray({ min: 1 }).withMessage('Debe haber al menos una posición'),

  body('posiciones.*.idPosicion')
    .isInt({ min: 1 }).withMessage('Cada posición debe tener un id válido'),

  body('posiciones.*.esPrincipal')
    .isBoolean().withMessage('esPrincipal debe ser true o false'),

  body('skills')
    .isArray({ min: 1 }).withMessage('Debe haber al menos una skill'),

  body('skills.*.idSkill')
    .isInt({ min: 1 }).withMessage('Cada skill debe tener un id válido'),

  body('skills.*.valor')
    .isInt({ min: 0, max: 99 }).withMessage('El valor de cada skill debe estar entre 0 y 99'),

  handleValidationErrors,
];

export const validateUpdateJugador = [
  body('idJugador')
    .notEmpty().withMessage('El id del jugador es requerido')
    .isInt({ min: 1 }).withMessage('El id del jugador debe ser un número válido'),

  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 100 }).withMessage('El nombre no puede superar los 100 caracteres'),

  body('apellido')
    .trim()
    .notEmpty().withMessage('El apellido es requerido')
    .isLength({ max: 100 }).withMessage('El apellido no puede superar los 100 caracteres'),

  body('idNacionalidad')
    .notEmpty().withMessage('La nacionalidad es requerida')
    .isInt({ min: 1 }).withMessage('La nacionalidad debe ser un número válido'),

  body('idClub')
    .notEmpty().withMessage('El club es requerido')
    .isInt({ min: 1 }).withMessage('El club debe ser un número válido'),

  body('calificacion')
    .notEmpty().withMessage('La calificación es requerida')
    .isInt({ min: 0, max: 99 }).withMessage('La calificación debe estar entre 0 y 99'),

  body('posiciones')
    .isArray({ min: 1 }).withMessage('Debe haber al menos una posición'),

  body('posiciones.*.idPosicion')
    .isInt({ min: 1 }).withMessage('Cada posición debe tener un id válido'),

  body('posiciones.*.esPrincipal')
    .isBoolean().withMessage('esPrincipal debe ser true o false'),

  body('skills')
    .isArray({ min: 1 }).withMessage('Debe haber al menos una skill'),

  body('skills.*.idSkill')
    .isInt({ min: 1 }).withMessage('Cada skill debe tener un id válido'),

  body('skills.*.valor')
    .isInt({ min: 0, max: 99 }).withMessage('El valor de cada skill debe estar entre 0 y 99'),

  handleValidationErrors,
];