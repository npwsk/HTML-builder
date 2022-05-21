const fsp = require('fs/promises');
const fs = require('fs');
const path = require('path');

const SRC_FOLDER_NAME = 'styles';
const DEST_FOLDER_NAME = 'project-dist';
const DEST_FILE_NAME = 'bundle.css';

const srcFolderPath = path.resolve(__dirname, SRC_FOLDER_NAME);
const destPath = path.resolve(__dirname, DEST_FOLDER_NAME, DEST_FILE_NAME);

(async () => {
  const writeStream = fs.createWriteStream(destPath);
  const childNodes = await fsp.readdir(srcFolderPath, { withFileTypes: true });

  for (const childNode of childNodes) {
    if (childNode.isFile() && path.extname(childNode.name) === '.css') {
      const srcFilePath = path.resolve(srcFolderPath, childNode.name);
      const readStream = fs.createReadStream(srcFilePath);

      readStream.pipe(writeStream);
    }
  }
})();
