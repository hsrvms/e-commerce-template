export const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV,
  app_port: parseInt(process.env.APP_PORT || '3001', 10),
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
});
