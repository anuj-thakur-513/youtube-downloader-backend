const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../core/ApiError");
const download = require("../downloader/youtube");
const path = require("path");

const handleDownloadYoutube = asyncHandler(async (req, res) => {
  const url = req.body.url;
  if (!url) {
    throw new ApiError(400, "URL is required");
  }

  const downloadedFile = await download(url);

  const filePath = path.resolve(
    __dirname,
    "..",
    "downloader",
    "youtube",
    "downloads",
    `${downloadedFile}.mp4`
  );

  return res.download(filePath);
});

module.exports = { handleDownloadYoutube };
