const ytdl = require("@distube/ytdl-core");
const path = require("path");
const { createReadStream, unlinkSync } = require("fs");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../core/ApiError");
const ApiResponse = require("../core/ApiResponse");
const download = require("../downloader/youtube");
const {
  isValidYoutubeURL,
  isPlaylist,
  getPlaylistId,
} = require("../utils/youtube");
const { getYoutubeClient, getYtdlAgent } = require("../config/youtubeClient");

const handleDownloadYoutube = asyncHandler(async (req, res) => {
  const { url, quality } = req.body;
  if (!url || !isValidYoutubeURL(url)) {
    throw new ApiError(
      400,
      "A valid youtube video or playlist URL is required"
    );
  }
  if (!quality) {
    throw new ApiError(400, "Quality of the video is required");
  }

  const downloadedFile = await download(url, quality);
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
  readStream.on("error", (err) => {
    console.error("Error while sending file:", err);
    res.status(500).send("Error while sending file.");
  });
  readStream.on("end", (err) => {
    if (!err) {
      unlinkSync(filePath);
    }
  });
});

const handleGetVideoDetails = asyncHandler(async (req, res) => {
  const { url } = req.query;
  if (!url || !isValidYoutubeURL(url)) {
    throw new ApiError(
      400,
      "A valid youtube video or playlist URL is required"
    );
  }
  const youtube = getYoutubeClient();

  let fetchedDetails;
  let details = {
    title: "",
    thumbnail: "",
    qualities: [],
  };
  if (isPlaylist(url)) {
    const PLAYLIST_ID = getPlaylistId(url);
    fetchedDetails = await youtube.getPlaylist(PLAYLIST_ID);
    details.title = fetchedDetails.title;
    details.thumbnail = fetchedDetails?.thumbnails.reduce(
      (highest, current) => {
        return current.width > highest.width ? current : highest;
      }
    ).url;

    details.qualities.push(
      { itag: "High Quality", qualityLabel: "High Quality" },
      { itag: "Medium Quality", qualityLabel: "Medium Quality" },
      { itag: "Low Quality", qualityLabel: "Low Quality" }
    );
  } else {
    // TODO: don't return a quality if it doesn't have a quality Label
    const agent = getYtdlAgent();
    fetchedDetails = await ytdl.getInfo(url, { agent });
    details.title = fetchedDetails?.videoDetails?.title;
    details.thumbnail = fetchedDetails?.videoDetails?.thumbnails.reduce(
      (highest, current) => {
        return current.width > highest.width ? current : highest;
      }
    ).url;

    let qualities = fetchedDetails.formats;
    qualities = qualities.filter((quality) => {
      return (
        quality?.container &&
        quality?.container.includes("mp4") &&
        quality?.qualityLabel !== null
      );
    });

    const resolutionMap = new Map();
    qualities.forEach((quality) => {
      const { qualityLabel, itag, bitrate } = quality;

      if (resolutionMap.has(qualityLabel)) {
        // If the resolution is already in the map, keep the lower bitrate quality
        const existingQuality = resolutionMap.get(qualityLabel);
        if (bitrate < existingQuality.bitrate) {
          resolutionMap.set(qualityLabel, { itag, qualityLabel, bitrate });
        }
      } else {
        // If the resolution is not in the map, add it
        resolutionMap.set(qualityLabel, { itag, qualityLabel, bitrate });
      }
    });

    // Convert the map back to an array
    const filteredQualities = Array.from(resolutionMap.values());

    filteredQualities.forEach((quality) => {
      details.qualities.push({
        itag: quality.itag,
        qualityLabel: quality.qualityLabel,
      });
    });
  }

  res
    .status(200)
    .json(new ApiResponse(200, details, "Details fetched successfully"));
});

module.exports = { handleDownloadYoutube, handleGetVideoDetails };
