const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const roots = ['src', 'public'];

function collectFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectFiles(fullPath);
    }
    if (entry.isFile() && entry.name.endsWith('.js')) {
      return [fullPath];
    }
    return [];
  });
}

const files = roots.flatMap(root => collectFiles(path.join(process.cwd(), root)));

files.forEach(file => {
  execSync(`node --check "${file}"`, { stdio: 'inherit' });
});

console.log('Syntax check completed for', files.length, 'files.');
