const { Messages } = require("../../../constants");
const subCategory = require("../../sub-category/controllers/sub-category");

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/addCategories",
      handler: "category.create",
      config: {
        middlewares: [
          async (ctx, next) => {
            try {
              const { name } = ctx.request.body.data;
              if (!name) {
                return ctx.badRequest(Messages.field);
              }
              //chaeckin category available or not
              const uniqueName = await strapi
                .query("api::category.category")
                .findOne({
                  where: {
                    name: name,
                    isDeleted: false,
                  },
                });
              if (uniqueName) {
                return ctx.badRequest(Messages.category);
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
      path: "/category",
      handler: "category.find",
      config: {
        middlewares: [
          async (ctx, next) => {
            try {
              ctx.request.query = {
                ...ctx.request.query,
                filters: {
                  isDeleted: false,
                },
                populate: {
                  sub_categories: {
                    populate: {
                      products: true,
                    },
                  },
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
      path: "/category/:id",
      handler: "category.findOne",
      config: {
        middlewares: [
          async (ctx, next) => {
            try {
              const id = ctx.params.id;
              if (!id) {
                return ctx.badRequest(Messages.field);
              }
              ctx.request.query = {
                ...ctx.request.query,
                filters: {
                  isDeleted: false,
                  id: id,
                },
                populate: {
                  sub_categories: {
                    populate: {
                      products: true,
                    },
                  },
                },
              };
              const category = await strapi
                .query("api::category.category")
                .findOne({
                  where: {
                    id: id,
                    isDeleted: false,
                  },
                });
              if (!category) {
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
      path: "/updateCategories/:id",
      handler: "category.update",
      config: {
        middlewares: [
          async (ctx, next) => {
            try {
              const id = ctx.params.id;
              const { name } = ctx.request.body.data;
              if (!name || !id) {
                return ctx.badRequest(Messages.field);
              }
              //checking category available or not
              const uniqueName = await strapi
                .query("api::category.category")
                .findOne({
                  where: {
                    id: id,
                    isDeleted: false,
                  },
                });
              if (!uniqueName) {
                return ctx.badRequest(Messages.categoryNot);
              }
              //checking category name and id for update category name
              const catName = await strapi
                .query("api::category.category")
                .findOne({
                  where: {
                    name: name,
                    isDeleted: false,
                  },
                });
              if (catName && catName.id != id) {
                return ctx.badRequest(Messages.category);
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
      path: "/delete/:id",
      handler: "category.delete",
    },
  ],
};
