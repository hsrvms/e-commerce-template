export default () => ({
  NODE_ENV: process.env.NODE_ENV,
  app_port: parseInt(process.env.APP_PORT || '8001', 10),

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },

  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    ttl: process.env.REDIS_TTL,
  },

  i18n: {
    fallbackLanguage: process.env.FALLBACK_LANGUAGE,
  },
});
