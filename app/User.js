'use strict';

const fs = require('fs');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const utils = require('./utils');
const path = require('path');
const reviver = require('class-reviver');

class User {
  constructor(ID) {
    this.ID = ID;
    this.details = null;
    //    details= {
    //   "kind": "drive#user",
    //   "displayName": "YAN JI",
    //   "photoLink": "https://lh4.goog... user icon",
    //   "me": true,
    //   "permissionId": "08608203340358885075",
    //   "emailAddress": "rglsm7655558@gmail.com"
    //  }
    this.token = null;
    this.lastModifiedTime = null;
    this.SCOPES = [
      "https://www.googleapis.com/auth/drive",
    ];
    this.file_dir = null;
    this.enable_sync = true;
  }

  //initialize user information
  init() {
    let that = this;
    let secret = this._readSecret();
    this._authorize(secret, getDetailsAndCreateFolder);

    function getDetailsAndCreateFolder(auth) {
      if (!that.email) {
        let service = google.drive('v3');
        service.about.get({
          auth: auth,
          fields: 'user'
        }, function(err, response) {
          if (err) {
            return console.log('Get user email returned an error: ' + err);
          }
          that.details = response.user;
          if (!that.file_dir) {
            let config = utils.readConfig();
            that.file_dir = path.resolve(config.path, that.details.emailAddress.toString());
            utils.readFolder(that.file_dir);
          }
          let existingUser = utils.checkEmail(that.details.emailAddress);
          if (existingUser !== null && existingUser.ID != that.ID) {
            console.log("User already exists, user information will be updated.");
            that.ID = existingUser.ID;
          } else {
            console.log("Succeessfully get user: " + that.details.emailAddress + ".");
          }
          utils.saveUserJson(that);
        });
      }
    }
  }

  //sync
  getFileArray(callback) {
    this._authorize(this._readSecret(), listFiles);
    let allFiles = [];

    function listFiles(auth, PageToken) {
      let service = google.drive('v3');
      service.files.list({
        auth: auth,
        pageSize: "1000",
        pageToken: PageToken || "",
        q: "trashed=false",
        fields: "files(createdTime,id,md5Checksum,mimeType,modifiedTime,name,parents,version,webContentLink),nextPageToken"
      }, function(err, response) {
        if (err)
          return console.log('Get user file list error: ' + err);
        if (response) {
          allFiles = allFiles.concat(response.files);
          if (response.nextPageToken)
            listFiles(auth, response.nextPageToken);
          else
            callback(allFiles);
          return console.log("Get " + allFiles.length + " files.");
        } else {
          throw Error("Invalid file-list response.");
        }
      });
    }
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

  //create an OAuth2 client, then execute the callback
  _authorize(credentials, callback) {
    let clientSecret = credentials.installed.client_secret;
    let clientId = credentials.installed.client_id;
    let redirectUrl = credentials.installed.redirect_uris[0];
    let auth = new googleAuth();
    let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    // Check if we have previously stored a token.
    if (this.token == null) {
      this._getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = this.token;
      callback(oauth2Client);
    }
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
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      that.token = token;
      callback(oauth2Client);
    });
  }

}
module.exports = User;