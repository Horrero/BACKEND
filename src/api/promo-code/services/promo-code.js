'use strict';

/**
 * promo-code service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::promo-code.promo-code');