const { MongoClient, GridFSBucket } = require("mongodb");

let db = null;
let bucket = null;

const connectToDB = async () => {
  const uri = `${process.env.MONGO_URI}`;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    db = client.db("videos");
    bucket = new GridFSBucket(db, { bucketName: "uploads" });
  } catch (err) {
    console.log("error occured with msg " + err);
  }
  return client;
};

const getDB = () => {
  return db;
};

const getBucket = () => {
  return bucket;
};

module.exports = { connectToDB, getDB, getBucket };
