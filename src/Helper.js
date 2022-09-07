const axios = require("axios");
const DBport =
  process.env.DBport || "https://bizmod-db-server.herokuapp.com" ||  "http://localhost:5000";
const checkLoginAndReturnData = async (userObj, reqUrl) => {
  let options = {
    url: `${DBport}${reqUrl}`,
    method: "POST",
    //mode: "no-cors",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
    },
    data: userObj,
  };
  console.log(options);
  return axios(options).then((result) => {
    console.log("result  df", result.data);
    return result.data;
  });
};

module.exports.checkLoginAndReturnData = checkLoginAndReturnData;
