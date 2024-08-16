const { Client } = require("youtubei");
const ytdl = require("@distube/ytdl-core");

let youtubeClient = null;
function getYoutubeClient() {
  if (!youtubeClient) {
    youtubeClient = new Client();
  }
  return youtubeClient;
}

let ytdlAgent = null;
function getYtdlAgent() {
  if (!ytdlAgent) {
    ytdlAgent = ytdl.createAgent();
  }
  return ytdlAgent;
}

module.exports = { getYoutubeClient, getYtdlAgent };
