require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const shortid = require("shortid");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error(err);
  });

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },

  shortCode: {
    type: String,
    required: true,
    unique: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800,
  },
});

const Url = mongoose.model("Url", urlSchema);

const reservedCodes = [
  "api",
  "admin",
  "login",
  "signup",
  "dashboard",
  "settings",
];

app.get("/", (req, res) => {
  res.send("URL Shortener API Running");
});

app.post("/shorten", async (req, res) => {
  try {
    let { originalUrl, customCode } = req.body;

    if (!originalUrl) {
      return res.status(400).json({
        error: "URL is required",
      });
    }

    originalUrl = originalUrl.trim();

    if (
      !originalUrl.startsWith("http://") &&
      !originalUrl.startsWith("https://")
    ) {
      originalUrl = `https://${originalUrl}`;
    }

    let shortCode;

    if (customCode) {
      customCode = customCode
        .trim()
        .toLowerCase()
        .replace(/\//g, "");

      if (
        !/^[a-zA-Z0-9-_]+$/.test(customCode)
      ) {
        return res.status(400).json({
          error:
            "Only letters, numbers, - and _ allowed",
        });
      }

      if (reservedCodes.includes(customCode)) {
        return res.status(400).json({
          error: "This custom URL is reserved",
        });
      }

      const existing = await Url.findOne({
        shortCode: customCode,
      });

      if (existing) {
        return res.status(400).json({
          error: "Custom URL already taken",
        });
      }

      shortCode = customCode;
    } else {
      shortCode = shortid.generate();
    }

    const newUrl = new Url({
      originalUrl,
      shortCode,
    });

    await newUrl.save();

    res.json({
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

app.get("/:shortCode", async (req, res) => {
  try {
    const url = await Url.findOne({
      shortCode: req.params.shortCode,
    });

    if (url) {
      return res.redirect(url.originalUrl);
    }

    return res.status(404).json({
      error: "URL not found",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
