const { Router } = require("express");

const { handleDownloadYoutube } = require("../controllers/downloadController");

const downloadRouter = Router();
downloadRouter.get("/", handleDownloadYoutube);

export default downloadRouter;
