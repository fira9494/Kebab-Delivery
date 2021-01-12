const express = require("express");

const app = express();

const useMiddleware = require("./middleware/index");

const useErrorHandlers = require("./middleware/error-handlers");

const indexRouter = require("./routes/index");
const mainRouter = require("./routes/main");

useMiddleware(app);

app.use("/", indexRouter);
app.use("/main", mainRouter);

useErrorHandlers(app);

module.exports = app;
