const User = require('./User.js');
const fs = require('fs');
const usersJsonPath = './users/json/';
const usersReviverPath = './users/revivers/';
const reviver = require('class-reviver');

function getUsers() {
  let usersArray = [];
  let jsonArray = fs.readdirSync(usersJsonPath);
  let userReviver = new reviver.ClassReviver(User);
  for (let i in jsonArray) {
    let path = usersJsonPath + jsonArray[i];
    let userJson = JSON.parse(fs.readFileSync(path));
    let user = userReviver.revive(userJson);
    usersArray[user.ID] = user;
  }
  return usersArray;
}
module.exports = getUsers;