'use strict';

// @ts-ignore
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {
  async handleWebhook(ctx) {
    const sig = ctx.request.headers['stripe-signature'];

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.info("No stripe webhook secret");
      return { error: { message: "No webhook secret found" } };
    }

    let event;

    try {
      // Get the raw body from the request
      const rawBody = ctx.request.body[Symbol.for('unparsedBody')];

      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.info('Webhook signature verification failed.', err.message);
      ctx.response.status = 400;
      return { error: { message: 'Webhook signature verification failed.' } };
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;

        // Save the order in the database only after the payment is confirmed
        try {
          await strapi.service('api::order.order').create({
            data: {
              cashOnDelivery: false,
              userName: session.metadata.userName,
              products: JSON.parse(session.metadata.products),
              email: session.metadata.email,
              phoneNumber: session.metadata.phoneNumber,
              billingInformation: JSON.parse(session.metadata.billingInformation),
              isSameAddress: JSON.parse(session.metadata.isSameAddress),
              shippingInformation: JSON.parse(session.metadata.shippingInformation),
              stripeSessionId: session.id,
            },
          });

          // Update item count and soldOut status
          for (const product of JSON.parse(session.metadata.products)) {
            const item = await strapi.service("api::item.item").findOne(product.id);
            if (item) {
              const newCount = item.itemsCount - 1;
              await strapi.service("api::item.item").update(product.id, {
                data: {
                  itemsCount: newCount,
                  soldOut: newCount <= 0,
                },
              });
            }
          }
        } catch (error) {
          console.info('Error saving order to the database:', error);
        }

        break;
      default:
        console.info(`Unhandled event type ${event.type}`);
    }

    ctx.response.status = 200;
    return { received: true };
  }
};