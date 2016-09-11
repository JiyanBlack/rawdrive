const User = require('./User.js');
const proto = User.prototype;
const fs = require('fs');
const usersJsonPath = './users/json/';

let usersArray = [];
let filesArray = fs.readdirSync(usersJsonPath);

for (let i in filesArray) {
  let path = usersJsonPath + filesArray[i];
  let userJson = JSON.parse(fs.readFileSync(path));
  userJson.__proto__ = proto;
  usersArray.push(userJson);
  userJson.init();
}

module.exports = usersArray;