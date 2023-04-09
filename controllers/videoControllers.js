const fs = require("fs");
const path = require("path");
const { getDB, getBucket } = require("../helpers/db");
const { ObjectId } = require("mongodb");

// @route: POST /video/upload
const uploadVideo = (req, res) => {
  if (!fs.existsSync(path.resolve(`tmp/${req.file.filename}`))) {
    console.log("file not found");
    res.status(500).send("error");
  }
  const bucket = getBucket();
  const uploadStream = bucket.openUploadStream(req.file.filename);
  const readStream = fs.createReadStream(
    path.resolve(`tmp/${req.file.filename}`)
  );
  readStream.pipe(uploadStream).once("close", () => {
    fs.unlinkSync(path.resolve(`tmp/${req.file.filename}`));
  });
  res.send(uploadStream.id);
};

// @route: GET /video/all
const getAllVideos = (req, res) => {
  const bucket = getBucket();
  const cursor = bucket.find({});
  const uploadedVids = [];
  cursor.forEach((element) => {
    uploadedVids.push(element);
  });
  cursor.once("close", () => {
    res.send(uploadedVids);
  });
};

// @route: GET /video/stream/:id
const streamVideo = (req, res) => {
  const { id } = req.params;
  const objectid = new ObjectId(id);
  const range = req.headers.range;
  const db = getDB();
  db.collection("uploads.files")
    .findOne({ _id: objectid })
    .then((video) => {
      if (!video) {
        res.status(404).send("Video not found!");
        return;
      }
      const videoSize = video.length;
      const start = Number(range.replace(/\D/g, ""));
      const end = video.length - 1;
      const contentLength = end - start + 1;
      const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Range": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
      };

      res.writeHead(206, headers);

      const bucket = getBucket();
      const downloadStream = bucket.openDownloadStream(objectid, {
        start: start,
        end: end,
      });
      downloadStream.pipe(res);
    });
};

// @route: GET /video/download/:id
const downloadVideo = (req, res) => {
  const { id } = req.params;
  const objectid = new ObjectId(id);
  const db = getDB();
  db.collection("uploads.files")
    .findOne({ _id: objectid })
    .then((video) => {
      const bucket = getBucket();
      const downloadStream = bucket.openDownloadStream(objectid);
      res.header(
        "Content-Disposition",
        `attachment; filename="${video.filename}"`
      );
      downloadStream.pipe(res);
    });
};

module.exports = { uploadVideo, getAllVideos, streamVideo, downloadVideo };
