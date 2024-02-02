"use strict";

const { Messages } = require("../../../constants");

/**
 * like controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::like.like", ({ strapi }) => ({
  async find(ctx) {
    try {
      const like = await strapi.query("api::like.like").findMany({
        where: {
          isLiked: true,
        },
        populate: {
          products: true,
          users_permissions_users: true,
        },
      });
      if (like.length <= 0) {
        return ctx.badRequest(Messages.likeNot);
      }
      return ctx.send({ data: like });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
  async findOne(ctx) {
    try {
      const id = ctx.params.id;
      const like = await strapi.query("api::product.product").findOne({
        where: {
          id: id,
          isDeleted: false,
        },
        populate: {
          likes: {
            populate: {
              users_permissions_users: true,
            },
          },
        },
      });
      if (!like) {
        return ctx.badRequest(Messages.productNot);
      }
      if (like.likes.length <= 0) {
        return ctx.badRequest(Messages.likeNot);
      }
      return like;
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async update(ctx) {
    try {
      const id = ctx.params.id;
      const { product } = ctx.request.body.data;
      console.log(id, product);
      if (!id || !product) {
        return ctx.badRequest(Messages.field);
      }
      const like = await strapi.query("api::like.like").findOne({
        where: {
          id: id,
          products: product,
          users_permissions_users: ctx.state.user.id,
        },
        populate: {
          products: true,
          users_permissions_users: true,
        },
      });
      if (!like) {
        return ctx.badRequest(Messages.notLiked);
      }
      const updatedData = await strapi.query("api::like.like").update({
        where: {
          id: id,
          products: product,
          users_permissions_users: ctx.state.user.id,
        },
        data: {
          isLiked: false,
        },
        populate: {
          products: true,
          users_permissions_users: true,
        },
      });

      return ctx.send({ data: updatedData });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
}));
