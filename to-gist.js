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

async function getRepoContents(path = "", images = []) {
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
          await getRepoContents(item.path, images); // 递归
        } else if (
          item.type === "file" &&
          /\.(jpg|jpeg|png|gif)$/i.test(item.name)
        ) {
          images.push(item.download_url);
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
    await getRepoContents("", images);

    const result = {
      last_updated: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // UTC+8
      source:
        "https://github.com/tangjan/Anime-Girls-Holding-Programming-Books-710px-width",
      count: images.length,
      images: images,
    };

    await updateGist(result);
  } catch (error) {
    console.error(error.message);
  }
}

main();
