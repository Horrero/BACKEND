module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/checkout/webhook',
      handler: 'checkout.handleWebhook',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};