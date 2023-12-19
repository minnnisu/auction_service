const express = require("express");
const logger = require("morgan");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const passport = require("passport");
const passportConfig = require("./api/passport");
const HttpError = require("./error/HttpError");
const scheduler = require("./schedule/scheduler");

const authRouter = require("./api/routes/apis/authRouter");
const auctionApiRouter = require("./api/routes/apis/auctionRouter");
const bidApiRouter = require("./api/routes/apis/bidRouter");
const commentApiRouter = require("./api/routes/apis/commentRouter");
const replyApiRouter = require("./api/routes/apis/replyRouter");
const userApiRouter = require("./api/routes/apis/userRouter");

const userRouter = require("./api/routes/pages/userRouter");
const indexRouter = require("./api/routes/pages/indexRouter");
const auctionRouter = require("./api/routes/pages/auctionRouter");
const { getHeaderData } = require("./api/middleware/headerMiddleware");

const app = express();
const port = 8081;

dotenv.config();
app.set("view engine", "ejs");
app.use("/", express.static(path.join(__dirname, "public")));
app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    // store: new MemoryStore({ checkPeriod: 1000 * 60 * 20 }),
    store: new SQLiteStore({ db: "session.db", dir: "./session" }),
    cookie: { maxAge: 3600000 }, // 1 hours (= 1 * 60 * 60 * 1000 ms)
  })
);

passportConfig();
app.use(passport.authenticate("session")); // authenticate the session.

app.use(function (req, res, next) {
  var msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !!msgs.length;
  req.session.messages = [];
  next();
});

app.use("/api/auth", authRouter);
app.use("/api/auction/item", auctionApiRouter);
app.use("/api/auction/item/bid", bidApiRouter);
app.use("/api/auction/item/comment", commentApiRouter);
app.use("/api/auction/item/comment/reply", replyApiRouter);
app.use("/api/user", userApiRouter);

app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/auction/item", auctionRouter);

app.use(getHeaderData);

app.use(async function (req, res, next) {
  console.log(req.headerData);
  res.status(404).render("error404", { header: req.headerData });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (err instanceof HttpError) {
    if (
      err.option?.isShowErrPage === true &&
      err.option?.isShowCustomeMsg === true
    ) {
      return res.status(err.status).render("error", {
        header: req.headerData,
        err_code: err.status,
        err_msg: err.option.CustomeMsg,
      });
    }

    if (err.option?.isShowErrPage === true) {
      return res.status(err.status).render("error", {
        header: req.headerData,
        err_code: err.status,
        err_msg: err.message,
      });
    }

    return res.status(err.status).json({ message: err.message });
  }

  return res.status(500).json({ message: "server_error" });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  scheduler.startServer();
});
