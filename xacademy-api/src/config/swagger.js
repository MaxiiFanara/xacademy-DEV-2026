import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { env } from './env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'XAcademy API',
      version: '1.0.0',
      description: 'API REST para gestión de jugadores FIFA - XAcademy 2026',
    },
    servers: [
      { url: `http://localhost:${env.PORT}`, description: 'Desarrollo' },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'access_token',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Mensaje de error' },
          },
        },
        LoginDto: {
          type: 'object',
          required: ['Email', 'Pwd'],
          properties: {
            Email: { type: 'string', format: 'email', example: 'usuario@mail.com' },
            Pwd:   { type: 'string', minLength: 8, example: 'MiPassword1!' },
          },
        },
        RegisterDto: {
          type: 'object',
          required: ['Nombre', 'Apellido', 'NombreUsuario', 'Email', 'Pwd'],
          properties: {
            Nombre:        { type: 'string', example: 'Juan' },
            Apellido:      { type: 'string', example: 'Pérez' },
            NombreUsuario: { type: 'string', example: 'juanp' },
            Email:         { type: 'string', format: 'email' },
            Pwd:           { type: 'string', minLength: 8 },
          },
        },
        UserResponse: {
          type: 'object',
          properties: {
            nombre:        { type: 'string' },
            apellido:      { type: 'string' },
            nombreUsuario: { type: 'string' },
            email:         { type: 'string' },
          },
        },
        Jugador: {
          type: 'object',
          properties: {
            IdVersionJugador:  { type: 'integer' },
            IdJugador:         { type: 'integer' },
            Nombre:            { type: 'string' },
            Apellido:          { type: 'string' },
            Juego:             { type: 'string', example: 'FIFA 23' },
            Calificacion:      { type: 'integer', example: 87 },
            Club:              { type: 'string' },
            Nacionalidad:      { type: 'string' },
            PosicionPrincipal: { type: 'string', example: 'ST' },
            EsHombre:          { type: 'boolean' },
          },
        },
        PaginatedJugadores: {
          type: 'object',
          properties: {
            total:       { type: 'integer' },
            totalPages:  { type: 'integer' },
            currentPage: { type: 'integer' },
            perPage:     { type: 'integer' },
            data:        { type: 'array', items: { '$ref': '#/components/schemas/Jugador' } },
          },
        },
        Club: {
          type: 'object',
          properties: {
            Id:     { type: 'integer' },
            Nombre: { type: 'string', example: 'FC Barcelona' },
            IdLiga: { type: 'integer' },
          },
        },
        Liga: {
          type: 'object',
          properties: {
            Id:             { type: 'integer' },
            Nombre:         { type: 'string', example: 'La Liga' },
            IdNacionalidad: { type: 'integer' },
          },
        },
        Nacionalidad: {
          type: 'object',
          properties: {
            Id:     { type: 'integer' },
            Nombre: { type: 'string', example: 'Argentina' },
          },
        },
        Posicion: {
          type: 'object',
          properties: {
            Id:     { type: 'integer' },
            Nombre: { type: 'string', example: 'ST' },
          },
        },
        Skill: {
          type: 'object',
          properties: {
            Id:        { type: 'integer' },
            Nombre:    { type: 'string', example: 'Velocidad' },
            EsArquero: { type: 'boolean' },
          },
        },
        Version: {
          type: 'object',
          properties: {
            Id:        { type: 'integer' },
            Nombre:    { type: 'string', example: 'FIFA 23' },
            AnioJuego: { type: 'integer', example: 2023 },
          },
        },
        AnalisisIA: {
          type: 'object',
          properties: {
            analisis: { type: 'string', example: 'A partir de 2019 se nota una mejora...' },
          },
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
export { swaggerUi };
