'use strict';

const fs = require('fs');
const readline = require('readline');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const utils = require('./utils');
const path = require('path');

class User {
  constructor(ID) {
    this.ID = ID;
    this.TOKEN_DIR = "./users/tokens/";
    this.SCOPES = ['https://www.googleapis.com/auth/drive'];
    this.file_dir = null;
    this.enable_sync = true;
    this.TOKEN_PATH = this.TOKEN_DIR + this.ID + ".json";
  }

  //initialize authentication and save file path
  init() {
    console.log('Initializing account...');
    fs.readFile('./config/client_secret.json', (err, content) => {
      if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
      }
      // Authorize a client with the loaded credentials, then call the Drive API.
      this._authorize(JSON.parse(content), function () {
        console.log("Authentication succeed  ~^_^~");
      });
    });
    if (!this.file_dir) {
      this.file_dir = path.resolve(utils.readConfig().path,'/'+this.ID.toString());
    }
  }

  //sync
  sync() {

  }

  //create an OAuth2 client, then execute the callback
  _authorize(credentials, callback) {
    console.log('Require account authentication...');
    let clientSecret = credentials.installed.client_secret;
    let clientId = credentials.installed.client_id;
    let redirectUrl = credentials.installed.redirect_uris[0];
    let auth = new googleAuth();
    let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    // Check if we have previously stored a token.
    fs.readFile(this.TOKEN_PATH, (err, token) => {
      if (err) {
        this._getNewToken(oauth2Client, callback);
      } else {
        oauth2Client.credentials = JSON.parse(token);
        callback(oauth2Client);
      }
    });
  }

  // get new token
  _getNewToken(oauth2Client, callback) {
    let that = this;
    console.log('Get new account token...');
    let authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.SCOPES
    });
    console.log('Authorize this app by visiting this url:', '\n' + authUrl);
    let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function (code) {
      rl.close();
      oauth2Client.getToken(code, function (err, token) {
        if (err) {
          console.log('Error while trying to retrieve access token', err);
          return;
        }
        oauth2Client.credentials = token;
        that._storeToken(token);
        callback(oauth2Client);
      });
    });
  }

  //store the token
  _storeToken(token) {
    console.log('Storing new token...');
    try {
      fs.mkdirSync(this.TOKEN_DIR);
    } catch (err) {
      if (err.code != 'EEXIST') {
        throw err;
      }
    }
    fs.writeFile(this.TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + this.TOKEN_PATH);
  }
}
module.exports = User;