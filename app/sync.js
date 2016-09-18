let usersArray = require('./reviveUsers.js')();
const targetIDs = process.argv.slice(2);
if (targetIDs.length != 0) {
  console.log("Files of these uses will be synchronized: ");
  targetIDs.forEach(ID => {
    let user = usersArray[ID];
    console.log(user.details.emailAddress);
    user.sync();
  });

} else {
  console.log("All files of users who enabled sync will be synchronized.")

}