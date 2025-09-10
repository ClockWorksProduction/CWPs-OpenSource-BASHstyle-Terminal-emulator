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
      // --- MODIFICATION START ---
    
      const extension = path.extname(entry.name).toLowerCase();
      const isBinary = ['.jpg', '.jpeg', '.png', '.gif', '.mp3', '.mp4', '.webm'].includes(extension);
    
      let fileObject;
    
      if (isBinary) {
        // For binary files, store a link, not the content.
        // The URL path should be relative to where you'll serve static assets from.
        fileObject = {
          type: 'file',
          ftype: 'link', // A new type to identify this as a link
          content: path.join('/assets', path.relative(rootDir, fullPath)).replace(/\\/g, '/'), // This is now a URL/path
        };
      } else {
        // For text files, keep the existing behavior.
        const content = fs.readFileSync(fullPath, 'utf8');
        fileObject = {
          type: 'file',
          content: content,
        };
      }
      fileSystemObject[virtualPath] = fileObject;
    
      // --- MODIFICATION END ---
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
