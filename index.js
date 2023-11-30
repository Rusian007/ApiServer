const path = require('path');
const { createServer } = require('http');
const cors = require('cors');
const express = require('express');
const { getIO, initIO } = require('./socket');
const apiRoutes = require('./api'); // Import the API routes

const app = express();

app.use('/', express.static(path.join(__dirname, 'static')));
app.use(cors());

const httpServer = createServer(app);

let port = process.env.PORT || 3500;

initIO(httpServer);

// Use the API routes
app.use(apiRoutes);

httpServer.listen(port)
console.log("Server started on ", port);

getIO();