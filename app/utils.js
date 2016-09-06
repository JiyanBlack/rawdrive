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


}

module.exports = utils;