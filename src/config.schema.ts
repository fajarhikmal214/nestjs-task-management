import * as Joi from '@hapi/joi';

export const configValidationSchema = Joi.object({
  APP_NAME: Joi.string().required(),
  PORT: Joi.string().required(),
  NODE_ENV: Joi.string().required().valid('development', 'production'),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432).required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  ACCESS_TOKEN_SECRET: Joi.string().required(),
  SENTRY_DSN: Joi.string().required(),
});
