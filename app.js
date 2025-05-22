var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const { rateLimit } = require("express-rate-limit");

var indexRouter = require("./routes/index");

var app = express();

// 1. Trust Railway's proxy
app.enable("trust proxy");

// 2. Apply rate limiter EXCLUDING OPTIONS requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS", // Skip preflight requests
});

app.use(limiter);

// 3. Configure CORS PROPERLY
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  })
);

// 4. Explicitly handle OPTIONS for all routes
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.status(200).end();
});

// 5. Prevent automatic HTTPS redirects during preflight
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return next(); // Skip HTTPS redirect for preflight
  }
  if (process.env.NODE_ENV === "production" && !req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

module.exports = app;
