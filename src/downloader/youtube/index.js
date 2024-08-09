const getYoutubeClient = require("../../config/youtubeClient");
const {
  getPlaylistId,
  getVideoId,
  isPlaylist,
} = require("../../utils/youtube");
const { downloadPlaylist, downloadVideo } = require("./youtubeDownloader");

async function download(url, qualityItag) {
  try {
    const youtube = getYoutubeClient();
    if (isPlaylist(url)) {
      const PLAYLIST_ID = getPlaylistId(url);
      const playlist = await youtube.getPlaylist(PLAYLIST_ID);

      let DEFAULT_VIDEOS_COUNT = 100;

      while (playlist.videos.items.length === DEFAULT_VIDEOS_COUNT) {
        await playlist.videos.next();
        DEFAULT_VIDEOS_COUNT += 100;
      }

      console.log(
        "Total number of videos downloading:",
        playlist.videos.items.length
      );

      const key = await downloadPlaylist(playlist, qualityItag);
      return `${playlist.title}_${key}_${qualityItag}.zip`;
    } else {
      const VIDEO_ID = getVideoId(url);
      const video = await youtube.getVideo(VIDEO_ID);
      console.log("Downloading", video.title);
      await downloadVideo(url, video.title, qualityItag);
      return `${video.title}_${qualityItag}.mp4`;
    }
  } catch (error) {
    console.error("An error occurred while downloading:", error);
  }
}

module.exports = download;
