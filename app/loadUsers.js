'use strict';

const fs = require('fs');
const usersJsonPath = './users/json/';
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const utils = require('./utils');
const path = require('path');


function loadUser(user) {
  for (let funcName in proto) {
    console.log(funcName)
  }
}

function reviveAll() {
  let usersArray = [];
  let filesArray = fs.readdirSync(usersJsonPath);

  for (let i in filesArray) {
    let path = usersJsonPath + filesArray[i];
    let user = JSON.parse(fs.readFileSync(path));
    
    usersArray.push(user);
  }
  return usersArray;
}

reviveAll();
module.exports = loadUser;


var proto = {
    //initialize authentication and save file path
    init: function () {
      let that = this;
      let secret = this._readSecret();
      // Authorize a client with the loaded credentials, then call the Drive API.
      this._authorize(secret, getDetailsAndCreateFolder);

      function getDetailsAndCreateFolder(auth) {
        if (!that.email) {
          let service = google.drive('v3');
          service.about.get({
            auth: auth,
            fields: 'user'
          }, function (err, response) {
            if (err) {
              console.log('Get user email returned an error: ' + err);
              return;
            }
            that.details = response.user;
            if (!that.file_dir) {
              let config = utils.readConfig();
              that.file_dir = path.resolve(config.path, that.details.emailAddress.toString());
              utils.readFolder(that.file_dir);
            }
            if (that._checkExistence()) {
              return console.log("User already exists!");
            } else {
              utils.saveUser(that);
              console.log("Succeessfully load user: " + that.details.emailAddress + ".");
            }
            that.sync();
          });
        }
      }
    }
  }
  //sync
sync: function () {
  this._authorize(this._readSecret(), sync_callback);

  function sync_callback(auth) {
    let service = google.drive('v3');
    service.files.list({
      pageSize: "1000",
      orderBy: "modifiedTime desc,createdTime desc"
    }, function (err, response) {
      if (err) {
        return console.log('Get user file list error: ' + err);
      }
      console.log(response);
    })
  }
}

//check if this email already exists
_checkExistence: function () {
  let emailArray = utils.getUserEmails();
  for (let i in emailArray) {
    if (emailArray[i] == this.details.emailAddress) return true;
  }
  return false;
}

//read client_secret.json and return as js object
_readSecret: function () {
  try {
    let secret = fs.readFileSync('./config/client_secret.json');
    return JSON.parse(secret);
  } catch (e) {
    console.log("Read client_secret error: ", e);
  }
}

//create an OAuth2 client, then execute the callback
_authorize: function (credentials, callback) {
  console.log('Require account authentication...');
  let clientSecret = credentials.installed.client_secret;
  let clientId = credentials.installed.client_id;
  let redirectUrl = credentials.installed.redirect_uris[0];
  let auth = new googleAuth();
  let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
  // Check if we have previously stored a token.
  if (!this.token) {
    this._getNewToken(oauth2Client, callback);
  } else {
    oauth2Client.credentials = this.token;
    callback(oauth2Client);
  }
}

// get new token
_getNewToken: function (oauth2Client, callback) {
  let that = this;
  console.log('Get new account token...');
  let authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: this.SCOPES
  });
  console.log('Authorize this app by visiting this url:', '\n' + authUrl);
  let code = utils.question('Enter the code from that page here: ');
  oauth2Client.getToken(code, function (err, token) {
    if (err) {
      console.log('Error while trying to retrieve access token', err);
      return;
    }
    oauth2Client.credentials = token;
    that.token = token;
    callback(oauth2Client);
  });
}