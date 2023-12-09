/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express');
const serveStatic = require('serve-static');
const path = require('path');
const cors = require('cors');
const port = process.env.PORT || 3000;
const app = express();

app.use(cors({credentials: true, origin: true}));
app.use(serveStatic(path.join(__dirname, 'dist')));

app.get(/.*/, function(req, res) {
    res.sendFile(path.join(__dirname, 'dist', '/index.html'));
});
const server = app.listen(port);
require('./sprintPlanningSocket').socket(server);
