const cron = require("node-cron");
const path = require("path");

const deleteFiles = async () => {
  const directory = path.resolve(
    __dirname,
    "..",
    "downloader",
    "youtube",
    "downloads"
  );

  cron.schedule("0 * * * *", async () => {
    const files = await fs.promises.readdir(directory);
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    for (const file of files) {
      if (file === ".gitkeep") continue;

      const filePath = path.join(directory, file);
      const stats = await fs.promises.stat(filePath);
      const creationTime = stats.birthtimeMs;

      if (creationTime < oneHourAgo) {
        await fs.promises.unlink(filePath);
        console.log(`Deleted old file: ${file}`);
      }
    }
  });
};

module.exports = { deleteFiles };
