"use strict";

const { Messages } = require("../../../constants");

/**
 * like controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::like.like", ({ strapi }) => ({
  async create(ctx, next) {
    try {
      const { isLiked, products } = ctx.request.body.data;
      if (!isLiked || !products) {
        ctx.badRequest(Messages.field);
      }
      //find user
      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({
          where: {
            isActive: true,
            id: ctx.state.user.id,
          },
        });
      if (!user) {
        return ctx.badRequest(Messages.user);
      }
      //find product
      const product = await strapi.query("api::product.product").findOne({
        where: {
          isDeleted: false,
          id: products,
        },
      });
      if (!product) {
        return ctx.badRequest(Messages.productNot);
      }
      //like product
      const like = await strapi.query("api::like.like").findOne({
        where: {
          isLiked: true,
          products: products,
          users_permissions_users: ctx.state.user.id,
        },
        populate: {
          products: true,
          users_permissions_users: true,
        },
      });
      if (like) {
        return ctx.badRequest(Messages.like);
      }
      const likeProduct = await strapi.query("api::like.like").create({
        data: {
          isLiked: true,
          products: products,
          users_permissions_users: ctx.state.user.id,
        },
        populate: {
          products: true,
          users_permissions_users: true,
        },
      });
      return ctx.send({ data: likeProduct });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
  async find(ctx) {
    try {
      //for geting all like products
      const like = await strapi.query("api::like.like").findMany({
        where: {
          isLiked: true,
          users_permissions_users: ctx.state.user.id,
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
      // get product by id
      const like = await strapi.query("api::product.product").findOne({
        where: {
          id: id,
          isDeleted: false,
          users_permissions_users: ctx.state.user.id,
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
      if (!id || !product) {
        return ctx.badRequest(Messages.field);
      }
      //find like product by like id
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
      //unlike product
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
