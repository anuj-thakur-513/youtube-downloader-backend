const { Client } = require("youtubei");

const {
  getPlaylistId,
  getVideoId,
  isPlaylist,
} = require("../../utils/youtube");
const { downloadPlaylist, downloadVideo } = require("./youtubeDownloader");

let youtubeClient = null;
function generateYoutubeClient() {
  if (!youtubeClient) {
    youtubeClient = new Client();
  }
  return youtubeClient;
}

async function download(url) {
  try {
    const youtube = generateYoutubeClient();
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

      const key = await downloadPlaylist(playlist);
      return `${playlist.title}_${key}.zip`;
    } else {
      const VIDEO_ID = getVideoId(url);
      const video = await youtube.getVideo(VIDEO_ID);
      console.log("Downloading", video.title);
      await downloadVideo(url, video.title);
      return `${video.title}.mp4`;
    }
  } catch (error) {
    console.error("An error occurred while downloading:", error);
  }
}

module.exports = download;
