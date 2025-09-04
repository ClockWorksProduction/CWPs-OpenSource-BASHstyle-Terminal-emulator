const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8081;
const projectRoot = path.join(__dirname, '..'); // Project root is one level up

http.createServer((req, res) => {
    console.log(`Request: ${req.method} ${req.url}`);

    // Normalize the URL to prevent directory traversal attacks
    const normalizedUrl = path.normalize(req.url);
    let resourcePath = path.join(projectRoot, normalizedUrl);

    // Default to index.html for root requests
    if (normalizedUrl === '/') {
        resourcePath = path.join(__dirname, 'index.html');
    }
    // Special handling for app.js relative to the test directory
    else if (normalizedUrl === '/app.js') {
        resourcePath = path.join(__dirname, 'app.js');
    }
    // For any other request, resolve it from the project root
    else {
        // Construct the path from the project root.
        // This handles both /src/index.js and ../src/index.js correctly.
        resourcePath = path.join(projectRoot, normalizedUrl);
    }

    // Security check: ensure the final path is still within the project directory
    const resolvedPath = path.resolve(resourcePath);
    if (!resolvedPath.startsWith(projectRoot)) {
        res.writeHead(403, { 'Content-Type': 'text/html' });
        res.end('<h1>403 Forbidden</h1>');
        return;
    }

    const extname = String(path.extname(resolvedPath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript', // Correct MIME type for JS modules
        '.css': 'text/css',
    };
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(resolvedPath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`<h1>404 Not Found</h1><p>The file ${resolvedPath} was not found.</p>`);
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });

}).listen(PORT);

console.log(`Server running at http://localhost:${PORT}/ - serving from ${projectRoot}`);
