const { Messages } = require("../../../constants");

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/likes",
      handler: "like.create",
      config: {
        middlewares: [
          async (ctx, next) => {
            const { isLiked, products } = ctx.request.body.data;
            if (!isLiked || !products) {
              ctx.badRequest(Messages.field);
            }
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
            const product = await strapi.query("api::product.product").findOne({
              where: {
                isDeleted: false,
                id: products,
              },
            });
            if (!product) {
              return ctx.badRequest(Messages.productNot);
            }
            const like = await strapi.query("api::like.like").findOne({
              where: {
                isLiked: true,
                products: products,
                users_permissions_users: ctx.state.user.id,
              },
            });
            if (like) {
              return ctx.badRequest(Messages.like);
            }
            await next();
            console.log(ctx.response.body);
          },
        ],
      },
    },
    {
      method: "GET",
      path: "/likes",
      handler: "like.find",
      config: {},
    },
    {
      method: "GET",
      //product id
      path: "/likes/:id",
      handler: "like.findOne",
      config: {},
    },
    {
      method: "PUT",
      path: "/likes/:id",
      handler: "like.update",
      config: {},
    },
  ],
};
