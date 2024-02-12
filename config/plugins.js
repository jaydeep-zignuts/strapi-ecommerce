module.exports = ({ env }) => ({
  //for expiration of jwt token
  "users-permissions": {
    config: {
      jwt: {
        expiresIn: "1d",
      },
    },
  },
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: env("SMTP_HOST", "smtp.gmail.com"),
        port: env("SMTP_PORT", 587),
        auth: {
          user: env("SMTP_USERNAME", "jaydeeppatel3082001@gmail.com"),
          pass: env("SMTP_PASSWORD", "wrbx cgzx ptxx oatl"),
        },
        debug: true,
        // ... any custom nodemailer options
      },
      settings: {
        defaultFrom: "jaydeeppatel3082001@gmail.com",
        defaultReplyTo: "testuser@yopmail.com",
      },
    },
  },
});
