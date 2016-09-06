'use strict';

const fs = require('fs');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const utils = require('./utils');
const path = require('path');

class User {
  constructor(ID) {
    this.ID = ID;
    this.name = null;
    this.TOKEN_DIR = path.resolve("./users/tokens/");
    this.SCOPES = ['https://www.googleapis.com/auth/drive'];
    this.file_dir = null;
    this.enable_sync = true;
    this.JSON_PATH = path.resolve("./users/json/", this.id + ".json");
    this.TOKEN_PATH = path.resolve(this.TOKEN_DIR, this.ID + ".json");
  }

  //initialize authentication and save file path
  init() {
    let that = this;
    let secret = this._readSecret();
    // Authorize a client with the loaded credentials, then call the Drive API.
    this._authorize(secret, function (auth) {
      console.log("Authentication succeed  ~^_^~");
      let config = that._readConfig();
      if (!that.file_dir) {
        that.file_dir = path.resolve(config.path, that.ID.toString());
        utils.readFolder(that.file_dir);
      }
      utils.saveUser(that);
      config.userNumber += 1;
      utils.saveConfig(config);
    });

  }

  //sync
  sync() {
    let auth = _readToken();
    let service = google.drive('v3');
    service.files.list({
      auth: auth,
      pageSize: 10,
      fields: "nextPageToken, files(id, name)"
    }, function (err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      }
      let files = response.files;
      if (files.length == 0) {
        console.log('No files found.');
      } else {
        console.log('Files:');
        for (let i = 0; i < files.length; i++) {
          let file = files[i];
          console.log('%s (%s)', file.name, file.id);
        }
      }
    });
  }

  //read client_secret.json and return as js object
  _readSecret() {
    try {
      let secret = fs.readFileSync('./config/client_secret.json');
      return JSON.parse(secret);
    } catch (e) {
      console.log("Read client_secret error: ", e);
    }
  }

  //read config
  _readConfig() {
    return JSON.parse(fs.readFileSync('./config/config.json'));
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
    let code = utils.question('Enter the code from that page here: ');
    oauth2Client.getToken(code, function (err, token) {
      if (err) {
        let config = that._readConfig();
        config.userNumber -= 1;
        utils.saveConfig(config);
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      that._storeToken(token);
      callback(oauth2Client);
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

  //read the token
  _readToken() {
    return JSON.parse(fs.readFileSync(this.TOKEN_PATH));
  }
}
module.exports = User;