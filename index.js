require("dotenv").config();
const cors = require("cors");
const express = require("express");
const videoRoutes = require("./routes/videoRoutes");
const { connectToDB } = require("./helpers/db");

const app = express();
connectToDB();

app.use(cors());
app.use("/video", videoRoutes);

app.listen(5000, () => {
  "Server Running";
});
