const { Messages } = require("../../../constants");

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/products",
      handler: "product.create",
      config: {
        middlewares: [
          async (ctx, next) => {
            try {
              const { name, description, price, qty, sub_category, image } =
                ctx.request.body.data;
              console.log(name, description, price, qty, sub_category, image);

              if (
                !name ||
                !description ||
                !price ||
                !qty ||
                !sub_category ||
                !image
              ) {
                return ctx.badRequest(Messages.field);
              }
              //find product
              const product = await strapi
                .query("api::product.product")
                .findOne({
                  where: {
                    name: name,
                    isDeleted: false,
                  },
                });
              if (product) {
                return ctx.badRequest(Messages.product);
              }
              return next();
            } catch (error) {
              return ctx.badRequest(error.message);
            }
          },
        ],
      },
    },
    {
      method: "GET",
      path: "/products",
      handler: "product.find",
      config: {
        middlewares: [
          async (ctx, next) => {
            try {
              //find all products
              ctx.request.query = {
                ...ctx.request.query,
                filters: {
                  isDeleted: false,
                },
              };
              return next();
            } catch (error) {
              return ctx.badRequest(error.message);
            }
          },
        ],
      },
    },
    {
      method: "GET",
      path: "/products/:id",
      handler: "product.findOne",
      config: {
        middlewares: [
          async (ctx, next) => {
            try {
              const id = ctx.params.id;
              if (!id) {
                return ctx.badRequest(Messages.field);
              }
              //find product by id
              ctx.request.query = {
                ...ctx.request.query,
                filters: {
                  isDeleted: false,
                  id: id,
                },
              };
              const product = await strapi
                .query("api::product.product")
                .findOne({
                  where: {
                    id: id,
                    isDeleted: false,
                  },
                });
              if (!product) {
                return ctx.badRequest(Messages.categoryNot);
              }
              return next();
            } catch (error) {
              return ctx.badRequest(error.message);
            }
          },
        ],
      },
    },
    {
      method: "PUT",
      path: "/products/:id",
      handler: "product.update",
      config: {
        middlewares: [
          async (ctx, next) => {
            try {
              const id = ctx.params.id;
              const { name, description, price, qty, sub_category } =
                ctx.request.body.data;
              if (!name || !description || !price || !qty || !sub_category) {
                return ctx.badRequest(Messages.field);
              }
              //find product
              const product = await strapi
                .query("api::product.product")
                .findOne({
                  where: {
                    id: id,
                    isDeleted: false,
                  },
                });
              if (!product) {
                return ctx.badRequest(Messages.productNot);
              }
              //checking for product name
              const productName = await strapi
                .query("api::product.product")
                .findOne({
                  where: {
                    name: name,
                    isDeleted: false,
                  },
                });
              if (productName && productName.id != id) {
                return ctx.badRequest(Messages.product);
              }
              return next();
            } catch (error) {
              return ctx.badRequest(error.message);
            }
          },
        ],
      },
    },
    {
      method: "PUT",
      path: "/prodelete/:id",
      handler: "product.delete",
    },
  ],
};
