require("dotenv").config();
const path = require("path");
const fs = require("fs");

const app = require("./app");
const { deleteFiles } = require("./cron-jobs/deleteFile");

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  deleteFiles();
  console.log(`server started on port ${PORT}`);
});
