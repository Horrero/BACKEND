'use strict';

/**
 * order router
 */

// const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/promo-codes/check',
            handler: 'promo-code.check',
            config: {
              auth: false,
              policies: [],
              middlewares: [],
            }
        }
    ]
};
