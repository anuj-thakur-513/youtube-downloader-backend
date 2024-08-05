const fs = require("fs");
const ytdl = require("@distube/ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const archive = require("../../utils/archive");

async function downloadVideo(videoUrl, videoTitle) {
  const info = await ytdl.getInfo(videoUrl);
  /**
   * Qualities/Formats that can be added:
   * 'lowest' | 'highest' | 'highestaudio' | 'lowestaudio' | 'highestvideo' | 'lowestvideo'
   */
  const audioFormat = ytdl.chooseFormat(info.formats, {
    quality: "highestaudio",
  });
  const videoFormat = ytdl.chooseFormat(info.formats, {
    quality: "highestvideo",
  });

  const videoPath = path.resolve(
    __dirname,
    "downloads",
    `${videoTitle}_video.mp4`
  );
  const audioPath = path.resolve(
    __dirname,
    "downloads",
    `${videoTitle}_audio.mp4`
  );
  const outputPath = path.resolve(__dirname, "downloads", `${videoTitle}.mp4`);

  // Download video
  await new Promise((resolve, reject) => {
    ytdl(videoUrl, { quality: videoFormat.itag })
      .pipe(fs.createWriteStream(videoPath))
      .on("finish", () => {
        console.log(`Video download completed for ${videoTitle}`);
        resolve();
      })
      .on("error", reject);
  });

  // Download audio
  await new Promise((resolve, reject) => {
    ytdl(videoUrl, { quality: audioFormat.itag })
      .pipe(fs.createWriteStream(audioPath))
      .on("finish", () => {
        console.log(`Audio download completed for ${videoTitle}`);
        resolve();
      })
      .on("error", reject);
  });

  console.log("Merging audio and video");
  // Merge video and audio using ffmpeg with progress
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoPath)
      .input(audioPath)
      .outputOptions("-c:v copy")
      .outputOptions("-c:a aac")
      .output(outputPath)
      .on("end", () => {
        console.log(`Download completed for ${videoTitle}`);
        // Clean up temp files
        fs.unlinkSync(videoPath);
        fs.unlinkSync(audioPath);
        resolve();
      })
      .on("error", (err) => {
        console.error(`Error merging ${videoTitle}:`, err);
        reject(err);
      })
      .run();
  });
}

async function downloadPlaylist(data) {
  let curr = 0;
  const now = Date.now();

  while (curr < data.videos.items.length) {
    const videoData = data.videos.items[curr];
    const videoId = videoData.id;
    const videoTitle = `${curr + 1}. ${videoData.title}_${now}`;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log("downloading:", videoTitle);
    await downloadVideo(videoUrl, videoTitle);
    curr++;
  }

  const downloadPath = path.resolve(__dirname, "downloads");
  await archive(now, data, downloadPath);
  return now;
}

module.exports = { downloadPlaylist, downloadVideo };
