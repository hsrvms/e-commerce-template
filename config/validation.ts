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
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  PORT: Joi.number().default(8000),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
});
