//  **************** OAUTH SERVER ****************

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const PORT = process.env.PORT || 5000;
const express = require("express");
const Helper = require("./Helper");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const uri = "mongodb+srv://yotamos:linux6926@cluster0.zj6wiy3.mongodb.net/mtxlog?retryWrites=true&w=majority";
require("dotenv").config();
const Time = 10 * 60;
const MGoptions = { useNewUrlParser: true, useUnifiedTopology: true };
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

mongoose
  .connect(uri, MGoptions)
  .then((res) => console.log("conected to mongo...."))
  .catch((e) => console.log(e));

const refreshTokens = new Schema(
  {
    refreshToken: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);
const REFRESH_TOKENS = mongoose.model("Tokens", refreshTokens);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const generateAccessToken = (userCred) => {
  console.log("user Cred !!!!", userCred);
  console.log(process.env.ACCESS_TOKEN_SECRET);
  return jwt.sign(userCred, process.env.ACCESS_TOKEN_SECRET);
};

app.post("/api/login", async (req, res) => {
  //user and password as input
  // check if to of then in data base in the same client
  // if true return the related config file if exists
  // if not send to config page

  let userCred;
  try {
    userCred = await req.body;
  } catch (e) {
    console.log(e);
    return res.send(e);
  }

  let fetchedData;
  try {
    fetchedData = await Helper.checkLoginAndReturnData(userCred, "/api/handleLogin");
  } catch (e) {
    console.log(e);
  }
  console.log("asdasda", fetchedData);
  if (fetchedData.status != "yes") return res.send({ status: "no", data: fetchedData });
  console.log({ fetchedData });
  const accessToken = generateAccessToken({ fetchedData });
  const refreshToken = jwt.sign(fetchedData, process.env.REFRESH_TOKEN_SECRET);
  let token = new REFRESH_TOKENS({ refreshToken: refreshToken });
  // send before save
  // let yy = fetchedData.configObj;
  // let prem = JSON.stringify({ yy });
  // console.log("aaaaaaaaaaaaaaaaaaa", prem.toString());

  // res.setHeader("SSS", `'${JSON.stringify(yy)}'`);
  // //res.set("permissions", prem.toString());
  const configObject = await Helper.getUserConfig(accessToken, "/api/getdata");
  console.log({ configObject });
  const secueredConfigObject = { ...configObject, ErpConfig: "******* ok *******" };
  res.send({
    status: "yes",
    data: {
      accessToken: accessToken,
      refreshToken: refreshToken,
      timeLimit: Time,
      userConfig: secueredConfigObject ?? "no config object exist",
    },
  });

  token
    .save()
    .then((ON_SUCCUSS_RESULT) => {
      console.log({ ON_SUCCUSS_RESULT });
    })
    .catch((error) => {
      console.log({ error });
      // res.send({ status: "no", data: e });
    });
});

app.post("/api/configobject", async (req, res) => {
  const accessToken = await req?.body?.accessToken;
  if (!accessToken) return res.sendStatus(401);

  const configObject = await Helper.getUserConfig(accessToken, "/api/getdata");

  res.send({
    status: "yes",
    data: {
      userConfig: { ...configObject } ?? "no config object exist",
    },
  });
});

app.post("/api/refreshtoken", async (req, res) => {
  const Body = await req.body;
  const refreshToken = Body?.refreshToken;
  const fetchConfig = Body?.fetchConfig;
  if (!refreshToken) return res.sendStatus(401);

  let searchedRefreshTokens = await REFRESH_TOKENS.find({
    refreshToken: refreshToken,
  });
  if (searchedRefreshTokens.length == 0) return res.sendStatus(401);
  //  return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, fetchedData) => {
    if (err) return res.sendStatus(403);
    console.log("user data DDD", fetchedData);
    console.log({ fetchedData });
    const accessToken = generateAccessToken({ fetchedData });
    const configObject = fetchConfig ? await Helper.getUserConfig(accessToken, "/api/getdata") : null;
    res.json({ accessToken: accessToken, userConfig: configObject ? configObject : fetchedData ?? null, timeLimit: Time });
  });
});

app.post("/api/logout/", async (req, res) => {
  REFRESH_TOKENS.deleteOne({ refreshToken: req.body.token })
    .then((result) => res.send({ status: "yes", data: result }))
    .catch((e) => {
      console.log(e);
      res.send({ ststus: "no", data: e });
    });
});
app.listen(PORT, (err) => console.log(`oauth server ${err ? " on" : "listening"} port ${PORT} `));

// userData: {
//   status: 'yes',
//   configObj: {
//     ModulsPremission: [Object],
//     mtxConfig: [Object],
//     Reports: [Object],
//     ErpConfig: [Object],
//     _id: '63711f7c2ace1523371c0cc5',
//     userID: '62fd0ceeedbc87baf3979757',
//     AccountState: 'active',
//     createdAt: '2022-11-13T16:46:52.249Z',
//     updatedAt: '2023-03-23T17:23:17.264Z',
//     __v: 0
//   },
//   userID: '62fd0ceeedbc87baf3979757',
//   iat: 1679746893
// }
// }

// fetchedData: {
//   status: 'yes',
//   configObj: {
//     ModulsPremission: [Object],
//     mtxConfig: [Object],
//     Reports: [Object],
//     ErpConfig: [Object],
//     _id: '63711f7c2ace1523371c0cc5',
//     userID: '62fd0ceeedbc87baf3979757',
//     AccountState: 'active',
//     createdAt: '2022-11-13T16:46:52.249Z',
//     updatedAt: '2023-03-23T17:23:17.264Z',
//     __v: 0
//   },
//   userID: '62fd0ceeedbc87baf3979757'
// }
// }
