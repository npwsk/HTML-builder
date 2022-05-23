const fsp = require('fs/promises');
const fs = require('fs');
const path = require('path');

const DEST_FOLDER_NAME = 'project-dist';

const copyChildNodes = async (node, parents, { src, dest }) => {
  const srcPath = path.resolve(src, ...parents, node.name);
  const destPath = path.resolve(dest, ...parents, node.name);

  if (node.isFile()) {
    fsp.copyFile(srcPath, destPath);
    return;
  }

  await fsp.mkdir(destPath, { recursive: true });

  const childNodes = await fsp.readdir(srcPath, { withFileTypes: true });

  Promise.all(
    childNodes.map((childNode) => copyChildNodes(childNode, [...parents, node.name], { src, dest }))
  );
};

const copyDir = async (srcFolder, destFolder) => {
  const srcFolderPath = path.resolve(__dirname, srcFolder);
  const destFolderPath = path.resolve(__dirname, destFolder);

  await fsp.rm(destFolderPath, { recursive: true, force: true });

  await fsp.mkdir(destFolderPath, { recursive: true });

  const childNodes = await fsp.readdir(srcFolderPath, { withFileTypes: true });

  Promise.all(
    childNodes.map((node) =>
      copyChildNodes(node, [], {
        src: srcFolderPath,
        dest: destFolderPath,
      })
    )
  );
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

const mergeCss = async (srcFolder, dest) => {
  let childNodes = await fsp.readdir(srcFolder, { withFileTypes: true });

  const checkIfFooter = (node) => node.name.toLocaleLowerCase() === 'footer.css';
  const footer = childNodes.find(checkIfFooter);
  if (footer) {
    childNodes = [...childNodes.filter((node) => !checkIfFooter(node)), footer];
  }

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
