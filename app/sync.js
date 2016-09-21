const usersArray = require('./reviveUsers.js')();
const fs = require('fs');
const spaces = ["drive"];
const FileTree = require('./FileTree.js');

const targetIDs = process.argv.slice(2);
if (targetIDs.length != 0) {
  targetIDs.forEach(ID => {
    let user = usersArray[ID];
    if (!user)
      return console.log("Can't find target user: " + ID);
    if (!user.enable_sync)
      return console.log("User " + user.details.emailAddress + " has disableb sync.");;
    console.log('User: "' + user.details.emailAddress + '" will begin to sync.');
    user.getFileArray(traverseFiles);
  });
} else {
  console.log("Files of all users who enabled sync will be synchronized.")
  for (let i in usersArray) {
    let user = usersArray[i];
    if (!user.enable_sync)
      return console.log("User " + user.details.emailAddress + " has disableb sync.");;
    console.log('User: "' + user.details.emailAddress + '" will begin to sync.');
    user.getFileArray(traverseFiles);
  }
}

function traverseFiles(fileList) {
  let filteredList = filterSpaces();
  console.log(new FileTree(filteredList));

  function filterSpaces() {
    return fileList.filter(x => x.ownedByMe && hasDrive(x.spaces));

    function hasDrive(spaces) {
      for (let i of spaces) {
        if (i == 'drive') return true;
      }
      return false;
    }
  }


}