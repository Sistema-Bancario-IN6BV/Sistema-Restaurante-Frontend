const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, 'src', 'features');
const targets = ['events', 'invoices', 'menuItems', 'orders'];
const exts = ['.js', '.jsx', '.ts', '.tsx'];

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walk(filepath, filelist);
    } else {
      filelist.push(filepath);
    }
  });
  return filelist;
}

function stripComments(content) {
  // Remove block comments
  let out = content.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove line comments
  out = out.replace(/(^|[^:\\])\/\/.*$/gm, '$1');
  return out;
}

let changed = 0;
let filesProcessed = 0;

targets.forEach((t) => {
  const dir = path.join(root, t);
  if (!fs.existsSync(dir)) return;
  const files = walk(dir).filter((f) => exts.includes(path.extname(f)));
  files.forEach((file) => {
    const src = fs.readFileSync(file, 'utf8');
    const stripped = stripComments(src);
    filesProcessed++;
    if (stripped !== src) {
      fs.writeFileSync(file, stripped, 'utf8');
      changed++;
      console.log('Stripped comments:', path.relative(process.cwd(), file));
    }
  });
});

console.log(`Processed ${filesProcessed} files. Modified ${changed} files.`);
