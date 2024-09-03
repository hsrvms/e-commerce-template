export default () => ({
  NODE_ENV: process.env.NODE_ENV,
  app_port: parseInt(process.env.APP_PORT || '8001', 10),
});
