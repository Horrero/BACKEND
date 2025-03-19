'use strict';

/**
 * promo-code controller
 */

"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::promo-code.promo-code", ({ strapi }) => ({
    async check(ctx) {
        let { code } = ctx.query;
        code = (typeof code === 'string') ? code.toUpperCase() : null;

        if (!code) {
            return ctx.badRequest('Code query parameter is required');
        }

        const promoCode = await strapi.db.query('api::promo-code.promo-code').findOne({ where: { code } });
        if (!promoCode) {
            return ctx.notFound('Promo code not found');
        }

        ctx.send({ valid: true, promoCode });
    }
}));