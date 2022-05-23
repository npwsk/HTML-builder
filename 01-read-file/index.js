const fs = require('fs');
const path = require('path');

const textFilePath = path.resolve(__dirname, 'text.txt');

const readableStream = new fs.ReadStream(textFilePath);

readableStream.pipe(process.stdout);
