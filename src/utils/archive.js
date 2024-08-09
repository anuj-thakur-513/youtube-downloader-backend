const archiver = require("archiver");
const fs = require("fs");
const path = require("path");

async function archive(key, playlist, downloadPath, qualityItag) {
  const outputPath = `${downloadPath}/${playlist.title}_${key}_${qualityItag}.zip`;
  const output = fs.createWriteStream(outputPath);

  const archive = archiver("zip", {
    zlib: { level: 9 }, // Sets the compression level.
  });

  output.on("close", function () {
    for (let i = 0; i < playlist.videos.items.length; i++) {
      const filePath = path.join(
        downloadPath,
        `${i + 1}. ${playlist.videos.items[i].title}_${key}_${qualityItag}.mp4`
      );
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file ${filePath}:`, err);
        }
      });
    }
    console.log("Zip file has been created for the playlist:", playlist.title);
  });

  output.on("end", function () {
    console.log("Data has been drained");
  });

  archive.on("warning", function (err) {
    if (err.code === "ENOENT") {
      console.log("Warning while zipping:", err);
    } else {
      throw err;
    }
  });

  archive.on("error", function (err) {
    throw err;
  });

  // pipe archive data to the file
  archive.pipe(output);

  for (let i = 0; i < playlist.videos.items.length; i++) {
    const currentVideo = playlist.videos.items[i];
    const filePath = path.join(
      downloadPath,
      `${i + 1}. ${currentVideo.title}_${key}_${qualityItag}.mp4`
    );
    archive.append(fs.createReadStream(filePath), {
      name: `${i + 1}. ${currentVideo.title}_${qualityItag}.mp4`,
    });
  }

  await archive.finalize();
}

module.exports = archive;
