var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");

var indexRouter = require("./routes/index");

var app = express();

app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// 6. Routes
app.use("/", indexRouter);

module.exports = app;
