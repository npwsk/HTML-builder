const fs = require('fs/promises');
const path = require('path');

const SRC_FOLDER_NAME = 'files';
const DEST_FOLDER_NAME = 'files-copy';

const srcFolderPath = path.resolve(__dirname, SRC_FOLDER_NAME);
const destFolderPath = path.resolve(__dirname, DEST_FOLDER_NAME);

const copyChildNodes = async (node, parents = []) => {
  const srcPath = path.resolve(srcFolderPath, ...parents, node.name);
  const destPath = path.resolve(destFolderPath, ...parents, node.name);

  if (node.isFile()) {
    fs.copyFile(srcPath, destPath);
    return;
  }

  await fs.mkdir(destPath, { recursive: true });

  const childNodes = await fs.readdir(srcPath, { withFileTypes: true });

  for (const childNode of childNodes) {
    await copyChildNodes(childNode, [...parents, node.name]);
  }
};

(async () => {
  try {
    await fs.rm(destFolderPath, { recursive: true }).catch(() => {});

    await fs.mkdir(destFolderPath, { recursive: true });

    const childNodes = await fs.readdir(srcFolderPath, { withFileTypes: true });

    for (const node of childNodes) {
      await copyChildNodes(node, []);
    }
  } catch (e) {
    console.log(e);
  }
})();
