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
const config = utils.readConfig();
const path = require('path');

function main() {
  initFolder();
  createUser();
  utils.saveConfig(config);
}
main();

function initFolder() {
  if (!config.path) {
    let answer = utils.question("Set the google drive folder path, default is App/googleDrive folder:")
    if (answer.length > 0) {
      config.path = path.resolve(answer);
    } else {
      config.path = path.resolve("../googleDrive");
      if (!fs.statSync(config.path).isDirectory()) fs.mkdirSync(config.path);
    }
  }
}

function createUser() {
  if (!config.userNumber) config.userNumber = 0;
  let user = new User(config.userNumber+1);
  user.init();
  config.userNumber += 1;
  utils.saveUser(user);
}


decache('./app/User.js');
decache('./app/utils.js');