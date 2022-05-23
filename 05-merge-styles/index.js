const fs = require('fs');
const path = require('path');

const SRC_FOLDER_NAME = 'styles';
const DEST_FOLDER_NAME = 'project-dist';
const DEST_FILE_NAME = 'bundle.css';

const srcFolderPath = path.resolve(__dirname, SRC_FOLDER_NAME);
const destPath = path.resolve(__dirname, DEST_FOLDER_NAME, DEST_FILE_NAME);

const mergeCss = async (srcFolder, dest) => {
  const childNodes = await fs.promises.readdir(srcFolder, { withFileTypes: true });

  const writeStream = fs.createWriteStream(dest);

  for (const childNode of childNodes) {
    const isCss = path.extname(childNode.name).toLocaleLowerCase() === '.css';

    if (childNode.isFile() && isCss) {
      const srcFilePath = path.resolve(srcFolder, childNode.name);
      const readStream = fs.createReadStream(srcFilePath);

      readStream.pipe(writeStream);
    }
  }
};

mergeCss(srcFolderPath, destPath);
