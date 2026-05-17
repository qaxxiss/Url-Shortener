require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const shortid = require("shortid");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

const UrlSchema = new mongoose.Schema({
  originalUrl: String,

  shortCode: {
    type: String,
    unique: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800, // 7 days
  },
});

const Url = mongoose.model("Url", UrlSchema);

// Reserved words users cannot use
const reservedWords = [
  "api",
  "admin",
  "login",
  "signup",
  "dashboard",
  "settings",
  "auth",
  "user",
  "users",
  "home",
  "about",
  "contact",
];

app.post("/shorten", async (req, res) => {
  try {
    let { originalUrl, customCode } = req.body;

    // Automatically add https://
    if (
      !originalUrl.startsWith("http://") &&
      !originalUrl.startsWith("https://")
    ) {
      originalUrl = "https://" + originalUrl;
    }

    let shortCode;

    // Custom short URL
    if (customCode && customCode.trim() !== "") {
      customCode = customCode.toLowerCase();

      // Block reserved words
      if (reservedWords.includes(customCode)) {
        return res.status(400).json({
          error: "This custom URL is reserved",
        });
      }

      // Check existing
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
      // Auto-generated code
      shortCode = shortid.generate();
    }

    const url = new Url({
      originalUrl,
      shortCode,
    });

    await url.save();

    res.json({
      shortUrl: `https://your-backend.onrender.com/${shortCode}`,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Server error",
    });
  }
});

app.get("/:code", async (req, res) => {
  try {
    const url = await Url.findOne({
      shortCode: req.params.code,
    });

    if (!url) {
      return res.status(404).send("URL not found");
    }

    res.redirect(url.originalUrl);
  } catch (error) {
    console.log(error);

    res.status(500).send("Server error");
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
