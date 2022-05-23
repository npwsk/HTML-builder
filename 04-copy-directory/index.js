const path = require('path');
const fs = require('fs/promises');

const SRC_FOLDER_NAME = 'files';
const DEST_FOLDER_NAME = 'files-copy';

const copyChildNodes = async (node, parents, { src, dest }) => {
  const srcPath = path.resolve(src, ...parents, node.name);
  const destPath = path.resolve(dest, ...parents, node.name);

  if (node.isFile()) {
    fs.copyFile(srcPath, destPath);
    return;
  }

  await fs.mkdir(destPath, { recursive: true });

  const childNodes = await fs.readdir(srcPath, { withFileTypes: true });

  Promise.all(
    childNodes.map((childNode) => copyChildNodes(childNode, [...parents, node.name], { src, dest }))
  );
};

const copyDir = async (srcFolder, destFolder) => {
  const srcFolderPath = path.resolve(__dirname, srcFolder);
  const destFolderPath = path.resolve(__dirname, destFolder);

  await fs.rm(destFolderPath, { recursive: true, force: true });

  await fs.mkdir(destFolderPath, { recursive: true });

  const childNodes = await fs.readdir(srcFolderPath, { withFileTypes: true });

  Promise.all(
    childNodes.map((node) =>
      copyChildNodes(node, [], {
        src: srcFolderPath,
        dest: destFolderPath,
      })
    )
  );
};

copyDir(SRC_FOLDER_NAME, DEST_FOLDER_NAME);
