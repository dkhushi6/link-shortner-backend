const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 4006;
require("dotenv").config();
app.use(express.json());

const cors = require("cors");
app.use(cors());

//mogoDB connection
const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URL);
    console.log("mongoDB connected ");
  } catch (error) {
    console.error(`error:${error.message}`);
  }
};

connectDB();

const urlSchema = new mongoose.Schema({
  longURL: String,
  shortUrl: String,

  visitors: { type: Number, default: 0 },
});
const Url = mongoose.model("Url", urlSchema);

app.post("/shortner", async (req, res) => {
  const longURL = req.body.longURL;
  if (!longURL) {
    return res.json({ message: "longURL is required" });
  }

  //generating short one---
  const randomString = Math.random().toString(36).substring(2, 9);

  //saving in DB---
  const urlEx = await Url.findOne({ longURL });
  if (urlEx) {
    return res.json({ message: "url already exist!!!" });
  }
  const url = await Url.create({
    longURL,

    shortUrl: randomString,
  });

  return res.json({
    message:
      "shorturl created succefully!! && longURL and shortUrl saved in mongoDB!!!!!!!!!!",
    url: `https://link-shortner-backend-a7or.onrender.com/${url.shortUrl}`,
  });
});

app.get("/:idUrl", async (req, res) => {
  const newUrl = req.params.idUrl;

  try {
    const findUrl = await Url.findOne({
      shortUrl: newUrl,
    });
    if (!findUrl) {
      return res.json({ message: "url not found" });
    }
    console.log(findUrl);
    findUrl.visitors++;
    await findUrl.save();

    return res.redirect(findUrl.longURL);
  } catch (error) {
    return res.json({ message: `Error: ${error.message}` });
  }
});

app.post("/analytics", async (req, res) => {
  var { shortUrl } = req.body;

  shortUrl = shortUrl.split("/")[3];
  console.log(shortUrl);

  const url = await Url.findOne({ shortUrl });

  if (!url) {
    return res.status(404).json({
      message: "URL not found",
    });
  }

  return res.json({
    visitors: url.visitors,
  });
});
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
