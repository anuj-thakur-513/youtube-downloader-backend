const { Router } = require("express");

const { handleDownloadYoutube } = require("../controllers/downloadController");

const downloadRouter = Router();
downloadRouter.get("/", handleDownloadYoutube);

module.exports = downloadRouter;
