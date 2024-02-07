"use strict";

const { Messages } = require("../../../constants");

/**
 * sub-category controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::sub-category.sub-category",
  ({ strapi }) => ({
    async delete(ctx) {
      try {
        const id = ctx.params.id;
        //find sub category
        const findUpdate = await strapi
          .query("api::sub-category.sub-category")
          .findOne({
            where: {
              id: id,
              isDeleted: false,
            },
          });
        if (!findUpdate) {
          return ctx.badRequest(Messages.subcategoryNot);
        }
        //delete sub category
        const deleted = await strapi
          .query("api::sub-category.sub-category")
          .update({
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
