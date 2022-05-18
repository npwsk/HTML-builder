const readline = require('readline');
const fs = require('fs');
const path = require('path');

const outFilePath = path.join(__dirname, 'output.txt');

// await fs.writeFile(outFilePath);

const writeStream = fs.createWriteStream(outFilePath);

const rl = readline.createInterface(process.stdin, process.stdout);

const handleExit = () => {
  process.stdout.write('Goodbye!\n');
  rl.close();
  writeStream.close();
};

rl.question('Enter any text: ', (data) => {
  if (data === 'exit') {
    handleExit();
    return;
  }
  writeStream.write(data);
});

rl.on('line', (data) => {
  if (data === 'exit') {
    handleExit();
    return;
  }
  writeStream.write(data);
});

rl.on('SIGINT', handleExit);
