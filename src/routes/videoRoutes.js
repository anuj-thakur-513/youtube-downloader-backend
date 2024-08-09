const { Router } = require("express");

const {
  handleDownloadYoutube,
  handleGetVideoDetails,
} = require("../controllers/downloadController");

const videoRouter = Router();
videoRouter.get("/download", handleDownloadYoutube);
videoRouter.get("/details", handleGetVideoDetails);

module.exports = videoRouter;
