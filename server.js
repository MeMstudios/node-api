#!/usr/bin/env node
"use strict"; //for safer JavaScript
const https = require("https");
const fs = require("fs");
const app = require('./src/app');

if (process.env.NODE_ENV == 'production') {
    const options = {
        key: fs.readFileSync("/etc/letsencrypt/live/dropt.game/privkey.pem"),
        cert: fs.readFileSync("/etc/letsencrypt/live/dropt.game/cert.pem")
    };
    
    //Create the https server
    https.createServer(options, app).listen(3443);
    console.log("Server running securely on port 3443");
}
else {
    //Start the express server
    app.listen(3000, () => {
        console.log("Server running on port 3000");
    });
}