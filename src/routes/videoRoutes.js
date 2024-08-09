const { Router } = require("express");

const {
  handleDownloadYoutube,
  handleGetVideoDetails,
} = require("../controllers/videoController");

const videoRouter = Router();
videoRouter.post("/download", handleDownloadYoutube);
videoRouter.get("/details", handleGetVideoDetails);

module.exports = videoRouter;
