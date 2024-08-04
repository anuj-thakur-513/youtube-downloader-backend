const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const downloadRouter = require("./routes/downloadRoutes");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: false, limit: "50kb" }));
app.use(morgan("dev"));

app.use("/api/download", downloadRouter);

export default app;
