const usersArray = require('./reviveUsers.js')();
const fs = require('fs');

const targetIDs = process
  .argv
  .slice(2);
if (targetIDs.length != 0) {
  targetIDs.forEach(ID => {
    let user = usersArray[ID];
    if (!user) 
      return console.log("Can't find target user: " + ID);
    if (!user.enable_sync) 
      return console.log("User " + user.details.emailAddress + " has disableb sync.");;
    console.log('User: "' + user.details.emailAddress + '" will begin to sync.');
    user.sync();
  });
} else {
  console.log("Files of all users who enabled sync will be synchronized.")
  for (let i in usersArray) {
    let user = usersArray[i];
    if (!user.enable_sync) 
      return console.log("User " + user.details.emailAddress + " has disableb sync.");;
    console.log('User: "' + user.details.emailAddress + '" will begin to sync.');
    user.sync();
  }
}
