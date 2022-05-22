const fsp = require('fs/promises');
const fs = require('fs');
const path = require('path');

const DEST_FOLDER_NAME = 'project-dist';

const copyChildNodes = async (node, parents = [], { srcPath, destPath }) => {
  const srcNodePath = path.resolve(srcPath, ...parents, node.name);
  const destNodePath = path.resolve(destPath, ...parents, node.name);

  if (node.isFile()) {
    fsp.copyFile(srcNodePath, destNodePath);
    return;
  }

  await fsp.mkdir(destNodePath, { recursive: true });

  const childNodes = await fsp.readdir(srcNodePath, { withFileTypes: true });

  for (const childNode of childNodes) {
    await copyChildNodes(childNode, [...parents, node.name], { srcPath, destPath });
  }
};

const copyDir = async (srcPath, destPath) => {
  try {
    await fsp.rm(destPath, { recursive: true }).catch(() => {});

    await fsp.mkdir(destPath, { recursive: true });

    const childNodes = await fsp.readdir(srcPath, { withFileTypes: true });

    for (const node of childNodes) {
      await copyChildNodes(node, [], { srcPath, destPath });
    }
  } catch (e) {
    console.log(e);
  }
};

const combineHtml = async (templatePath, componentsPath, destPath) => {
  const htmlTemplate = await fsp.readFile(templatePath, 'utf-8');

  const componentNodes = await fsp.readdir(componentsPath, {
    withFileTypes: true,
  });
  const components = {};

  for (const node of componentNodes) {
    const { ext, name } = path.parse(node.name);
    if (node.isDirectory()) {
      continue;
    }
    if (ext.toLowerCase() !== '.html') {
      continue;
    }
    const componentPath = path.resolve(componentsPath, node.name);
    const comp = await fsp.readFile(componentPath, 'utf-8');

    components[name] = comp;
  }

  const html = htmlTemplate.replace(/{{(.+)}}/g, (_match, p1) => components[p1]);

  await fsp.writeFile(destPath, html);
};

const mergeCss = async (srcPath, destPath) => {
  const writeStream = fs.createWriteStream(destPath);
  const childNodes = await fsp.readdir(srcPath, { withFileTypes: true });

  for (const childNode of childNodes) {
    if (childNode.isFile() && path.extname(childNode.name) === '.css') {
      const srcFilePath = path.resolve(srcPath, childNode.name);
      const readStream = fs.createReadStream(srcFilePath);

      readStream.pipe(writeStream);
    }
  }
};

(async () => {
  const destFolderPath = path.resolve(__dirname, DEST_FOLDER_NAME);
  await fsp.mkdir(destFolderPath).catch(() => {});

  const templatePath = path.resolve(__dirname, 'template.html');
  const componentsPath = path.resolve(__dirname, 'components');
  const destHtmlPath = path.resolve(destFolderPath, 'index.html');
  await combineHtml(templatePath, componentsPath, destHtmlPath);

  const srcCssPath = path.resolve(__dirname, 'styles');
  const destCssPath = path.resolve(destFolderPath, 'style.css');
  await mergeCss(srcCssPath, destCssPath);

  const srcAssetsPath = path.resolve(__dirname, 'assets');
  const destAssetsPath = path.resolve(destFolderPath, 'assets');
  await copyDir(srcAssetsPath, destAssetsPath);
})();
