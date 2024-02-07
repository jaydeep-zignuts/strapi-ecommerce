"use strict";

const { Messages } = require("../../../constants");

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async create(ctx) {
    try {
      const { products, qty } = ctx.request.body.data;
      if (!products || !qty) {
        return ctx.badRequest(Messages.field);
      }
      //check item in cart or not
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
      // if in cart then delete from cart
      if (cart) {
        const updatedCart = await strapi.query("api::cart.cart").update({
          where: {
            products: products,
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
        //checking for product available or not
        const product = await strapi.query("api::product.product").findOne({
          where: {
            id: products,
            isDeleted: false,
          },
        });
        if (!product) {
          return ctx.badRequest(Messages.productNot);
        }
        //checking for available qty
        if (product.qty < qty) {
          return ctx.badRequest(Messages.qty + product.qty);
        }
        //create order
        const order = await strapi.query("api::order.order").create({
          data: {
            qty: qty,
            products: products,
            users_permissions_users: ctx.state.user.id,
            price: product.price * qty,
          },
        });
        return ctx.send({ data: order });
      } else {
        //checking for product available or not
        const product = await strapi.query("api::product.product").findOne({
          where: {
            id: products,
            isDeleted: false,
          },
        });
        if (!product) {
          return ctx.badRequest(Messages.productNot);
        }
        //checking for available qty
        if (product.qty < qty) {
          return ctx.badRequest(Messages.qty + product.qty);
        }
        //create order
        const order = await strapi.query("api::order.order").create({
          data: {
            qty: qty,
            products: products,
            users_permissions_users: ctx.state.user.id,
            price: product.price * qty,
          },
        });
        return ctx.send({ data: order });
      }
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
  async find(ctx) {
    try {
      console.log("first");
      const orders = await strapi.query("api::order.order").findMany({
        where: {
          users_permissions_users: ctx.state.user.id,
        },
        populate: {
          users_permissions_users: true,
          products: true,
        },
      });
      return ctx.send({ data: orders });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
  async findOne(ctx) {
    try {
      const orders = await strapi.query("api::order.order").findOne({
        where: {
          id: ctx.params.id,
          users_permissions_users: ctx.state.user.id,
        },
        populate: {
          users_permissions_users: true,
          products: true,
        },
      });
      if (!orders) {
        return ctx.badRequest(Messages.order);
      }
      return ctx.send({ data: orders });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
}));
