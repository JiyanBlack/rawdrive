const fs = require('fs');
const readlineSync = require('readline-sync');
const path = require('path');

const utils = {

  "readConfig": function() {
    try {
      return JSON.parse(fs.readFileSync('./config/config.json'));
    } catch (e) {
      if (e.code == "ENOENT") {
        this.saveConfig({});
      } else {
        throw e;
      }
    }
  },

  "question": function(prompt) {
    return readlineSync.question(prompt + "\n");
  },

  "saveConfig": function(config) {
    fs.writeFileSync('./config/config.json', JSON.stringify(config));
  },

  "saveUser": function(user) {
    fs.writeFile('./users/json/' + user.ID + '.json', JSON.stringify(user));
  },

  "readFolder": function(path) {
    try {
      return fs.readdirSync(path);
    } catch (e) {
      if (e.code == "ENOENT") {
        fs.mkdirSync(path);
        return [];
      } else {
        throw e;
      }
    }
  },

  "countUsers": function() {
    return fs.readdirSync('./users/json/').length;
  },

  "checkEmail": function(targetEmail) {
    const usersJsonPath = './users/json/'
    let filesArray = fs.readdirSync(usersJsonPath);
    if (filesArray.length == 0) return null;
    for (let i in filesArray) {
      let path = usersJsonPath + filesArray[i];
      let userJson = JSON.parse(fs.readFileSync(path));
      if (userJson.details.emailAddress == targetEmail)
        return userJson;
    }
    return null;
  }

}

module.exports = utils;