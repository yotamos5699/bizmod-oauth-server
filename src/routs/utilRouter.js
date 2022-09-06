const crypto = require("crypto");
const express = require("express");
const UTrouter = express.Router();
const getCred = require("../../Helpers/wizCloudUtiles/helpers/getCred");
const cors = require("cors");

UTrouter.use(
  cors({
    origin: "*",
  })
);
const hashUserKey = (key) => {
  return crypto.createHash("md5").update(key).digest("hex");
};

const generateKey = (collection) => {
  const keysLocation = { MtxLog: "matrixID", Users: "HushedPassword" };
  const Key = crypto.randomBytes(32).toString("hex");
  const hashedKey = hashUserKey(Key);
  if ([collection].find(`"${keysLocation[collection]}":"${hashedKey}"`))
    generateKey();
  else return { hashedKey: hashedKey, Key: Key };
};

UTrouter.get("/api/generatekey", (req, res) => {
  console.log(req.headers);
  let response = getCred.generateKey();
  res.end(JSON.stringify({ response }));
});

module.exports = UTrouter;
