const path = require('path');
const fs = require('fs/promises');

const FOLDER_NAME = 'secret-folder';

const printFilesStats = async () => {
  const folderPath = path.resolve(__dirname, FOLDER_NAME);

  const objects = await fs.readdir(folderPath, { withFileTypes: true });

  const files = objects.filter((obj) => obj.isFile());

  const filesStats = files.map((file) => {
    const { ext, name } = path.parse(file.name);
    const filePath = path.resolve(folderPath, file.name);
    const stats = fs.stat(filePath);
    return Promise.all([name, ext, stats]);
  });

  Promise.all(filesStats).then((responses) =>
    responses.forEach(([name, ext, stats]) =>
      console.log(`${name} - ${ext.slice(1)} - ${stats.size}b`)
    )
  );
};

printFilesStats();
