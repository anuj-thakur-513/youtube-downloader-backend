const { Client } = require("youtubei");

let youtubeClient = null;
function getYoutubeClient() {
  if (!youtubeClient) {
    youtubeClient = new Client();
  }
  return youtubeClient;
}

module.exports = getYoutubeClient;
