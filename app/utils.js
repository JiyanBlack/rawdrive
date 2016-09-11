const fs = require('fs');
const readlineSync = require('readline-sync');
const path = require('path');

const utils = {

  "readConfig": function () {
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

  "question": function (prompt) {
    return readlineSync.question(prompt + "\n");
  },

  "saveConfig": function (config) {
    fs.writeFileSync('./config/config.json', JSON.stringify(config));
  },

  "saveUser": function (user) {
    fs.writeFileSync('./users/json/' + user.ID + '.json', JSON.stringify(user));
  },

  "readFolder": function (path) {
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

  "countUsers": function () {
    return fs.readdirSync('./users/json/').length;
  },

  "getUserEmails": function () {
    const usersJsonPath = './users/json/'
    let emailArray = [];
    let filesArray = fs.readdirSync(usersJsonPath);

    for (let i in filesArray) {
      let path = usersJsonPath + filesArray[i];
      let userJson = JSON.parse(fs.readFileSync(path));
      emailArray.push(userJson.details.emailAddress);
    }
    return emailArray;
  }

}

module.exports = utils;