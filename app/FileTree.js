const fs = require('fs');

class FileTree {
  constructor(fileArray) {
    this.fileArray = fileArray;
    //main API of this class:
    this.folders = []; // array of folders Json
    this.files = []; //array of files Json
    this.root = null; //root drive folder id
    this.tree = new Map(); //folderMap + fileMap
    this.folderMap = new Map(); //{id => folderJson}
    this.pathMap = new Map(); //{id => '/usr/desktop'..}
    this.fileMap = new Map(); //{id => {id,path,mimeType...}}
    //end of API
    this._findFolders();
    this._findRoot();
    this._buildFolderMap();
    this._buildTree();
  }

  _buildTree() {
    for (let item of this.folders) {
      this.pathMap.set(item.id, this._findPath(item));
    }
    this.pathMap.set(this.root, '/');
    let pathSet = new Set();
    for (let i of this.pathMap.values()) {
      if (pathSet.has(i)) throw new Error('Single path with different drive ids!' + i);
      else pathSet.add(i);
    }
    for (let item of this.files) {
      item.path = item.parents.map(p => this.pathMap.get(p));
      this.fileMap.set(item.id, item);
    }
    for (let [key, value] of this.folderMap) {
      value.path = value.parents.map(p => this.pathMap.get(p));
      this.folderMap.set(key, value);
    }
    this.tree = new Map([...this.fileMap, ...this.folderMap]);
  }

  _findPath(folder) {
    if (folder.parents[0] == this.root) return '/' + folder.name + '/';
    else {
      let parFolder = this.folderMap.get(folder.parents[0]);
      return this._findPath(parFolder) + folder.name + '/';
    }
  }

  _buildFolderMap() {
    for (let folder of this.folders) {
      this.folderMap.set(folder.id, folder);
    }
  }

  _findFolders() {
    let folders = [];
    let files = [];
    for (let i in this.fileArray) {
      if (this.fileArray[i].mimeType == 'application/vnd.google-apps.folder')
        folders.push(this.fileArray[i]);
      else
        files.push(this.fileArray[i]);
    }
    this.folders = folders;
    this.files = files;
  }

  _findRoot() {
    let allFolderIds = new Set();
    this.folders.map(folder => { allFolderIds.add(folder.id) });
    let allParentIds = new Set();
    this.folders.forEach(folder => { folder.parents.forEach(parent => allParentIds.add(parent)) });
    let rootFolderSet = new Set([...allParentIds].filter(x => !allFolderIds.has(x)));
    if (rootFolderSet.size != 1) throw Error('Multiple root folder entries.');
    for (let i of rootFolderSet)
      this.root = i;
  }

  _isEmpty(ary) {
    for (let i in ary) {
      if (ary[i] != 'null') return false;
    }
    return true;
  }
}

module.exports = FileTree;