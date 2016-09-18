#!/usr/bin/env node

const exec = require('child_process').exec;

let args = process.argv.map(arg => arg.trim()).slice(2);

if (args[0] == 'clean') {
  exec('./clean.sh', (err, cmlout, cmlerr) => {
    if (err)
      throw err;
    if (cmlerr)
      console.error(cmlerr);
    console.log(cmlout);
  });
}

if (args[0] == 'test' && args[1] == 'revive') {
  exec('node ./app/reviveUsers.js', (err, cmlout, cmlerr) => {
    if (err)
      throw err;
    if (cmlerr)
      console.error(cmlerr);
    console.log(cmlout);
  });
}

if (args[0] == 'test' && args[1] == 'add') {
  exec('node ./app/createUser.js', (err, cmlout, cmlerr) => {
    if (err)
      throw err;
    if (cmlerr)
      console.error(cmlerr);
    console.log(cmlout);
  });
}