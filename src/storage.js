const fs = require('fs');
const path = require('path');

const storagePath = path.join(__dirname, '..', 'storage', 'data.json');

function ensureFile() {
  const dir = path.dirname(storagePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(storagePath)) {
    fs.writeFileSync(storagePath, JSON.stringify({ websites: [], captures: [] }, null, 2));
  }
}

function read() {
  ensureFile();
  const content = fs.readFileSync(storagePath, 'utf-8');
  return JSON.parse(content);
}

function write(data) {
  ensureFile();
  fs.writeFileSync(storagePath, JSON.stringify(data, null, 2));
}

module.exports = { read, write };
