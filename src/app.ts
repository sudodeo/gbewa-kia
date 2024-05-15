import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";

import Config from "./config/config";
import { errorHandler, routeNotFound } from "./middlewares/error-middleware";
import router from "./router";

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cookieParser());

app.all("/", (req, res) => {
  res.redirect("/api/v1");
});

app.use("/api/v1", router);

app.use(routeNotFound);

app.use(errorHandler);

app.listen(Config.PORT, () => {
  console.log(`Server is running on port ${Config.PORT}`);
});
