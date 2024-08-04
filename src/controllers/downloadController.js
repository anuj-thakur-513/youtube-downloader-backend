const asyncHandler = require("../utils/asyncHandler");

const handleDownloadYoutube = asyncHandler((req, res) => {
  const url = req.body.url;
});

module.exports = { handleDownloadYoutube };
