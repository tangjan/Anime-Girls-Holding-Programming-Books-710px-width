const sharp = require("sharp");
const { glob } = require("glob");
const path = require("path");
const fs = require("fs").promises;

const TARGET_WIDTH = 710;

async function processImage(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();

    if (metadata.width < TARGET_WIDTH) {
      const newHeight = Math.round(
        (TARGET_WIDTH * metadata.height) / metadata.width
      );

      const dir = path.dirname(imagePath);
      const ext = path.extname(imagePath);
      const basename = path.basename(imagePath, ext);
      const newPath = path.join(dir, `${basename}_resized${ext}`);

      await sharp(imagePath).resize(TARGET_WIDTH, newHeight).toFile(newPath);

      console.log(`Processed: ${imagePath} -> ${newPath}`);
    } else {
      console.log(
        `Skipped: ${imagePath} (Width is greater than or equal to ${TARGET_WIDTH}px)`
      );
    }
  } catch (error) {
    console.error(`Error processing: ${imagePath}:`, error);
  }
}

async function main() {
  try {
    const images = await glob("**/*.{jpg,jpeg,png,gif}", {
      ignore: "node_modules/**",
    });

    for (const image of images) {
      await processImage(image);
    }

    console.log("Completed!🎉");
  } catch (error) {
    console.error(error);
  }
}

main();
