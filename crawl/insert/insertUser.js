const authService = require("../../service/authService");
const fs = require("fs");

const filePath = "crawl/user/user.json";

async function signup(user, index) {
  try {
    console.log(index);
    await authService.signup(user);
  } catch (error) {
    console.log(error);
  }
}

fs.readFile(filePath, "utf8", async (err, data) => {
  if (err) {
    console.error("파일 읽기 에러:", err);
    return;
  }

  const users = JSON.parse(data);
  const promises = users.map(async (user, index) => {
    await signup(user, index);
  });

  await Promise.all(promises);
});
