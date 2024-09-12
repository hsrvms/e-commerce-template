import * as Joi from 'joi';

enum Environment {
  DEV = 'development',
  PROD = 'production',
  TEST = 'test',
  PROV = 'provision',
}

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid(
    Environment.DEV,
    Environment.PROD,
    Environment.TEST,
    Environment.PROV,
  ),
  APP_PORT: Joi.number().default(8000),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),

  FALLBACK_LANGUAGE: Joi.string().default('en'),

  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().required(),
  POSTGRES_DB: Joi.string().required(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
});
