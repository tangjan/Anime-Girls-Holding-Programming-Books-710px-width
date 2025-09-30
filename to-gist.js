import axios from "axios";

const GITHUB_REPOS_API_URL =
  "https://api.github.com/repos/tangjan/Anime-Girls-Holding-Programming-Books-710px-width/contents";
const GITHUB_GIST_API_URL =
  "https://api.github.com/gists/ceb852425be20b772ee2625d9b5ee606";

const githubApiUrl = axios.create({
  headers: {
    Authorization: `token ${process.env.TOKEN_OF_GITHUB_GIST}`,
  },
});

async function getRepoContents(path = "", images = [], imageMap = new Map()) {
  try {
    const encodedPath = path ? encodeURIComponent(path) : "";
    const url = encodedPath
      ? `${GITHUB_REPOS_API_URL}/${encodedPath}`
      : GITHUB_REPOS_API_URL;

    console.log(`正在请求: ${url}`);
    const { data } = await githubApiUrl.get(url);

    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.type === "dir") {
          await getRepoContents(item.path, images, imageMap); // 递归
        } else if (
          item.type === "file" &&
          /\.(jpg|jpeg|png|gif)$/i.test(item.name)
        ) {
          const isResized = /_resized\.(jpg|jpeg|png|gif)$/i.test(item.name);

          // derive a base key without extension and without `_resized`
          const lastDot = item.path.lastIndexOf(".");
          const withoutExt =
            lastDot >= 0 ? item.path.slice(0, lastDot) : item.path;
          const baseKey = withoutExt.replace(/_resized$/i, "");

          const existing = imageMap.get(baseKey) || {};
          if (isResized) {
            existing.resized = item.download_url;
          } else {
            existing.original = item.download_url;
          }
          imageMap.set(baseKey, existing);
        }
      }
    }
  } catch (error) {
    console.error(`获取路径 ${path} 的内容时出错:`, error.message);
  }
}

async function updateGist(content) {
  try {
    await githubApiUrl.patch(GITHUB_GIST_API_URL, {
      files: {
        "Anime-Girls-Holding-Programming-Books-710px-width.json": {
          content: JSON.stringify(content, null, 2),
        },
      },
    });
    console.log("🎉 处理完成，数据已更新到 GitHub Gist:", GITHUB_GIST_API_URL);
  } catch (error) {
    console.error("更新 Gist 时出错:", error.message);
    throw error;
  }
}

async function main() {
  try {
    const images = [];
    const imageMap = new Map();
    await getRepoContents("", images, imageMap);

    const finalImages = [];
    for (const { resized, original } of imageMap.values()) {
      finalImages.push(resized || original);
    }

    const result = {
      last_updated: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // UTC+8
      source:
        "https://github.com/tangjan/Anime-Girls-Holding-Programming-Books-710px-width",
      count: finalImages.length,
      images: finalImages,
    };

    await updateGist(result);
  } catch (error) {
    console.error(error.message);
  }
}

main();
