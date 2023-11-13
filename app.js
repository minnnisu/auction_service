const express = require("express");
const app = express();
const port = 8081;
const dotenv = require("dotenv");
dotenv.config();
const { poolPromise } = require("./model/index");

app.get("/", async (req, res) => {
  const pool = await poolPromise;

  const value = "data1";
  const { recordset } =
    await pool.query`select * from test2 where value = ${value}`;

  res.json(recordset);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
