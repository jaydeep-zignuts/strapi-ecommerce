"use strict";

const { Messages } = require("../../../constants");

/**
 * product controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::product.product", ({ strapi }) => ({
  async delete(ctx) {
    try {
      const id = ctx.params.id;
      //find product
      const findUpdate = await strapi.query("api::product.product").findOne({
        where: {
          id: id,
          isDeleted: false,
        },
      });
      if (!findUpdate) {
        return ctx.badRequest(Messages.productNot);
      }
      //delete product
      const deleted = await strapi.query("api::sproduct.product").update({
        where: {
          id: id,
        },
        data: {
          isDeleted: true,
        },
      });
      return ctx.send({ data: deleted });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
}));
