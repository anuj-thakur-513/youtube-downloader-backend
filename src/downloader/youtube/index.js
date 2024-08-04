const { Client } = require("youtubei");

const {
  getPlaylistId,
  getVideoId,
  isPlaylist,
} = require("../../utils/youtube");
const { downloadPlaylist, downloadVideo } = require("./youtubeDownloader");

let youtubeClient = null;
function generateYoutubeClient() {
  if (!youtube) {
    youtubeClient = new Client();
  }
  return youtubeClient;
}

let DEFAULT_VIDEOS_COUNT = 100;

async function main(url) {
  try {
    const youtube = generateYoutubeClient();
    if (isPlaylist(url)) {
      const PLAYLIST_ID = getPlaylistId(url);
      const playlist = await youtube.getPlaylist(PLAYLIST_ID);

      while (playlist.videos.items.length === DEFAULT_VIDEOS_COUNT) {
        await playlist.videos.next();
        DEFAULT_VIDEOS_COUNT += 100;
      }

      console.log(
        "Total number of videos downloading:",
        playlist.videos.items.length
      );

      await downloadPlaylist(playlist);
    } else {
      const VIDEO_ID = getVideoId(url);
      const video = await youtube.getVideo(VIDEO_ID);
      console.log("Downloading", video.title);
      await downloadVideo(url, video.title);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

export default main;
