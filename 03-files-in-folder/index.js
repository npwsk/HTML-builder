const fs = require('fs/promises');
const path = require('path');

const FOLDER_NAME = 'secret-folder';
const FOLDER_PATH = path.resolve(__dirname, FOLDER_NAME);

(async () => {
  try {
    const objects = await fs.readdir(FOLDER_PATH, { withFileTypes: true });

    const files = objects.filter((obj) => obj.isFile());

    for (const file of files) {
      const ext = path.extname(file.name);
      const name = path.basename(file.name, ext);
      const stats = await fs.stat(path.resolve(FOLDER_PATH, file.name));
      console.log(`${name} - ${ext.slice(1)} - ${stats.size}b`);
    }
  } catch (e) {
    console.log(e);
  }
})();
