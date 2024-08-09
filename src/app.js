const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const videoRouter = require("./routes/videoRoutes");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    exposedHeaders: ["X-File-Title"],
  })
);
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: false, limit: "50kb" }));
app.use(morgan("dev"));

app.use("/api/video", videoRouter);

module.exports = app;
