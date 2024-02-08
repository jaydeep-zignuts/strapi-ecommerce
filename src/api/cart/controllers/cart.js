"use strict";

const { Messages } = require("../../../constants");

/**
 * cart controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::cart.cart", ({ strapi }) => ({
  async create(ctx) {
    try {
      const { products, qty } = ctx.request.body.data;
      if (!products || !qty) {
        return ctx.badRequest(Messages.field);
      }

      //find item in cart or not
      const cart = await strapi.query("api::cart.cart").findOne({
        where: {
          isCart: true,
          products: products,
          users_permissions_users: ctx.state.user.id,
        },
        populate: {
          products: true,
          users_permissions_users: true,
        },
      });
      if (cart) {
        return ctx.badRequest(Messages.cart);
      }
      //find product
      const product = await strapi.query("api::product.product").findOne({
        where: {
          id: products,
          isDeleted: false,
        },
      });
      if (!product) {
        return ctx.badRequest(Messages.productNot);
      }
      //checking for qty
      if (product.qty < qty) {
        return ctx.badRequest(Messages.qty + product.qty);
      }
      const addToCart = await strapi.query("api::cart.cart").create({
        data: {
          qty: qty,
          products: products,
          users_permissions_users: ctx.state.user.id,
          isCart: true,
        },
        populate: {
          products: true,
          users_permissions_users: true,
        },
      });
      return ctx.send({ data: addToCart });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
  async find(ctx) {
    try {
      //find  cart
      const cart = await strapi.query("api::cart.cart").findMany({
        where: {
          isCart: true,
          users_permissions_users: ctx.state.user.id,
        },
        populate: {
          products: true,
          users_permissions_users: true,
        },
      });
      console.log(ctx.state.user.id);
      console.log(cart);
      return ctx.send({ data: cart });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
  async findOne(ctx) {
    try {
      console.log(ctx.params.id);
      if (!ctx.params.id) {
        return ctx.badRequest(Messages.field);
      }
      //find cart by id
      const cart = await strapi.query("api::cart.cart").findOne({
        where: {
          id: ctx.params.id,
          isCart: true,
          users_permissions_users: ctx.state.user.id,
        },
        populate: {
          products: true,
          users_permissions_users: true,
        },
      });
      console.log("first");
      console.log(cart);
      if (!cart) {
        return ctx.badRequest(Messages.rmCart);
      }

      return ctx.send({ data: cart });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
  async update(ctx) {
    try {
      const { qty, products } = ctx.request.body.data;
      if (!ctx.params.id) {
        return ctx.badRequest(Messages.field);
      }
      //find cart
      const cart = await strapi.query("api::cart.cart").findOne({
        where: {
          id: ctx.params.id,
          isCart: true,
          users_permissions_users: ctx.state.user.id,
        },
        populate: {
          products: true,
          users_permissions_users: true,
        },
      });
      if (!cart) {
        return ctx.badRequest(Messages.rmCart);
      }

      const product = await strapi.query("api::product.product").findOne({
        where: {
          id: products,
        },
      });
      //checking qty
      if (product.qty < qty) {
        return ctx.badRequest(Messages.qty + product.qty);
      }
      //update cart
      const updatedCart = await strapi.query("api::cart.cart").update({
        where: {
          id: ctx.params.id,
          isCart: true,
          users_permissions_users: ctx.state.user.id,
        },
        data: {
          qty: qty,
        },
        populate: {
          products: true,
          users_permissions_users: true,
        },
      });
      return ctx.send({ data: updatedCart });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
  async delete(ctx) {
    try {
      const id = ctx.params.id;
      //find cart
      const cart = await strapi.query("api::cart.cart").findOne({
        where: {
          id: ctx.params.id,
          isCart: true,
          users_permissions_users: ctx.state.user.id,
        },
        populate: {
          products: true,
          users_permissions_users: true,
        },
      });
      if (!cart) {
        return ctx.badRequest(Messages.rmCart);
      }
      //delete cart
      const deletedCart = await strapi.query("api::cart.cart").update({
        where: {
          id: ctx.params.id,
          isCart: true,
          users_permissions_users: ctx.state.user.id,
        },
        data: {
          isCart: false,
        },
        populate: {
          products: true,
          users_permissions_users: true,
        },
      });
      return ctx.send({ data: deletedCart });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
}));
