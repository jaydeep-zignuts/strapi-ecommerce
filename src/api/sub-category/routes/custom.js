const { Messages } = require("../../../constants");
const subCategory = require("./sub-category");

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/sub-categories",
      handler: "sub-category.create",
      config: {
        middlewares: [
          async (ctx, next) => {
            try {
              const { name, category } = ctx.request.body.data;
              if (!name || !category) {
                return ctx.badRequest(Messages.field);
              }
              const subcategory = await strapi
                .query("api::sub-category.sub-category")
                .findOne({
                  where: {
                    category: category,
                    isDeleted: false,
                    name: name,
                  },
                });
              if (subcategory) {
                return ctx.badRequest(Messages.subcategory);
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
      path: "/sub-categories",
      handler: "sub-category.find",
      config: {
        middlewares: [
          async (ctx, next) => {
            try {
              ctx.request.query = {
                ...(ctx.request.query = {
                  filters: {
                    isDeleted: false,
                  },
                  populate: {
                    products: true,
                  },
                }),
              };
              await next();
              console.log(ctx.response.body);
            } catch (error) {
              return ctx.badRequest(error.message);
            }
          },
        ],
      },
    },
    {
      method: "GET",
      path: "/sub-categories/:id",
      handler: "sub-category.findOne",
      config: {
        middlewares: [
          async (ctx, next) => {
            try {
              const id = ctx.params.id;
              if (!id) {
                return ctx.badRequest(Messages.field);
              }
              const subCategory = await strapi
                .query("api::sub-category.sub-category")
                .findOne({
                  where: {
                    id: id,
                    isDeleted: false,
                  },
                });
              if (!subCategory) {
                return ctx.badRequest(Messages.subcategoryNot);
              }
              ctx.request.query = {
                ...(ctx.request.query = {
                  filters: {
                    id: id,
                    isDeleted: false,
                  },
                  populate: {
                    products: true,
                  },
                }),
              };
              await next();
              console.log(ctx.response.body);
            } catch (error) {
              return ctx.badRequest(error.message);
            }
          },
        ],
      },
    },
    {
      method: "PUT",
      path: "/sub-categories/:id",
      handler: "sub-category.update",
      config: {
        middlewares: [
          async (ctx, next) => {
            try {
              const id = ctx.params.id;
              const { category, name } = ctx.request.body.data;
              if (!name || !category || !id) {
                return ctx.badRequest(Messages.field);
              }
              const subcategory = await strapi
                .query("api::sub-category.sub-category")
                .findOne({
                  where: {
                    id: id,
                    isDeleted: false,
                  },
                });
              if (!subcategory) {
                return ctx.badRequest(Messages.subcategoryNot);
              }
              const subName = await strapi
                .query("api::sub-category.sub-category")
                .findOne({
                  where: {
                    name: name,
                    isDeleted: false,
                  },
                });
              if (subName && subName.id != id) {
                console.log("d", subName.name, subName.id);
                return ctx.badRequest(Messages.subcategory);
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
      path: "/subdelete/:id",
      handler: "sub-category.delete",
    },
  ],
};
