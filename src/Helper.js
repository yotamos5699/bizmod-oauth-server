const axios = require("axios");
const DBport =
  "https://bizmod-db-server.herokuapp.com" ||
  process.env.DBport ||
  "http://localhost:4000";

console.log(DBport);
const checkLoginAndReturnData = async (userObj, reqUrl) => {
  let options = {
    url: `${DBport}${reqUrl}`,
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
    },
    data: userObj,
  };
  console.log(options);
  return axios(options)
    .then((result) => {
      console.log("result  df", result.data);
      return result.data;
    })
    .catch((err) => {
      console.log(err);
      return err;
    });
};
//sd
module.exports.checkLoginAndReturnData = checkLoginAndReturnData;
