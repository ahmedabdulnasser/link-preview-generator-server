var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");

var indexRouter = require("./routes/index");

var app = express();

// 1. Trust Railway's proxy
app.enable("trust proxy");

// 2. Rate limiting (without CORS skip since we're disabling all CORS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

app.use(limiter);

// 3. DISABLE ALL CORS - Add these middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Handle OPTIONS requests directly
app.options("*", (req, res) => {
  res.sendStatus(200);
});

// 4. Skip HTTPS redirect for all requests (including preflight)
app.use((req, res, next) => {
  next(); // Skip all redirects
});

// 5. Standard middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// 6. Routes
app.use("/", indexRouter);

module.exports = app;
