"use strict";

// @ts-ignore
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const URL = process.env.FRONTEND_URL || "http://localhost:3000";

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async create(ctx) {
    // @ts-ignore
    const { cashOnDelivery, products, userName, email, phoneNumber, billingInformation, isSameAddress, shippingInformation, promoCode, dev } = ctx.request.body;
    let finalPromoCode = promoCode ? promoCode.toUpperCase() : null;

    if(dev) {
      // Dev Logic...
    }

    // Check if items are in stock
    for (const product of products) {
      const item = await strapi.service("api::item.item").findOne(product.id, { populate: 'sizes' });
      if (!item) {
        ctx.response.status = 400;
        return { error: { message: `Item with id ${product.id} not found` } };
      }

      const size = item.sizes.find(size => size.name === product.size);
      if (!size) {
        ctx.response.status = 400;
        return { error: { message: `Size ${product.size} not found for item with id ${product.id}` } };
      }
  
      if (size.soldOut) {
        ctx.response.status = 400;
        return { error: { message: `Size ${product.size} of item with id ${product.id} is sold out` } };
      }

      if (size.itemsCount < product.count) {
        ctx.response.status = 400;
        return { error: { message: `Not enough items in stock for size ${product.size} of item with id ${product.id}` } };
      }
    }

    // Validate promo code
    let validPromo = null;
    if(finalPromoCode) {
      validPromo = await strapi.db.query('api::promo-code.promo-code').findOne({ where: { code: finalPromoCode } });
      if(!validPromo) {
        finalPromoCode = null;
      }
    }

    // Logic for cash payment
    if (cashOnDelivery) {
      try {
        // Update item count and soldOut status
        for (const product of products) {
          const item = await strapi.service("api::item.item").findOne(product.id, { populate: 'sizes' });
          const size = item.sizes.find(size => size.name === product.size);
          const newCount = size.itemsCount - product.count;
          await strapi.service("api::item.item").update(product.id, {
            data: {
              sizes: item.sizes.map(s => s.name === product.size ? { ...s, itemsCount: newCount, soldOut: newCount <= 0 } : s)
            },
          });
        }
        await strapi.service('api::order.order').create({
          data: {
            cashOnDelivery: true,
            userName: userName,
            products: products,
            email: email,
            phoneNumber: phoneNumber,
            billingInformation: billingInformation,
            isSameAddress: isSameAddress,
            shippingInformation: shippingInformation,
            stripeSessionId: "Cash On Delivery",
            promoCode: finalPromoCode
          },
        });
        return { success: true };
      } catch (error) {
        console.error("Error during order creation:", error);
        ctx.response.status = 500;
        return { error: { message: "There was a problem creating the order." } };
      }
    }

    // Logic for card payment
    try {
      const lineItems = await Promise.all(
        products.map(async (product) => {
          const item = await strapi
            .service("api::item.item")
            .findOne(product.id);

          if (!item) {
            throw new Error(`Product with id ${product.id} not found`);
          }

          const price = item.discountPrice ? item.discountPrice : item.price;

          return {
            price_data: {
              currency: "eur",
              product_data: {
                name: `${item.name} (${product.size})`,
              },
              unit_amount: Math.floor(price * 100), // Stripe expects price in cents
            },
            quantity: product.count,
          };
        })
      );
    
      // Create a coupon in Stripe if a valid promo code is provided
      let couponId = null;
      if (finalPromoCode) {
        const coupon = await stripe.coupons.create({
          percent_off: validPromo.Discount,
          duration: 'once',
          name: finalPromoCode,
        });
        couponId = coupon.id;
      }
    
      // Create a stripe session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: email,
        mode: "payment",
        success_url: `${URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${URL}/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`,
        line_items: lineItems,
        discounts: couponId ? [{ coupon: couponId }] : [],
        metadata: {
          userName,
          products: JSON.stringify(products),
          email,
          phoneNumber,
          billingInformation: JSON.stringify(billingInformation),
          isSameAddress: JSON.stringify(isSameAddress),
          shippingInformation: JSON.stringify(shippingInformation),
          promoCode: finalPromoCode // Add promo code to metadata
        },
      });

      // Return the session id to the frontend (so payment can proceed)
      return { id: session.id };
    } catch (error) {
      console.error("Error during Stripe session creation:", error);
      ctx.response.status = 500;
      return { error: { message: "There was a problem creating the payment session." } };
    }
  }
}));
