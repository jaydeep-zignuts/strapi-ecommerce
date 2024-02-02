"use strict";

const { Messages } = require("../../../constants");

/**
 * category controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::category.category",
  ({ strapi }) => ({
    async delete(ctx) {
      try {
        const id = ctx.params.id;
        const findUpdate = await strapi
          .query("api::category.category")
          .findOne({
            where: {
              id: id,
              isDeleted: false,
            },
          });
        if (!findUpdate) {
          return ctx.badRequest(Messages.categoryNot);
        }
        const deleted = await strapi.query("api::category.category").update({
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
  })
);
