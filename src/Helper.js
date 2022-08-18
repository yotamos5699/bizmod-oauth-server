const axios = require("axios");
const dbUrl = "http://localhost:5000";

const checkLoginAndReturnData = async (userObj, reqUrl) => {
  let options = {
    url: `${dbUrl}${reqUrl}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
    },
    data: userObj,
  };

  return axios(options).then((result) => {
    console.log("result  df", result.data);
    return result.data;
  });
};

module.exports.checkLoginAndReturnData = checkLoginAndReturnData;
