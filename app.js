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
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS", // Skip preflight requests
});

app.use(limiter);

// 3. Configure CORS middleware first
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// 4. HTTPS redirect middleware - must come after CORS
app.use((req, res, next) => {
  // Skip HTTPS redirect for all OPTIONS requests (preflight)
  if (req.method === "OPTIONS") {
    return next();
  }

  // In production, ensure HTTPS
  if (process.env.NODE_ENV === "production") {
    // Railway uses X-Forwarded-Proto header
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
  }
  next();
});

// 5. Other standard middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// 6. Routes
app.use("/", indexRouter);

module.exports = app;
