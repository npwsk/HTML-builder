const fs = require('fs');
const path = require('path');

const textFilePath = path.resolve(__dirname, 'text.txt');

const readableStream = fs.createReadStream(textFilePath);

readableStream.pipe(process.stdout);
