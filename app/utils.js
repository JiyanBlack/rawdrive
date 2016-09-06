const fs = require('fs');
const readlineSync = require('readline-sync');
const path = require('path');

const utils = {

  "readConfig": function () {
    return JSON.parse(fs.readFileSync('./config/config.json'));
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

}

module.exports = utils;