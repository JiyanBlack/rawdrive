/*
command:
list -- all accounts
global variable:
    SAVE_DIR=
    account_number
    TOKEN_PATH
save dir:
    /save_dir/accountName1
    /save_dir/accountName2

class UserAccount()
    authentication_path=
    saved_path=
    authorize
    getNewToken
    storeToken
    listFiles

*/

const decache = require('decache');
const User = require('./User.js');
const fs = require('fs');
const utils = require('./utils.js');
const path = require('path');

let config = utils.readConfig();

function main() {
  initFolder();
  createUser();
}
main();

function initFolder() {
  if (!config) config = {};
  if (!config.path) {
    let answer = utils.question("Set the google drive folder path, default is App/googleDrive folder:")
    if (answer.length > 0) {
      config.path = path.resolve(answer);
    } else {
      config.path = path.resolve("../googleDrive");
      utils.saveConfig(config);
      utils.readFolder(config.path);
    }
  }
}

function createUser() {
  userNumber = utils.countUsers();
  let user = new User(userNumber + 1);
  user.init();
}


decache('./app/User.js');
decache('./app/utils.js');