const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

// The project root is one directory up from where the script lives
const projectRoot = path.join(__dirname, '..');

http.createServer((req, res) => {
    console.log(`Request: ${req.method} ${req.url}`);

    let resourcePath = req.url;
    if (resourcePath === '/') {
        resourcePath = '/index.html';
    }

    let filePath;

    // Serve files from 'test' directory if they are test assets
    if (resourcePath === '/index.html' || resourcePath === '/app.js') {
        filePath = path.join(__dirname, resourcePath);
    } 
    // Serve files from the 'src' directory
    else if (resourcePath.startsWith('/src/')) {
        filePath = path.join(projectRoot, resourcePath);
    } 
    else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
        return;
    }

    // Security check to prevent accessing files outside the project folder
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(projectRoot)) {
        res.writeHead(403, { 'Content-Type': 'text/html' });
        res.end('<h1>403 Forbidden</h1>', 'utf-8');
        return;
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`<h1>404 Not Found</h1><p>The requested file ${filePath} does not exist.</p>`, 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Server Error: '+error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });

}).listen(PORT);

console.log(`Server running at http://localhost:${PORT}/`);
