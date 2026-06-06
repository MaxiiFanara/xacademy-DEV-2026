import 'dotenv/config';

export const env = {
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || 'development',

  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: process.env.DB_PORT || 3306,
    NAME: process.env.DB_NAME || '',
    USER: process.env.DB_USER || '',
    PASSWORD: process.env.DB_PASSWORD || '',
    DIALECT: process.env.DB_DIALECT || 'mysql',
  },

  COOKIE_SECRET: process.env.COOKIE_SECRET || 'un_secreto_largo_para_firmar_cookies',

  JWT: {
    SECRET: process.env.JWT_SECRET || 'default_jwt_secret',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  },

  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    CALLBACK_URL:
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:8080/api/v1/auth/google/callback',
  },

  GITHUB: {
    CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
    CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
    CALLBACK_URL:
      process.env.GITHUB_CALLBACK_URL ||
      'http://localhost:8080/api/v1/auth/github/callback',
  },

  MAIL: {
    HOST: process.env.MAIL_HOST || 'smtp.gmail.com',
    PORT: process.env.MAIL_PORT || 587,
    USER: process.env.MAIL_USER || '',
    PASSWORD: process.env.MAIL_PASSWORD || '',
  },

  OPENAI: {
    API_KEY: process.env.OPENAI_API_KEY || '',
  },
};
