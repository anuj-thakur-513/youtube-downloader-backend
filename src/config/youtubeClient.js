const fs = require("fs");
const path = require("path");
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
    const agentOptions = {
      headers: {
        referer: "https://www.youtube.com/",
      },
    };
    ytdlAgent = ytdl.createAgent(
      JSON.parse(fs.readFileSync(path.resolve(__dirname, "youtubeCookies.js"))),
      agentOptions
    );
  }
  return ytdlAgent;
}

module.exports = { getYoutubeClient, getYtdlAgent };
