const { Router } = require("express");
const fs = require("fs");
const multer = require("multer");
const {
  uploadVideo,
  getAllVideos,
  streamVideo,
  downloadVideo,
} = require("../controllers/videoControllers");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync("tmp/")) {
      fs.mkdirSync("tmp/");
    }
    cb(null, "tmp/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage: storage,
});

const router = Router();

router
  .post("/upload", upload.single("video"), uploadVideo)
  .get("/all", getAllVideos)
  .get("/stream/:id", streamVideo)
  .get("/download/:id", downloadVideo);

module.exports = router;
