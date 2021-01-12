const express = require("express");
const morgan = require("morgan");

const cookieParser = require("cookie-parser");
const session = require("express-session");

const path = require("path");

const FileStore = require("session-file-store")(session);

const { cookiesCleaner } = require("./auth");

const dbConnect = require("./db-connect");

module.exports = function useMiddleware(app) {
  app.use(morgan("dev"));
  dbConnect();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.use(
    session({
      store: new FileStore(),
      key: "client",
      secret: "anything string here",
      resave: true,
      saveUninitialized: false,
      cookie: {
        expires: 600000,
        httpOnly: false,
      },
    })
  );

  app.use(cookiesCleaner);

  app.use((req, res, next) => {
    if (req.session.client || req.session.courier) {
      res.locals.isSession = true;
    } else {
      res.locals.isSession = false;
    }
    next();
  });

  app.use(express.static(path.join(__dirname, "..", "public")));

  app.set("view engine", "hbs");
  app.set("views", path.join(__dirname, "..", "views"));
};
