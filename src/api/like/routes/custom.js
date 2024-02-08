const { Messages } = require("../../../constants");

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/likes",
      handler: "like.create",
      config: {},
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
