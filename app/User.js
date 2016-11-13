'use strict';

//npm modules
const fs = require('fs');
const google = require('googleapis');
const crypto = require('crypto');
const path = require('path');
const reviver = require('class-reviver');
const googleAuth = require('google-auth-library');
//local modules
const utils = require('./utils');
const FileTree = require('./FileTree.js');
//constant variables
const spaces = ["drive"];
const BUFFER_SIZE = 8192;

class User {
  constructor(ID) {
    this.ID = ID;
    this.details = null;
    //    details= {   "kind": "drive#user",   "displayName": "YAN JI", "photoLink":
    // "https://lh4.goog... user icon",   "me": true,   "permissionId":
    // "08608203340358885075",   "emailAddress": "rglsm7655558@gmail.com"  }
    this.token = null;
    this.lastModifiedTime = null;
    this.SCOPES = ["https://www.googleapis.com/auth/drive"];
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
        service
          .about
          .get({
            auth: auth,
            fields: 'user'
          }, function (err, response) {
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

  sync(callback) {
    this.getLocalFiles((md5FileMap) => {
      this.getFileArray((fileList) => {
        fs.writeFileSync('./sample.json', JSON.stringify(fileList, null, 2));
        let filteredList = filterSpaces();
        const tree = new FileTree(filteredList);
        diffFiles(tree, md5FileMap);
        function filterSpaces() {
          return fileList.filter(x => x.ownedByMe && hasDrive(x.spaces));

          function hasDrive(spaces) {
            for (let i of spaces) {
              if (i == 'drive') 
                return true;
              }
            return false;
          }
        }
      });

    });

    function diffFiles(tree, md5FileMap) {
      //get local files info
      const updates = {
        'download': undefined,
        'upload': undefined,
        'delete': undefined,
        'localCopy': undefined
      };
      console.log(md5FileMap);
    }
  }
  //sync
  getFileArray(callback) {
    let that = this;
    this._authorize(this._readSecret(), listFiles);
    let allFiles = [];

    function listFiles(auth, PageToken) {
      let service = google.drive('v3');
      let listFileds = "files(createdTime,id,md5Checksum,mimeType,modifiedTime,name,ownedByMe,parents,sp" +
          "aces,version),nextPageToken";

      service
        .files
        .list({
          auth: auth,
          pageSize: "1000",
          pageToken: PageToken || "",
          q: "trashed=false",
          fields: listFileds
        }, function (err, response) {
          if (err) 
            return console.log('Get user file list error: ' + err);
          if (response) {
            allFiles = allFiles.concat(response.files);
            if (response.nextPageToken) 
              listFiles(auth, response.nextPageToken);
            else 
              callback(allFiles);
            return console.log("Get " + allFiles.length + " files for " + that.details.emailAddress);
          } else {
            throw Error("Invalid file-list response.");
          }
        });
    }
  }

  //downloadFile
  download(fileArray) {
    this._authorize(this._readSecret(), () => {});
  }

  getLocalFiles(callback) {
    //get md5-filePath map
    const md5FileMap = new Map();
    recurse(this.file_dir, md5FileMap);

    function recurse(curPath, md5FileMap) {
      let thisFiles = fs.readdirSync(curPath);
      for (let file of thisFiles) {
        let filePath = path.resolve(curPath, file);
        let fsStat = fs.statSync(filePath);
        if (fsStat.isDirectory()) {
          return recurse(filePath, md5FileMap);
        } else {
          let md5Value = md5FileSync(filePath);
          if (!md5FileMap.has(md5Value)) 
            md5FileMap.set(md5Value, {
              'path': [curPath],
              'name': file,
              'md5': md5Value
            });
          else 
            md5FileMap
              .get(md5Value)
              .path
              .push(curPath);
          }
        }
    }
    function md5FileSync(filePath) {
      var fd = fs.openSync(filePath, 'r');
      var hash = crypto.createHash('md5');
      var buffer = new Buffer(BUFFER_SIZE);

      try {
        var bytesRead;

        do {
          bytesRead = fs.readSync(fd, buffer, 0, BUFFER_SIZE);
          hash.update(buffer.slice(0, bytesRead));
        } while (bytesRead === BUFFER_SIZE)
      } finally {
        fs.closeSync(fd);
      }

      return hash.digest('hex');
    }
    callback(md5FileMap);
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
    let authUrl = oauth2Client.generateAuthUrl({access_type: 'offline', scope: this.SCOPES});
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

}
module.exports = User;