/*
command:
list -- all accounts
global variable:
    SAVE_DIR=
    account_number
    TOKEN_PATH
save dir:
    /save_dir/accountName1
    /save_dir/accountName2

class UserAccount()
    authentication_path=
    saved_path=
    authorize
    getNewToken
    storeToken
    listFiles

*/

let User = require('./app/User.js');

let user = new User(1);
user.initial();
