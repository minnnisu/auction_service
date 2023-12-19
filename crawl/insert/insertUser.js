const authService = require("../../service/authService");
const fs = require("fs");

const filePath = "crawl/user/user.json";

async function signup(user) {
  try {
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
    console.log(index);
    await signup(user);
  });

  await Promise.all(promises);
});
