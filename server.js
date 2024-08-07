const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const { parse } = require('querystring');

// Utility function to read file
const readFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
};

// Utility function to write file
const writeFile = (filePath, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, data, 'utf8', (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

// Handle creating an account
const handleCreateAccount = async (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { username, password } = JSON.parse(body);

        console.log(`Received account creation request: username=${username}, password=${password}`);

        if (!/^[A-Za-z0-9]+$/.test(username) || !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,}$/.test(password)) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid username or password format.');
            return;
        }

        try {
            const data = await readFile('login.txt');
            const users = data.split('\n').filter(line => line);
            const userExists = users.some(line => line.split(':')[0] === username);

            if (userExists) {
                res.writeHead(409, { 'Content-Type': 'text/plain' });
                res.end('Username already exists.');
            } else {
                await writeFile('login.txt', data + `${username}:${password}\n`);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Account created successfully.');
            }
        } catch (error) {
            console.error(`Error handling create account request: ${error.message}`);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server error.');
        }
    });
};

// Handle user login
const handleLogin = async (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { username, password } = JSON.parse(body);

        console.log(`Received login request: username=${username}, password=${password}`);

        try {
            const data = await readFile('login.txt');
            const users = data.split('\n').filter(line => line);
            const validUser = users.some(line => {
                const [storedUsername, storedPassword] = line.split(':');
                return storedUsername === username && storedPassword === password;
            });

            if (validUser) {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Login successful.');
            } else {
                res.writeHead(401, { 'Content-Type': 'text/plain' });
                res.end('Invalid username or password.');
            }
        } catch (error) {
            console.error(`Error handling login request: ${error.message}`);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server error.');
        }
    });
};

// Handle adding pet information
const handleAddPet = async (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const petInfo = JSON.parse(body);

        console.log(`Received add pet request: ${JSON.stringify(petInfo)}`);

        try {
            const data = await readFile('pets.txt');
            const pets = data.split('\n').filter(line => line);
            const id = pets.length ? parseInt(pets[pets.length - 1].split(':')[0]) + 1 : 1;
            const petEntry = `${id}:${petInfo.owner}:${petInfo.type}:${petInfo.breed}:${petInfo.age}:${petInfo.gender}:${petInfo.getsAlongWithDogs}:${petInfo.getsAlongWithCats}:${petInfo.suitableForChildren}:${petInfo.comments}:${petInfo.email}:${petInfo.phoneNumber}\n`;

            await writeFile('pets.txt', data + petEntry);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Pet information added successfully.');
        } catch (error) {
            console.error(`Error handling add pet request: ${error.message}`);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server error.');
        }
    });
};

// Handle user logout
const handleLogout = async (req, res) => {
    console.log('Received logout request');

    // Here you would typically destroy the user session.
    // Since we are not implementing actual session management in this example,
    // we will just return a confirmation message.

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Logout successful.');
};

// Serve static files
const serveStaticFile = (res, filePath, contentType) => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
};

// Create server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (req.method === 'POST' && pathname === '/create-account') {
        handleCreateAccount(req, res);
    } else if (req.method === 'POST' && pathname === '/login') {
        handleLogin(req, res);
    } else if (req.method === 'POST' && pathname === '/add-pet') {
        handleAddPet(req, res);
    } else if (req.method === 'POST' && pathname === '/logout') {
        handleLogout(req, res);
    } else if (req.method === 'GET') {
        const filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);
        const extname = String(path.extname(filePath)).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.wav': 'audio/wav',
            '.mp4': 'video/mp4',
            '.woff': 'application/font-woff',
            '.ttf': 'application/font-ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.otf': 'application/font-otf',
            '.svg': 'application/image/svg+xml'
        };
        const contentType = mimeTypes[extname] || 'application/octet-stream';
        
        serveStaticFile(res, filePath, contentType);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found.');
    }
});

// Start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log('Server is running on http://localhost:' + port);
});
