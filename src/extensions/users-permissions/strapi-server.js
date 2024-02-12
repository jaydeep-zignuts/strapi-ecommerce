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
    if (
      plugin.routes["content-api"].routes[i].path == "/auth/change-password" &&
      plugin.routes["content-api"].routes[i].method == "POST"
    ) {
      plugin.routes["content-api"].routes[i] = {
        ...route,
        config: {
          ...route.config,
          middlewares: [
            async (ctx, next) => {
              try {
                if (!ctx.request.body) {
                  return ctx.badRequest(Messages.password);
                }
                const { currentPassword, password } = ctx.request.body;
                if (!currentPassword || !password) {
                  return ctx.badRequest(Messages.password);
                }
                //if token is not valid
                if (!ctx.state.user) {
                  return ctx.badRequest(
                    "You must be authenticated to reset your password"
                  );
                }
                //finding user from token
                const user = await strapi.entityService.findOne(
                  "plugin::users-permissions.user",
                  ctx.state.user.id
                );
                //comparing password -- current password and confirm password
                const validPassword = await strapi
                  .plugin("users-permissions")
                  .service("user")
                  .validatePassword(currentPassword, user.password);
                if (!validPassword) {
                  return ctx.badRequest(Messages.passwordConfirm);
                }
                //comparing old password and new password
                if (currentPassword === password) {
                  return ctx.badRequest(
                    "Your new password must be different than your current password"
                  );
                }
                // if (!user.passwordHistory) {
                //   user.passwordHistory = [];
                // }
                // // Check if the new password is in the password history
                // const isPasswordInHistory = user.passwordHistory.some(
                //   (newpassword) => {
                //     return password === newpassword;
                //   }
                // );

                // if (isPasswordInHistory) {
                //   return ctx.badRequest(Messages.passValid);
                // }
                //validation for password
                if (!password.match(validation.regex)) {
                  return ctx.badRequest(Messages.newPassword);
                }
                // Password length validation
                if (password.length < 8 || password.length > 16) {
                  return ctx.badRequest(Messages.passwordValid);
                }
                // (user.passwordHistory = [
                //   password,
                //   ...user.passwordHistory,
                // ].slice(0, 4)),
                // await strapi.query("plugin::users-permissions.user").update({
                //   where: { id: user.id },
                //   data: {
                //     passwordHistory: user.passwordHistory,
                //   },
                // });
                return next();
              } catch (error) {
                return ctx.badRequest(error.message);
              }
            },
          ],
        },
      };
    }
    //for forgot password
    if (
      plugin.routes["content-api"].routes[i].path == "/auth/forgot-password" &&
      plugin.routes["content-api"].routes[i].method == "POST"
    ) {
      plugin.routes["content-api"].routes[i] = {
        ...route,
        config: {
          ...route.config,
          middlewares: [
            async (ctx, next) => {
              try {
                const { email } = ctx.request.body;
                if (!email) {
                  return ctx.badRequest(Messages.email);
                }
                //finding email in db
                const user = await strapi
                  .query("plugin::users-permissions.user")
                  .findOne({
                    where: {
                      email: email.toLowerCase(),
                    },
                  });
                if (!user) {
                  return ctx.badRequest(Messages.emailValid);
                }
                return next();
              } catch (error) {
                return ctx.badRequest(error.message);
              }
            },
          ],
        },
      };
    }
    // for reset password
    if (
      plugin.routes["content-api"].routes[i].path == "/auth/reset-password" &&
      plugin.routes["content-api"].routes[i].method == "POST"
    ) {
      plugin.routes["content-api"].routes[i] = {
        ...route,
        config: {
          ...route.config,
          middlewares: [
            async (ctx, next) => {
              try {
                const { password, passwordConfirmation, code } =
                  ctx.request.body;
                // Password length validation
                if (password.length < 8 || password.length > 16) {
                  return ctx.badRequest(Messages.passwordValid);
                }
                //validation for password
                if (!password.match(validation.regex)) {
                  return ctx.badRequest(Messages.newPassword);
                }
                if (!code) {
                  return ctx.badRequest(Messages.code);
                }
                // finding user for given code in db for checking if code is valid or not
                const user = await strapi
                  .query("plugin::users-permissions.user")
                  .findOne({ where: { resetPasswordToken: code } });

                if (!user) {
                  return ctx.badRequest(Messages.codeValid);
                }
                return next();
              } catch (error) {
                return ctx.badRequest(error.message);
              }
            },
          ],
        },
      };
    }
    // for registration of new user
    if (
      plugin.routes["content-api"].routes[i].path == "/users" &&
      plugin.routes["content-api"].routes[i].method == "POST"
    ) {
      plugin.routes["content-api"].routes[i] = {
        ...route,
        config: {
          ...route.config,
          middlewares: [
            async (ctx, next) => {
              const {
                username,
                email,
                password,
                contactNo,
                role,
                country,
                language,
                address,
                provider = "local",
              } = ctx.request.body;
              if (!email || !password) {
                return ctx.badRequest(Messages.required);
              }
              if (!username) {
                return ctx.badRequest(Messages.username);
              }
              if (username.length > 255) {
                return ctx.badRequest(Messages.character + " Name field");
              }
              if (email.length > 255) {
                return ctx.badRequest(Messages.character + " Email field");
              }
              if (country && country.length > 255) {
                return ctx.badRequest(Messages.character + " Country field");
              }
              if (language && language.length > 255) {
                return ctx.badRequest(Messages.character + " Language field");
              }
              if (!contactNo) {
                return ctx.badRequest(Messages.contactNo);
              }
              //validation for contactNo
              if (!contactNo.match(validation.contactNo)) {
                return ctx.badRequest(Messages.contactNoValid);
              }
              // Password length validation
              if (password.length < 8 || password.length > 16) {
                return ctx.badRequest(Messages.passwordValid);
              }
              //password validation
              if (!password.match(validation.regex)) {
                return ctx.badRequest(Messages.regexValid);
              }
              //length validation for username
              if (username.length < 3) {
                return ctx.badRequest("Username must be at least 3 characters");
              }
              return next();
            },
          ],
        },
      };
    }
    //for edit user
    if (
      plugin.routes["content-api"].routes[i].path == "/users/:id" &&
      plugin.routes["content-api"].routes[i].method == "PUT"
    ) {
      plugin.routes["content-api"].routes[i] = {
        ...route,
        config: {
          ...route.config,
          middlewares: [
            async (ctx, next) => {
              const {
                username,
                email,
                contactNo,
                role,
                country,
                language,
                provider = "local",
              } = ctx.request.body;

              if (username && username.length > 255) {
                return ctx.badRequest(Messages.character + " Name field");
              }
              if (email && email.length > 255) {
                return ctx.badRequest(Messages.character + " Email field");
              }
              if (country && country.length > 255) {
                return ctx.badRequest(Messages.character + " Country field");
              }
              if (language && language.length > 255) {
                return ctx.badRequest(Messages.character + " Language field");
              }
              //validation for contactNo
              if (!contactNo.match(validation.contactNo)) {
                return ctx.badRequest(Messages.contactNoValid);
              }
              //if updating role then give error message as role is not editable
              if (role) {
                return ctx.badRequest(Messages.updateRole);
              }
              return next();
            },
          ],
        },
      };
    }
    if (
      plugin.routes["content-api"].routes[i].path == "/users/:id" &&
      plugin.routes["content-api"].routes[i].method == "GET"
    ) {
      plugin.routes["content-api"].routes[i] = {
        ...route,
        config: {
          ...route.config,
          middlewares: [
            async (ctx, next) => {
              const user = await strapi
                .query("plugin::users-permissions.user")
                .findOne({
                  populate: { role: true },
                });
              delete user.password;
              delete user.resetPasswordToken;
              delete user.confirmationToken;
              return ctx.send(user);
            },
          ],
        },
      };
    }
    if (
      plugin.routes["content-api"].routes[i].path == "/users/:id" &&
      plugin.routes["content-api"].routes[i].method == "GET"
    ) {
      plugin.routes["content-api"].routes[i] = {
        ...route,
        config: {
          ...route.config,
          middlewares: [
            async (ctx, next) => {
              try {
                const user = await strapi
                  .query("plugin::users-permissions.user")
                  .findOne({
                    where: {
                      id: ctx.params.id,
                    },
                    populate: { role: true },
                  });
                delete user.password;
                delete user.resetPasswordToken;
                delete user.confirmationToken;
                return ctx.send(user);
              } catch (error) {
                // Handle the error here
                console.error("Error fetching user:", error);
              }
            },
          ],
        },
      };
    }
    //for get user
    if (
      plugin.routes["content-api"].routes[i].path == "/users/:id" &&
      plugin.routes["content-api"].routes[i].method == "GET"
    ) {
      plugin.routes["content-api"].routes[i] = {
        ...route,
        config: {
          ...route.config,
          middlewares: [
            async (ctx, next) => {
              try {
                //finding user from db
                const user = await strapi
                  .query("plugin::users-permissions.user")
                  .findOne({
                    where: {
                      id: ctx.params.id,
                    },
                    populate: { role: true },
                  });
                //deleting some fields from the response for security reasons
                delete user.password;
                delete user.resetPasswordToken;
                delete user.confirmationToken;
                return ctx.send(user);
              } catch (error) {
                // Handle the error here
                console.error("Error fetching user:", error);
                return ctx.badRequest(error.message);
              }
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
  plugin.routes["content-api"].routes.push({
    path: "/auth/forget-password",
    method: "GET",
    handler: "auth.logout",
  });
  return plugin;
};
