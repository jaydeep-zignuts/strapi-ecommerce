// @ts-nocheck
const { Messages, validation } = require("../../constants");
const bcrypt = require("bcryptjs");
module.exports = (plugin) => {
  for (let i = 0; i < plugin.routes["content-api"].routes.length; i++) {
    const route = plugin.routes["content-api"].routes[i];

    //for login api
    if (
      plugin.routes["content-api"].routes[i].path == "/auth/local" &&
      plugin.routes["content-api"].routes[i].method == "POST"
    ) {
      plugin.routes["content-api"].routes[i] = {
        ...route,
        config: {
          ...route.config,
          middlewares: [
            async (ctx, next) => {
              const { identifier, password } = ctx.request.body;
              if (!identifier || !password) {
                return ctx.badRequest(Messages.required);
              }
              // Check if the user exists.
              const user = await strapi
                .query("plugin::users-permissions.user")
                .findOne({
                  where: {
                    provider: "local",
                    $or: [
                      { email: identifier.toLowerCase() },
                      { username: identifier },
                    ],
                  },
                });
              if (!user) {
                return ctx.badRequest(Messages.emailPassword);
              }
              //check if user is active or not
              const users = await strapi
                .query("plugin::users-permissions.user")
                .findOne({
                  where: {
                    isActive: true,
                  },
                });
              if (!users) {
                return ctx.badRequest(Messages.enable);
              }
              console.log(user.password);
              //comparing the password
              const validPassword = await bcrypt.compare(
                password,
                user.password
              );

              if (!validPassword) {
                return ctx.badRequest(Messages.emailPassword);
              }
              //check if user is blocked or not
              if (user.blocked === true) {
                return ctx.badRequest(Messages.blocked);
              }
              await next();
              const userData = await strapi
                .query("plugin::users-permissions.user")
                .findOne({
                  where: {
                    id: ctx.response.body.user.id,
                  },
                  populate: { role: true },
                });
              //deleting some fields from the response for security reasons
              delete userData.password;
              delete userData.token;
              delete userData.resetPasswordToken;
              delete userData.confirmationToken;
              //getting token
              let token = ctx.response.body.jwt;
              //update token in db
              await strapi.query("plugin::users-permissions.user").update({
                where: { id: ctx.response.body.user.id },
                data: { token: token },
              });
              //delete token from response as it is showing previous token
              // delete ctx.response.body.user.token;
              //send response
              ctx.response.body.user = userData;
            },
          ],
        },
      };
    }
  }
  plugin.controllers.auth.logout = async (ctx) => {
    try {
      const user = await strapi
        .query("plugin::users-permissions.user")
        .update({ where: { id: ctx.state.user.id }, data: { token: "" } });
      console.log("first, user", user);
      return user;
    } catch (err) {
      ctx.throw(500, "Internal Server Error");
    }
  };
  plugin.routes["content-api"].routes.push({
    path: "/auth/logout",
    method: "GET",
    handler: "auth.logout",
  });
  return plugin;
};
