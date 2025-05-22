var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const { rateLimit } = require("express-rate-limit");

var indexRouter = require("./routes/index");

var app = express();

// Apply rate limiter first to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

app.use(limiter);

// Enhanced CORS configuration
app.use(
  cors({
    origin: "http://localhost:5000",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

// Explicitly handle OPTIONS requests for all routes
app.options("*", cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Add this middleware to handle Railway's proxy and HTTPS redirects
app.enable("trust proxy");
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && !req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

app.use("/", indexRouter);

module.exports = app;
