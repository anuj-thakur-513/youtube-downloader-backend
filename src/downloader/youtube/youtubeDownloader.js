const fs = require("fs");
const ytdl = require("@distube/ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const archive = require("../../utils/archive");

async function downloadVideo(videoUrl, videoTitle, qualityItag) {
  const info = await ytdl.getInfo(videoUrl);
  /**
   * Qualities/Formats that can be added:
   * 'lowest' | 'highest' | 'highestaudio' | 'lowestaudio' | 'highestvideo' | 'lowestvideo'
   */
  const audioFormat = ytdl.chooseFormat(info.formats, {
    quality: "highestaudio",
  });
  let videoFormat;
  if (!isNaN(qualityItag)) {
    console.log(qualityItag);
    videoFormat = info.formats.find(
      (format) => format.itag === parseInt(qualityItag)
    );
  } else {
    let qualityLabels;
    switch (qualityItag) {
      case "High Quality":
        qualityLabels = [
          "4320p",
          "4320p60",
          "2160p",
          "2160p60",
          "2160p60 HDR",
          "1440p",
          "1440p60",
          "1440p60 HDR",
          "1080p",
          "1080p60",
          "1080p60 HDR",
        ];
        break;
      case "Medium Quality":
        qualityLabels = ["720p", "720p60", "720p60 HDR", "480p", "480p60 HDR"];
        break;
      case "Low Quality":
        qualityLabels = [
          "360p",
          "360p60 HDR",
          "270p",
          "240p",
          "240p60 HDR",
          "144p",
          "144p 15fps",
          "144p60 HDR",
        ];
        break;
      default:
        return null;
    }

    const filteredFormats = info.formats
      .filter((format) => qualityLabels.includes(format.qualityLabel))
      .sort((a, b) => {
        // Sort by quality label index in qualityLabels array
        const qualityIndexA = qualityLabels.indexOf(a.qualityLabel);
        const qualityIndexB = qualityLabels.indexOf(b.qualityLabel);

        if (qualityIndexA !== qualityIndexB) {
          return qualityIndexA - qualityIndexB;
        }

        // If same quality label, sort by bitrate (ascending)
        return a.bitrate - b.bitrate;
      });

    videoFormat = filteredFormats[0];
  }
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
  const outputPath = path.resolve(
    __dirname,
    "downloads",
    `${videoTitle}_${qualityItag}.mp4`
  );

  // Download video
  await new Promise((resolve, reject) => {
    console.log(videoFormat);
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

async function downloadPlaylist(data, qualityItag) {
  let curr = 0;
  const now = Date.now();

  while (curr < data.videos.items.length) {
    const videoData = data.videos.items[curr];
    const videoId = videoData.id;
    const videoTitle = `${curr + 1}. ${videoData.title}_${now}`;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log("downloading:", videoTitle);
    await downloadVideo(videoUrl, videoTitle, qualityItag);
    curr++;
  }

  const downloadPath = path.resolve(__dirname, "downloads");
  await archive(now, data, downloadPath, qualityItag);
  return now;
}

module.exports = { downloadPlaylist, downloadVideo };
