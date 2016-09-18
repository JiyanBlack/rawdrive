let usersArray = require('./reviveUsers.js')();
const targetIDs = process.argv.slice(2);
if (targetIDs.length != 0) {
  targetIDs.forEach(ID => {
    let user = usersArray[ID];
    if (!user) return console.log("Can't find target user: " + ID);
    if (!user.enable_sync) return console.log("User " + user.details.emailAddress + " has disableb sync.");;
    console.log('User: "' + user.details.emailAddress + '" will begin to sync.');
    user.getFileArray(traverseFiles);
  });
} else {
  console.log("Files of all users who enabled sync will be synchronized.")
  for (let i in usersArray) {
    let user = usersArray[i];
    if (!user.enable_sync) return console.log("User " + user.details.emailAddress + " has disableb sync.");;
    console.log('User: "' + user.details.emailAddress + '" will begin to sync.');
    user.getFileArray(traverseFiles);
  }
}

function traverseFiles(fileList) {
  console.log(fileList);
}