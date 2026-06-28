const fs = require('fs');
const path = require('path');

const directories = [
  'd:/Ky 8/WDP/web/src/pages/admin',
];

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content
        .replace(/#d7ee46/g, '#9FE870')
        .replace(/#c4dc32/g, '#9FE870') // or #8ade5e, but let's stick to #9FE870
        .replace(/#cce242/g, '#9FE870')
        .replace(/#060606/g, '#062F28')
        .replace(/204,226,66/g, '159,232,112')
        .replace(/#4a7c20/gi, '#062F28')
        .replace(/#d4e0c4/gi, '#9FE870/30')
        .replace(/#f4f7ed/gi, '#9FE870/15')
        .replace(/#f0f9dc/gi, '#9FE870/15')
        .replace(/#5e6b18/gi, '#062F28')
        .replace(/#96a827/gi, '#062F28')
        .replace(/#556314/gi, '#062F28');
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

for (const dir of directories) {
  processDirectory(dir);
}
console.log('Done');
