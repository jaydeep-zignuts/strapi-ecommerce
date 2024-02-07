module.exports = ({ env }) => ({
  //for expiration of jwt token
  "users-permissions": {
    config: {
      jwt: {
        expiresIn: "1d",
      },
    },
  },
});
