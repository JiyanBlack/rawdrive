class FileTree {
  constructor(fileArray) {
    this.fileArray = fileArray;
    this.root = null; //if root ==null means no subdirectories exist
    this.folderMap = new Map(); // only has folders
    this.pathMap = new Map(); // Map(id => actual path)
    this.fileMap = new Map(); //Map(id => original json + path)
    this.md5Map = new Map();
    this._findRoot();
    this._parseFolder();
    this._getFilesMap();
  }

  _findRoot() {
    const parentsSet = new Set();
    const folderSet = new Set();
    const roots = [];
    // get the ids of parents and folders
    for (let file of this.fileArray) {
      if (file.mimeType === "application/vnd.google-apps.folder") {
        parentsSet.add(...file.parents);
        folderSet.add(file.id);
        this
          .folderMap
          .set(file.id, file);
      }
    }
    // get find the ids in parentSet but not in folderSet(root candidate)
    for (let parentId of parentsSet) {
      if (!folderSet.has(parentId)) {
        roots.push(parentId);
      }
    }
    //check whether if only one root exists
    if (roots.length > 1) 
      throw new Error('Multiple roots!');
    if (roots.length == 1) 
      this.root = roots[0];
      // console.log(this.root);
    }
  
  _parseFolder() {
    const that = this;
    for (let folderId of this.folderMap.keys()) {
      this
        .pathMap
        .set(folderId, getPathString(folderId, ""));
    }
    this
      .pathMap
      .set(this.root, "/");
    function getPathString(id, folderPath) {
      if (!that.root || id == that.root) {
        return folderPath;
      } else {
        let currentFolder = that
          .folderMap
          .get(id);
        return getPathString(currentFolder.parents[0], folderPath) + '/' + currentFolder.name;
      }
    }
  }

  _getFilesMap() {
    for (let file of this.fileArray) {
      file.path = []
      file
        .parents
        .forEach((parent) => {
          file
            .path
            .push(this.pathMap.get(parent))
        });
      this
        .fileMap
        .set(file.id, file);
      this
        .md5Map
        .set(file.md5Checksum, file);
    }
  }

}

module.exports = FileTree;