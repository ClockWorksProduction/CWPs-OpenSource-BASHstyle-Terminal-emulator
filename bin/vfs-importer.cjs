const fs = require('fs');
const path = require('path');

const [sourceDir, outputFile] = process.argv.slice(2);

if (!sourceDir || !outputFile) {
  console.error('Usage: node vfs-importer.cjs <source_directory> <output_file>');
  process.exit(1);
}

const sourceFullPath = path.resolve(sourceDir);

function traverseDir(dirPath, rootDir) {
  const fileSystemObject = {};
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const virtualPath = path.join('/', path.relative(rootDir, fullPath)).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      Object.assign(fileSystemObject, traverseDir(fullPath, rootDir));
    } else if (entry.isFile()) {
      const content = fs.readFileSync(fullPath, 'utf8');
      fileSystemObject[virtualPath] = {
        type: 'file',
        content: content,
      };
    }
  }

  return fileSystemObject;
}

try {
  if (!fs.existsSync(sourceFullPath) || !fs.lstatSync(sourceFullPath).isDirectory()) {
    throw new Error(`Source directory not found or is not a directory: ${sourceFullPath}`);
  }
  
  console.log(`Importing from "${sourceFullPath}"...`);
  const vfsData = traverseDir(sourceFullPath, sourceFullPath);
  
  fs.writeFileSync(outputFile, JSON.stringify(vfsData, null, 2));
  
  console.log(`Successfully created virtual file system at "${outputFile}"`);
} catch (error) {
  console.error('Error during VFS import:', error.message);
  process.exit(1);
}
