const { Messages } = require("../../../constants");

module.exports = {
  routes: [
    {
      method: "PUT",
      path: "/carts/delete/:id",
      handler: "cart.delete",
    },
  ],
};
