const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../core/ApiError");
const download = require("../downloader/youtube");
const path = require("path");
const { createReadStream, unlinkSync } = require("fs");

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
    `${downloadedFile}`
  );

  res.setHeader("X-File-Title", downloadedFile);

  const readStream = createReadStream(filePath);
  readStream.pipe(res);
  readStream.on("end", () => {
    unlinkSync(filePath);
  });
  readStream.on("error", (err) => {
    console.error("Error while sending file:", err);
    res.status(500).send("Error while sending file.");
  });
});

module.exports = { handleDownloadYoutube };
