const fs = require('fs');
const crypto = require('crypto');
const BUFFER_SIZE = 8192;

function md5FileSync(filename) {
    var fd = fs.openSync(filename, 'r');
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

module.exports = md5FileSync;