const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../core/ApiError");
const download = require("../downloader/youtube");
const path = require("path");

const handleDownloadYoutube = asyncHandler(async (req, res) => {
  const url = req.query.url;
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
  res.setHeader("X-File-Title", downloadedFile);

  return res.status(200).download(filePath);
});

module.exports = { handleDownloadYoutube };
