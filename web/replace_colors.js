const fs = require('fs');
const path = require('path');

const directories = [
  'd:/Ky 8/WDP/web/src/pages/admin',
  'd:/Ky 8/WDP/web/src/pages/shared/pricing',
  'd:/Ky 8/WDP/web/src/pages/shared/vehicles',
  'd:/Ky 8/WDP/web/src/pages/shared/facilities',
  'd:/Ky 8/WDP/web/src/components/ui',
  'd:/Ky 8/WDP/web/src/pages/staff/activeSessions/tableSessions',
  'd:/Ky 8/WDP/web/src/pages/staff/exceptionsStaff/components',
  'd:/Ky 8/WDP/web/src/pages/staff/activeSessions/statisticCards'
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
        .replace(/#9FE870/g, '#d7ee46')
        .replace(/#8ade5e/g, '#c4dc32')
        .replace(/#062F28/g, '#060606')
        .replace(/159,232,112/g, '204,226,66');
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
