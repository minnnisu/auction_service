const dotenv = require("dotenv");
dotenv.config();

const sql = require("mssql");
const config = {
  server: process.env.DB_SERVER,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true,
  },
};

exports.poolPromise = sql
  .connect(config)
  .then((pool) => {
    console.log("Sucessfully connected mssql!");
    return pool;
  })
  .catch((err) => console.log("Database Connection Failed: ", err));
